/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 21, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2015 The R Core Team
 *  Copyright (C) 2005-2015 The R Foundation
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 *  https://www.R-project.org/Licenses/
 *
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double rhyper(double NR, double NB, double n);
 *
 *  DESCRIPTION
 *
 *    Random variates from the hypergeometric distribution.
 *    Returns the number of white balls drawn when kk balls
 *    are drawn at random from an urn containing nn1 white
 *    and nn2 black balls.
 *
 *  REFERENCE
 *
 *    V. Kachitvichyanukul and B. Schmeiser (1985).
 *    ``Computer generation of hypergeometric random variates,''
 *    Journal of Statistical Computation and Simulation 22, 127-145.
 *
 *    The original algorithm had a bug -- R bug report PR#7314 --
 *    giving numbers slightly too small in case III h2pe
 *    where (m < 100 || ix <= 50) , see below.
 */

import {
  MATHLIB_WARNING,
  log,
  M_LN_SQRT_2PI,
  R_FINITE,
  ML_ERR_return_NAN,
  R_forceint,
  INT_MAX,
  imax2,
  imin2,
  REprintf,
  exp,
  sqrt
} from '~common';

import { rbinom } from '~binomial';

import { qhyper } from './qhyper';

import { INormal } from '~normal';

// afc(i) :=  ln( i! )	[logarithm of the factorial i]
export function afc(i: number): number {
  // If (i > 7), use Stirling's approximation, otherwise use table lookup.
  const al = [
    0.0 /*ln(0!)=ln(1)*/,
    0.0 /*ln(1!)=ln(1)*/,
    0.69314718055994530941723212145817 /*ln(2) */,
    1.7917594692280550008124773583807 /*ln(6) */,
    3.17805383034794561964694160129705 /*ln(24)*/,
    4.78749174278204599424770093452324,
    6.57925121201010099506017829290394,
    8.52516136106541430016553103634712
    /* 10.60460290274525022841722740072165, approx. value below =
           10.6046028788027; rel.error = 2.26 10^{-9}
    
          FIXME: Use constants and if(n > ..) decisions from ./stirlerr.c
          -----  will be even *faster* for n > 500 (or so)
        */
  ];

  if (i < 0) {
    MATHLIB_WARNING('rhyper.c: afc(i), i=%d < 0 -- SHOULD NOT HAPPEN!\n', i);
    return -1; // unreached
  }
  if (i <= 7) {
    return al[i];
  }
  // else i >= 8 :
  let di = i;
  let i2 = di * di;
  return (
    (di + 0.5) * log(di) -
    di +
    M_LN_SQRT_2PI +
    (0.0833333333333333 - 0.00277777777777778 / i2) / di
  );
}

//     rhyper(NR, NB, n) -- NR 'red', NB 'blue', n drawn, how many are 'red'
export function rhyper(
  nn1in: number,
  nn2in: number,
  kkin: number,
  normal: INormal
): number {
  /* extern double afc(int); */

  let nn1 = 0;
  let nn2 = 0;
  let kk = 0;
  let ix = 0; // return value (coerced to double at the very end)
  let setup1 = false;
  let setup2 = false;

  /* These should become 'thread_local globals' : */
  let ks = -1;
  let n1s = -1;
  let n2s = -1;
  let m = 0;
  let minjx = 0;
  let maxjx = 0;
  let k = 0;
  let n1 = 0;
  let n2 = 0; // <- not allowing larger integer par
  let tn = 0;

  // II :
  let w = 0;
  // III:
  let a = 0;
  let d = 0;
  let s = 0;
  let xl = 0;
  let xr = 0;
  let kl = 0;
  let kr = 0;
  let lamdl = 0;
  let lamdr = 0;
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;

  /* check parameter validity */

  if (!R_FINITE(nn1in) || !R_FINITE(nn2in) || !R_FINITE(kkin))
    return ML_ERR_return_NAN();

  nn1in = R_forceint(nn1in);
  nn2in = R_forceint(nn2in);
  kkin = R_forceint(kkin);

  if (nn1in < 0 || nn2in < 0 || kkin < 0 || kkin > nn1in + nn2in)
    return ML_ERR_return_NAN();
  if (nn1in >= INT_MAX || nn2in >= INT_MAX || kkin >= INT_MAX) {
    /* large n -- evade integer overflow (and inappropriate algorithms)
           -------- */
    // FIXME: Much faster to give rbinom() approx when appropriate; -> see Kuensch(1989)
    // Johnson, Kotz,.. p.258 (top) mention the *four* different binomial approximations
    if (kkin === 1) {
      // Bernoulli
      return rbinom(kkin, nn1in / (nn1in + nn2in), normal);
    }
    // Slow, but safe: return  F^{-1}(U)  where F(.) = phyper(.) and  U ~ U[0,1]
    return qhyper(normal.unif_rand(), nn1in, nn2in, kkin, false, false);
  }
  nn1 = nn1in;
  nn2 = nn2in;
  kk = kkin;

  /* if new parameter values, initialize */
  if (nn1 !== n1s || nn2 !== n2s) {
    setup1 = true;
    setup2 = true;
  } else if (kk !== ks) {
    setup1 = false;
    setup2 = true;
  } else {
    setup1 = false;
    setup2 = false;
  }
  if (setup1) {
    n1s = nn1;
    n2s = nn2;
    tn = nn1 + nn2;
    if (nn1 <= nn2) {
      n1 = nn1;
      n2 = nn2;
    } else {
      n1 = nn2;
      n2 = nn1;
    }
  }
  if (setup2) {
    ks = kk;
    if (kk + kk >= tn) {
      k = tn - kk;
    } else {
      k = kk;
    }
  }
  if (setup1 || setup2) {
    m = (k + 1) * (n1 + 1) / (tn + 2);
    minjx = imax2(0, k - n2);
    maxjx = imin2(n1, k);

    REprintf(
      'rhyper(nn1=%d, nn2=%d, kk=%d), setup: floor(mean)= m=%d, jx in (%d..%d)\n',
      nn1,
      nn2,
      kk,
      m,
      minjx,
      maxjx
    );
  }
  /* generate random variate --- Three basic cases */

  let goto_L_finis = false;
  if (minjx === maxjx) {
    /* I: degenerate distribution ---------------- */

    REprintf('rhyper(), branch I (degenerate)\n');

    ix = maxjx;
    goto_L_finis = true;
    //goto L_finis; // return appropriate variate
  } else if (m - minjx < 10) {
    // II: (Scaled) algorithm HIN (inverse transformation) ----
    const scale = 1e25; // scaling factor against (early) underflow
    const con = 57.5646273248511421;
    // 25*log(10) = log(scale) { <==> exp(con) == scale }
    if (setup1 || setup2) {
      let lw; // log(w);  w = exp(lw) * scale = exp(lw + log(scale)) = exp(lw + con)
      if (k < n2) {
        lw = afc(n2) + afc(n1 + n2 - k) - afc(n2 - k) - afc(n1 + n2);
      } else {
        lw = afc(n1) + afc(k) - afc(k - n2) - afc(n1 + n2);
      }
      w = exp(lw + con);
    }
    let p = 0;
    let u = 0;
    REprintf('rhyper(), branch II; w = %g > 0\n', w);

    //L10:
    let goto_L10 = false;
    while (true) {
      p = w;
      ix = minjx;
      u = normal.unif_rand() * scale;

      REprintf('  _new_ u = %g\n', u);

      while (u > p) {
        u -= p;
        p *= (n1 - ix) * (k - ix);
        ix++;
        p = p / ix / (n2 - k + ix);
        REprintf(
          '       ix=%3d, u=%11g, p=%20.14g (u-p=%g)\n',
          ix,
          u,
          p,
          u - p
        );
        if (ix > maxjx) {
          goto_L10 = true;
          break;
          //goto L10;
          // FIXME  if(p == 0.)  we also "have lost"  => goto L10
        }
      }
      if (!goto_L10) {
        break;
      }
    }
  } else {
    /* III : H2PE Algorithm --------------------------------------- */
    // never used??
    //let u = 0;
    // let v = 0;

    if (setup1 || setup2) {
      s = sqrt((tn - k) * k * n1 * n2 / (tn - 1) / tn / tn);

      /* remark: d is defined in reference without int. */
      /* the truncation centers the cell boundaries at 0.5 */

      d = 1.5 * s + 0.5;
      xl = m - d + 0.5;
      xr = m + d + 0.5;
      a = afc(m) + afc(n1 - m) + afc(k - m) + afc(n2 - k + m);
      kl = exp(a - afc(xl) - afc(n1 - xl) - afc(k - xl) - afc(n2 - k + xl));
      kr = exp(
        a -
          afc(xr - 1) -
          afc(n1 - xr + 1) -
          afc(k - xr + 1) -
          afc(n2 - k + xr - 1)
      );
      lamdl = -log(xl * (n2 - k + xl) / (n1 - xl + 1) / (k - xl + 1));
      lamdr = -log((n1 - xr + 1) * (k - xr + 1) / xr / (n2 - k + xr));
      p1 = d + d;
      p2 = p1 + kl / lamdl;
      p3 = p2 + kr / lamdr;
    }

    REprintf(
      'rhyper(), branch III {accept/reject}: (xl,xr)= (%g,%g); (lamdl,lamdr)= (%g,%g)\n',
      xl,
      xr,
      lamdl,
      lamdr
    );
    REprintf('-------- p123= c(%g,%g,%g)\n', p1, p2, p3);

    let n_uv = 0;
    //L30:
    let goto_L30 = false;
    while (true) {
      let u = normal.unif_rand() * p3;
      let v = normal.unif_rand();
      n_uv++;
      if (n_uv >= 10000) {
        REprintf('rhyper() branch III: giving up after %d rejections', n_uv);
        return ML_ERR_return_NAN();
      }

      REprintf(' ... L30: new (u=%g, v ~ U[0,1])[%d]\n', u, n_uv);

      if (u < p1) {
        /* rectangular region */
        ix = xl + u;
      } else if (u <= p2) {
        /* left tail */
        ix = xl + log(v) / lamdl;
        if (ix < minjx) {
          goto_L30 = true;
          continue;
          //goto L30;
        }
        v = v * (u - p1) * lamdl;
      } else {
        /* right tail */
        ix = xr - log(v) / lamdr;
        if (ix > maxjx) {
          goto_L30 = true;
          continue;
          //goto L30;
        }
        v = v * (u - p2) * lamdr;
      }

      /* acceptance/rejection test */
      let reject = true;

      if (m < 100 || ix <= 50) {
        /* explicit evaluation */
        /* The original algorithm (and TOMS 668) have
                   f = f * i * (n2 - k + i) / (n1 - i) / (k - i);
                   in the (m > ix) case, but the definition of the
                   recurrence relation on p134 shows that the +1 is
                   needed. */
        let i;
        let f = 1.0;
        if (m < ix) {
          for (i = m + 1; i <= ix; i++)
            f = f * (n1 - i + 1) * (k - i + 1) / (n2 - k + i) / i;
        } else if (m > ix) {
          for (i = ix + 1; i <= m; i++)
            f = f * i * (n2 - k + i) / (n1 - i + 1) / (k - i + 1);
        }
        if (v <= f) {
          reject = false;
        }
      } else {
        const deltal = 0.0078;
        const deltau = 0.0034;

        let e;
        let g;
        let r;
        let t;
        let y;
        let de;
        let dg;
        let dr;
        let ds;
        let dt;
        let gl;
        let gu;
        let nk;
        let nm;
        let ub;
        let xk;
        let xm;
        let xn;
        let y1;
        let ym;
        let yn;
        let yk;
        let alv;

        REprintf(" ... accept/reject 'large' case v=%g\n", v);

        /* squeeze using upper and lower bounds */
        y = ix;
        y1 = y + 1.0;
        ym = y - m;
        yn = n1 - y + 1.0;
        yk = k - y + 1.0;
        nk = n2 - k + y1;
        r = -ym / y1;
        s = ym / yn;
        t = ym / yk;
        e = -ym / nk;
        g = yn * yk / (y1 * nk) - 1.0;
        dg = 1.0;
        if (g < 0.0) dg = 1.0 + g;
        gu = g * (1.0 + g * (-0.5 + g / 3.0));
        gl = gu - 0.25 * (g * g * g * g) / dg;
        xm = m + 0.5;
        xn = n1 - m + 0.5;
        xk = k - m + 0.5;
        nm = n2 - k + xm;
        ub =
          y * gu -
          m * gl +
          deltau +
          xm * r * (1 + r * (-0.5 + r / 3.0)) +
          xn * s * (1 + s * (-0.5 + s / 3.0)) +
          xk * t * (1 + t * (-0.5 + t / 3.0)) +
          nm * e * (1 + e * (-0.5 + e / 3.0));
        /* test against upper bound */
        alv = log(v);
        if (alv > ub) {
          reject = true;
        } else {
          /* test against lower bound */
          dr = xm * (r * r * r * r);
          if (r < 0.0) dr /= 1.0 + r;
          ds = xn * (s * s * s * s);
          if (s < 0.0) ds /= 1.0 + s;
          dt = xk * (t * t * t * t);
          if (t < 0.0) dt /= 1.0 + t;
          de = nm * (e * e * e * e);
          if (e < 0.0) de /= 1.0 + e;
          if (
            alv <
            ub - 0.25 * (dr + ds + dt + de) + (y + m) * (gl - gu) - deltal
          ) {
            reject = false;
          } else {
            /** Stirling's formula to machine accuracy
             */
            if (
              alv <=
              a - afc(ix) - afc(n1 - ix) - afc(k - ix) - afc(n2 - k + ix)
            ) {
              reject = false;
            } else {
              reject = true;
            }
          }
        }
      } // else
      if (reject) {
        goto_L30 = true;
        continue;
      }
      break;
    } // for the goto_L30
  }

  //L_finis:
  /* return appropriate variate */

  if (kk + kk >= tn) {
    if (nn1 > nn2) {
      ix = kk - nn2 + ix;
    } else {
      ix = nn1 - ix;
    }
  } else {
    if (nn1 > nn2) ix = kk - ix;
  }
  return ix;
}
