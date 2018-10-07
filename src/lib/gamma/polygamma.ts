/* This is a conversion from LIB-R-MATH to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import * as debug from 'debug';
import {
  DBL_MANT_DIG,
  DBL_MAX_EXP,
  DBL_MIN_EXP,
  imin2,
  M_LOG10_2,
  R_pow_di
} from '../common/_general';
import { NumberW } from '../common/toms708';
import { map, multiplexer } from '../r-func';

const printer = debug('dpsifn');

const {
  NaN: ML_NAN,
  POSITIVE_INFINITY: ML_POSINF,
  isNaN: ISNAN,
  EPSILON: DBL_EPSILON
} = Number;

const n_max = 100;

const {
  pow,
  abs: fabs,
  max: fmax2,
  min: fmin2,
  exp,
  log,
  sin,
  cos,
  PI: M_PI,
  round,
  round: R_forceint
} = Math;

/* From R, currently only used for kode = 1, m = 1 : */
function dpsifn(
  x: number,
  n: number,
  kode: number,
  m: number,
  ans: number[],
  nz: NumberW,
  ierr: NumberW
): void {
  const bvalues = [
    /* Bernoulli Numbers */
    1.0,
    -5.0e-1,
    1.66666666666666667e-1,
    -3.33333333333333333e-2,
    2.38095238095238095e-2,
    -3.33333333333333333e-2,
    7.57575757575757576e-2,
    -2.53113553113553114e-1,
    1.16666666666666667,
    -7.09215686274509804,
    5.49711779448621554e1,
    -5.29124242424242424e2,
    6.1921231884057971e3,
    -8.65802531135531136e4,
    1.42551716666666667e6,
    -2.7298231067816092e7,
    6.01580873900642368e8,
    -1.51163157670921569e10,
    4.29614643061166667e11,
    -1.37116552050883328e13,
    4.88332318973593167e14,
    -1.92965793419400681e16
  ];
  //  ints
  let nx: number;
  let xinc = 0 as number;
  let xdmln = 0 as number;
  let i; //i
  let j; //j
  let k; //k
  let mm; //mm
  let mx; //mx
  let nn; //nn
  let np; //np
  let fn; //fn

  //double
  let arg;
  let den;
  let elim;
  let eps;
  let fln;
  let fx;
  let rln;
  let rxsq;
  let r1m4;
  let r1m5;
  let s;
  let slope;
  let t;
  let ta;
  let tk;
  let tol;
  let tols;
  let tss;
  let tst;
  let tt;
  let t1;
  let t2;
  let wdtol;
  let xdmy = 0;
  let xln = 0.0; /* -Wall */
  let xm;
  let xmin;
  let xq;
  let yint;
  // array
  let trm = new Array(23).fill(0);

  let trmr = new Array(n_max + 1).fill(0);

  ierr.val = 0;

  if (n < 0 || kode < 1 || kode > 2 || m < 1) {
    ierr.val = 1;
    return;
  }

  if (x <= 0) {
    /* use	Abramowitz & Stegun 6.4.7 "Reflection Formula"
         *	psi(k, x) = (-1)^k psi(k, 1-x)	-  pi^{n+1} (d/dx)^n cot(x)
         */
    if (x === round(x)) {
      /* non-positive integer : +Inf or NaN depends on n */
      for (j = 0; j < m; j++ /* k = j + n : */)
        ans[j] = (j + n) % 2 ? ML_POSINF : ML_NAN;
      return;
    }
    /* This could cancel badly */
    dpsifn(1 - x, n, /*kode = */ 1, m, ans, nz, ierr);
    /* ans[j] === (-1)^(k+1) / gamma(k+1) * psi(k, 1 - x)
         *	     for j = 0:(m-1) ,	k = n + j
         */

    /* Cheat for now: only work for	 m = 1, n in {0,1,2,3} : */
    if (m > 1 || n > 3) {
      /* doesn't happen for digamma() .. pentagamma() */
      /* not yet implemented */
      ierr.val = 4;
      return;
    }
    x *= M_PI; /* pi * x */
    if (n === 0) tt = cos(x) / sin(x);
    else if (n === 1) tt = -1 / R_pow_di(sin(x), 2);
    else if (n === 2) tt = 2 * cos(x) / R_pow_di(sin(x), 3);
    else if (n === 3)
      tt =
        -2 *
        (2 * R_pow_di(cos(x), 2) + 1) /
        R_pow_di(sin(x), 4); /* can not happen! */
    else tt = ML_NAN;
    /* end cheat */

    s = n % 2 ? -1 : 1; /* s = (-1)^n */
    /* t := pi^(n+1) * d_n(x) / gamma(n+1)	, where
         *		   d_n(x) := (d/dx)^n cot(x)*/
    t1 = t2 = s = 1;
    for (k = 0, j = k - n; j < m; k++ , j++ , s = -s) {
      /* k === n+j , s = (-1)^k */
      t1 *= M_PI; /* t1 === pi^(k+1) */
      if (k >= 2) t2 *= k; /* t2 === k! === gamma(k+1) */
      if (j >= 0)
        /* by cheat above,  tt === d_k(x) */
        ans[j] = s * (ans[j] + t1 / t2 * tt);
    }
    if (n === 0 && kode === 2)
      /* unused from R, but "wrong": xln === 0 :*/
      ans[0] += xln;
    return;
  } /* x <= 0 */

  /* else :  x > 0 */
  nz.val = 0;
  xln = log(x);
  if (kode === 1 && m === 1) {
    /* the R case  ---  for very large x: */
    let lrg = 1 / (2 * DBL_EPSILON);
    if (n === 0 && x * xln > lrg) {
      ans[0] = -xln;
      return;
    } else if (n >= 1 && x > n * lrg) {
      ans[0] = exp(-n * xln) / n; /* === x^-n / n  ===  1/(n * x^n) */
      return;
    }
  }
  mm = m;
  nx = imin2(-DBL_MIN_EXP, DBL_MAX_EXP); /* = 1021 */
  r1m5 = M_LOG10_2;
  r1m4 = Number.EPSILON * 0.5;
  wdtol = fmax2(r1m4, 0.5e-18); /* 1.11e-16 */

  /* elim = approximate exponential over and underflow limit */
  elim = 2.302 * (nx * r1m5 - 3.0); /* = 700.6174... */

  let L10 = false; // goto flag
  let L20 = false;
  let L30 = false;

  while (true) {
    nn = n + mm - 1;
    fn = nn;
    t = (fn + 1) * xln;

    /* overflow and underflow test for small and large x */

    if (fabs(t) > elim) {
      if (t <= 0.0) {
        nz.val = 0;
        ierr.val = 2;
        return;
      }
    } else {
      if (x < wdtol) {
        ans[0] = R_pow_di(x, -n - 1);
        if (mm !== 1) {
          for (k = 1; k < mm; k++) ans[k] = ans[k - 1] / x;
        }
        if (n === 0 && kode === 2) ans[0] += xln;
        return;
      }

      /* compute xmin and the number of terms of the series,  fln+1 */

      rln = r1m5 * DBL_MANT_DIG;
      rln = fmin2(rln, 18.06);
      fln = fmax2(rln, 3.0) - 3.0;
      yint = 3.5 + 0.4 * fln;
      slope = 0.21 + fln * (0.0006038 * fln + 0.008677);
      xm = yint + slope * fn;
      mx = (xm >> 0) + 1;
      xmin = mx;
      //
      if (n !== 0) {
        xm = -2.302 * rln - fmin2(0.0, xln);
        arg = xm / n;
        arg = fmin2(0.0, arg);
        eps = exp(arg);
        xm = 1.0 - eps;
        if (fabs(arg) < 1.0e-3) xm = -arg;
        fln = x * xm / eps;
        xm = xmin - x;
        if (xm > 7.0 && fln < 15.0) break;
      }
      xdmy = x;
      xdmln = xln;
      xinc = 0.0;
      if (x < xmin) {
        nx = x >> 0;
        xinc = xmin - nx;
        xdmy = x + xinc;
        xdmln = log(xdmy);
      }

      /* generate w(n+mm-1, x) by the asymptotic expansion */

      t = fn * xdmln;
      t1 = xdmln + xdmln;
      t2 = t + xdmln;
      tk = fmax2(fabs(t), fmax2(fabs(t1), fabs(t2)));
      if (tk <= elim) {
        /* for all but large x */
        L10 = true;
        break;
      } // if
    } // if else
    nz.val++; /* underflow */
    mm--;
    ans[mm] = 0;
    if (mm === 0) {
      return;
    }
  } /* end{for()} */
  if (!L10) {
    nn = (fln >> 0) + 1;
    np = n + 1;
    t1 = (n + 1) * xln;
    t = exp(-t1);
    s = t;
    den = x;
    for (i = 1; i <= nn; i++) {
      den += 1;
      trm[i] = pow(den, -np);
      s += trm[i];
    }
    ans[0] = s;
    if (n === 0 && kode === 2) ans[0] = s + xln;

    if (mm !== 1) {
      /* generate higher derivatives, j > n */

      tol = wdtol / 5.0;
      for (j = 1; j < mm; j++) {
        t /= x;
        s = t;
        tols = t * tol;
        den = x;
        for (i = 1; i <= nn; i++) {
          den += 1;
          trm[i] /= den;
          s += trm[i];
          if (trm[i] < tols) break;
        } //for
        ans[j] = s;
      } //for
    }
    return;
  }
  //L10:
  tss = exp(-t);
  tt = 0.5 / xdmy;
  t1 = tt;
  tst = wdtol * tt;
  if (nn !== 0) t1 = tt + 1.0 / fn;
  rxsq = 1.0 / (xdmy * xdmy);
  ta = 0.5 * rxsq;
  t = (fn + 1) * ta;
  s = t * bvalues[2];
  //

  if (fabs(s) >= tst) {
    tk = 2.0;
    for (k = 4; k <= 22; k++) {
      t = t * ((tk + fn + 1) / (tk + 1.0)) * ((tk + fn) / (tk + 2.0)) * rxsq;
      trm[k] = t * bvalues[k - 1];
      if (fabs(trm[k]) < tst) break;
      s += trm[k];
      tk += 2;
    } //for
  } //if
  s = (s + t1) * tss;
  // while (true) is a goto capture
  while (true) {
    if (xinc !== 0.0) {
      /* backward recur from xdmy to x */

      nx = xinc >> 0;
      np = nn + 1;
      if (nx > n_max) {
        nz.val = 0;
        ierr.val = 3;
        return;
      } else {
        if (nn === 0) {
          L20 = true;
          break;
        }
        xm = xinc - 1.0;
        fx = x + xm;

        /* this loop should not be changed. fx is accurate when x is small */
        for (i = 1; i <= nx; i++) {
          trmr[i] = pow(fx, -np);
          s += trmr[i];
          xm -= 1;
          fx = x + xm;
        }
      }
    }

    ans[mm - 1] = s;
    if (fn === 0) {
      L30 = true;
      break;
    }
    /* generate lower derivatives,  j < n+mm-1 */
    for (j = 2; j <= mm; j++) {
      fn--;
      tss *= xdmy;
      t1 = tt;
      if (fn !== 0) t1 = tt + 1.0 / fn;
      t = (fn + 1) * ta;
      s = t * bvalues[2];
      if (fabs(s) >= tst) {
        tk = 4 + fn;
        for (k = 4; k <= 22; k++) {
          trm[k] = trm[k] * (fn + 1) / tk;
          if (fabs(trm[k]) < tst) break;
          s += trm[k];
          tk += 2;
        }
      }
      s = (s + t1) * tss;
      if (xinc !== 0.0) {
        if (fn === 0) {
          L20 = true;
          break;
        }
        xm = xinc - 1.0;
        fx = x + xm;
        for (i = 1; i <= nx; i++) {
          trmr[i] = trmr[i] * fx;
          s += trmr[i];
          xm -= 1;
          fx = x + xm;
        }
      }
      ans[mm - j] = s;
      if (fn === 0) {
        L30 = true;
        break;
        //goto L30;
      }
    } //for
    return;
  } // goto capture end
  //L20:
  printer(L20 ? 'goto L20 was set!' : 'goto L20 was not set');

  if (!L30) {
    for (i = 1; i <= nx; i++) {
      s += 1 / (x + (nx - i));
      /* avoid disastrous cancellation, PR#13714 */
    }
  }
  //L30:
  if (kode !== 2)
    /* always */
    ans[0] = s - xdmln;
  else if (xdmy !== x) {
    xq = xdmy / x;
    ans[0] = s - log(xq);
  }
  return;
} /* dpsifn() */

/*
#ifdef MATHLIB_STANDALONE
# define ML_TREAT_psigam(_IERR_)	\
    if(_IERR_ !== 0) {			\
    errno = EDOM;			\
    return ML_NAN;			\
    }
#else
# define ML_TREAT_psigam(_IERR_)	\
    if(_IERR_ !== 0)			\
    return ML_NAN
#endif
*/
const print_psigamma = debug('psigamma');

export function psigamma(_x: number | number[], _deriv: number | number[] = 0): number | number[] {
  /* n-th derivative of psi(x);  e.g., psigamma(x,0) === digamma(x) */
  // double
  let ans = [0];
  // ints
  let nz = new NumberW();
  let ierr = new NumberW();
  return multiplexer(_x, _deriv)((x, deriv) => {
    let k;
    let n;
    nz.val = 0;
    ierr.val = 0;
    ans[0] = 0;

    if (ISNAN(x)) return x;
    deriv = R_forceint(deriv);
    n = deriv >> 0;
    if (n > n_max) {
      print_psigamma('"deriv = %d > %d (= n_max)', n, n_max);
      return ML_NAN;
    }
    dpsifn(x, n, 1, 1, ans, nz, ierr);
    if (ierr.val !== 0) {
      return ML_NAN;
    }

    /* Now, ans ===  A := (-1)^(n+1) / gamma(n+1) * psi(n, x) */
    ans[0] = -ans[0]; /* = (-1)^(0+1) * gamma(0+1) * A */
    for (k = 1; k <= n; k++) ans[0] *= -k; /* = (-1)^(k+1) * gamma(k+1) * A */
    return ans[0]; /* = psi(n, x) */
  });
}

//https://commons.wikimedia.org/wiki/File:Digamma_function_plot.png

export function digamma(_x: number | number): number | number[] {
  let ans = [0];
  let nz = new NumberW();
  let ierr = new NumberW();

  return map(_x)(x => {
    ans[0] = 0;
    nz.val = 0;
    ierr.val = 0;
    if (ISNAN(x)) return x;
    dpsifn(x, 0, 1, 1, ans, nz, ierr);
    if (ierr.val !== 0) {
      return ML_NAN;
    }
    return -ans[0];
  });
}

//https://commons.wikimedia.org/wiki/Category:Polygamma_function#/media/File:Trigamma_function_plot.png

export function trigamma(_x: number | number[]): number | number[] {
  let ans = [0];
  let nz = new NumberW(0);
  let ierr = new NumberW(0);

  return map(_x)(x => {
    ans[0] = 0;
    nz.val = 0;
    ierr.val = 0;

    if (ISNAN(x)) return x;
    dpsifn(x, 1, 1, 1, ans, nz, ierr);
    if (ierr.val !== 0) {
      return ML_NAN;
    }
    return ans[0];
  });
}
//https://commons.wikimedia.org/wiki/Category:Polygamma_function#/media/File:Tetragamma_function_plot.png
export function tetragamma(_x: number | number[]): number | number[] {
  let ans = [0];
  let nz = new NumberW();
  let ierr = new NumberW();
  return map(_x)(x => {
    ans[0] = 0;
    nz.val = 0;
    ierr.val = 0;

    if (ISNAN(x)) return x;
    dpsifn(x, 2, 1, 1, ans, nz, ierr);
    if (ierr.val !== 0) {
      return ML_NAN;
    }
    return -2.0 * ans[0];
  });
}
// replaced by psigamma function
export function pentagamma(_x: number): number {
  let ans = [0];
  let nz = new NumberW();
  let ierr = new NumberW();
  return map(_x)(x => {
    ans[0] = 0;
    nz.val = 0;
    ierr.val = 0;

    if (ISNAN(x)) return x;
    dpsifn(x, 3, 1, 1, ans, nz, ierr);
    if (ierr.val !== 0) {
      return ML_NAN;
    }
    return 6.0 * ans[0];
  });
}
