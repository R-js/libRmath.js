/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 10, 2017
 * 
 *  ORIGINAL AUTHOR:
 *  Martin Maechler, ETH Zurich
 * 
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998-2015 Ross Ihaka and the R Core team.
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
 */

/*  DESCRIPTION --> see below */

/* From http://www.netlib.org/specfun/rjbesl	Fortran translated by f2c,...
 *	------------------------------=#----	Martin Maechler, ETH Zurich
 * Additional code for nu == alpha < 0  MM
 */
import * as debug from 'debug';
const {
  max: fmax2,
  sqrt,
  abs: fabs,
  trunc,
  floor,
  min: min0,
  sin,
  cos,
  pow,
  round
} = Math;
const { isNaN: ISNAN, NaN: ML_NAN } = Number;

const nsig_BESS = 16;
const ensig_BESS = 1e16;
const rtnsig_BESS = 1e-4;
const enmten_BESS = 8.9e-308;
const enten_BESS = 1e308;
const xlrg_BESS_IJ = 1e5;

import { ML_ERROR, ME } from '../common/_general';

import { cospi } from '../trigonometry/cospi';
import { sinpi } from '../trigonometry/sinpi';

//import { bessel_y, bessel_y_ex } from './bessel_y';

import { Rf_gamma_cody } from '../gamma/gamma_cody';

export interface JBesselProperties {
  x: number;
  alpha: number;
  nb: number;
  b: number[];
  ncalc: number;
}

// unused now from R
const printer_bessel_j = debug('bessel_j');

export function bessel_j(x: number, alpha: number): number {
  /* NaNs propagated correctly */
  if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_j', printer_bessel_j);
    return NaN;
  }
  if (alpha < 0) {
    throw 'stop';
    /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
    /*return (
      (alpha - na === 0.5 ? 0 : bessel_j(x, -alpha) * cospi(alpha)) +
      (alpha === na ? 0 : bessel_y(x, -alpha) * sinpi(alpha))
    );*/
  } else if (alpha > 1e7) {
    printer_bessel_j(
      'besselJ(x, nu): nu=%d too large for bessel_j() algorithm',
      alpha
    );
    return NaN;
  }
  //positive alpha
  //let nb = floor(alpha) + 1; /* nb-1 <= alpha < nb */
  //alpha -= floor(alpha); // ==> alpha' in [0, 1)
  //const bj = new Array<number>(nb).fill(0);
  //let ncalc = 0;
  let bj: number[];
  let ncalc: number;
  let nb: number;

  ({ x, alpha, b: bj, nb, ncalc } = J_bessel({
    x,
    alpha: alpha - floor(alpha),
    nb: floor(alpha) + 1,
    b: new Array(floor(alpha + 1)).fill(0),
    ncalc: 0
  }));
  if (ncalc !== nb) {
    /* error input */
    if (ncalc < 0)
      printer_bessel_j(
        'bessel_j(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?',
        x,
        ncalc,
        nb,
        alpha
      );
    else
      printer_bessel_j(
        'bessel_j(%d,nu=%d): precision lost in result',
        x,
        alpha + nb - 1
      );
  }
  x = bj[nb - 1];
  return x;
}

/* Called from R: modified version of bessel_j(), accepting a work array
 * instead of allocating one. */
const printer_bessel_j_ex = debug('bessel_j_ex');

// for negative 'alpha'
export function bessel_j_ex(x: number, alpha: number, bj: number[]): number {
  /* NaNs propagated correctly */
  if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_j', printer_bessel_j_ex);
    return ML_NAN;
  }

  if (alpha < 0) {
    throw 'stop2';
    /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
    /*return (
      (alpha - na === 0.5 ? 0 : bessel_j_ex(x, -alpha, bj) * cospi(alpha)) +
      (alpha === na ? 0 : bessel_y_ex(x, -alpha, bj) * sinpi(alpha))
    );*/
  } else if (alpha > 1e7) {
    printer_bessel_j_ex(
      'besselJ(x, nu): nu=%d too large for bessel_j() algorithm',
      alpha
    );
    return ML_NAN;
  }

  let ncalc: number;
  let nb: number;
  // NOTE: "bj" comes here as a function argument

  ({ x, alpha, b: bj, nb, ncalc } = J_bessel({
    x,
    alpha: alpha - trunc(alpha),
    nb: trunc(alpha) + 1,
    b: new Array(trunc(alpha) + 1).fill(0),
    ncalc: 0
  }));

  if (ncalc !== nb) {
    /* error input */
    if (ncalc < 0)
      printer_bessel_j_ex(
        'bessel_j(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?',
        x,
        ncalc,
        nb,
        alpha
      );
    else
      printer_bessel_j_ex(
        'bessel_j(%d,nu=%d): precision lost in result',
        x,
        alpha + nb - 1
      );
  }
  x = bj[nb - 1];
  return x;
}

const printer_J_bessel = debug('J_bessel');

function J_bessel(props: JBesselProperties): JBesselProperties {
  /*
  interface JBesselProperties {
  x: number;
  alpha: number;
  nb: number;
  b: number[];
  ncalc: number;
}

         Calculates Bessel functions J_{n+alpha} (x)
         for non-negative argument x, and non-negative order n+alpha, n = 0,1,..,nb-1.
        
          Explanation of variables in the calling sequence.
        
         X     - Non-negative argument for which J's are to be calculated.
         ALPHA - Fractional part of order for which
             J's are to be calculated.  0 <= ALPHA < 1.
         NB    - Number of functions to be calculated, NB >= 1.
             The first function calculated is of order ALPHA, and the
             last is of order (NB - 1 + ALPHA).
         B     - Output vector of length NB.  If RJBESL
             terminates normally (NCALC=NB), the vector B contains the
             functions J/ALPHA/(X) through J/NB-1+ALPHA/(X).
         NCALC - Output variable indicating possible errors.
             Before using the vector B, the user should check that
             NCALC=NB, i.e., all orders have been calculated to
             the desired accuracy.	See the following
        
             ****************************************************************
        
         Error return codes
        
            In case of an error,  NCALC != NB, and not all J's are
            calculated to the desired accuracy.
        
            NCALC < 0:	An argument is out of range. For example,
               NBES <= 0, ALPHA < 0 or > 1, or X is too large.
               In this case, b[1] is set to zero, the remainder of the
               B-vector is not calculated, and NCALC is set to
               MIN(NB,0)-1 so that NCALC != NB.
        
            NB > NCALC > 0: Not all requested function values could
               be calculated accurately.  This usually occurs because NB is
               much larger than ABS(X).	 In this case, b[N] is calculated
               to the desired accuracy for N <= NCALC, but precision
               is lost for NCALC < N <= NB.  If b[N] does not vanish
               for N > NCALC (because it is too small to be represented),
               and b[N]/b[NCALC] = 10^(-K), then only the first NSIG - K
               significant figures of b[N] can be trusted.
        
        
          Acknowledgement
        
            This program is based on a program written by David J. Sookne
            (2) that computes values of the Bessel functions J or I of float
            argument and long order.  Modifications include the restriction
            of the computation to the J Bessel function of non-negative float
            argument, the extension of the computation to arbitrary positive
            order, and the elimination of most underflow.
        
          References:
        
            Olver, F.W.J., and Sookne, D.J. (1972)
            "A Note on Backward Recurrence Algorithms";
            Math. Comp. 26, 941-947.
        
            Sookne, D.J. (1973)
            "Bessel Functions of Real Argument and Integer Order";
            NBS Jour. of Res. B. 77B, 125-132.
        
          Latest modification: March 19, 1990
        
          Author: W. J. Cody
              Applied Mathematics Division
              Argonne National Laboratory
              Argonne, IL  60439
         *******************************************************************
         */

  /* Parameter adjustment */
  // pointer adjusted??
  //--b;

  let { nb, x, ncalc, alpha: nu, b, alpha } = props;
  let twonu = nu + nu;

  /*-------------------------------------------------------------------
      Check for out of range arguments.
      -------------------------------------------------------------------*/
  printer_J_bessel('params: nb:%d, x:%d, nu:%d', nb, x, nu);
  if (!(nb > 0 && x >= 0 && 0 <= nu && nu < 1)) {
    /* Error return -- X, NB, or ALPHA is out of range : */
    ML_ERROR(ME.ME_RANGE, 'J_bessel, alpha out of range', printer_J_bessel);
    b[0] = 0;
    ncalc = min0(nb, 0) - 1;
    return { x, ncalc, alpha, nb, b };
  }

  ncalc = nb;
  if (x > xlrg_BESS_IJ) {
    ML_ERROR(ME.ME_RANGE, "J_bessel x > 100'000", printer_J_bessel);
    /* indeed, the limit is 0,
     * but the cutoff happens too early 
     * */
    for (let i = 1; i <= nb; i++) {
      b[i - 1] = 0; //was ML_POSINF (really nonsense)
    }
    printer_J_bessel('return: %o', props);
    return { x, ncalc, alpha, nb, b };
  }

  /* Initialize result array to zero. */
  b.fill(0);

  /*
  ===================================================================
   Branch into  3 cases :
   1) use 2-term ascending series for small X
   2) use asymptotic form for large X when NB is not too large
   3) use recursion otherwise
  ===================================================================
  */

  if (x < rtnsig_BESS /* 0.0001 */) {
    bessel_j_small_x({ x, alpha, b, nb, ncalc });
    printer_J_bessel(
      'small strategy for x, because x[%d] < %d',
      x,
      rtnsig_BESS
    );
    return bessel_j_small_x({ x, alpha, b, nb, ncalc });
  }

  const intx = trunc(x);
  if (x > 25 && nb <= intx + 1) {
    printer_J_bessel(
      'Choose asymptotic series x[%d] > 25 nb[%d] <= (intx +1) %d',
      nb,
      intx + 1
    );
    return bessel_j_assymptotic_large_x({ x, alpha, b, nb, ncalc });
  }
  //Evertything else here

  props = bessel_j_recurrence(props);
  printer_J_bessel('recurrence %o', props);
  return props;
}

const printer_bessel_j_recurrence = debug('bessel_j_recurrence');
function bessel_j_recurrence(props: JBesselProperties): JBesselProperties {
  /* rtnsig_BESS <= x && ( x <= 25 || int x+1 < *nb ) :
       --------------------------------------------------------
               Use recurrence to generate results.
               First initialize the calculation of P*S.
       -------------------------------------------------------- */
  let { nb, x, ncalc, alpha: nu, b, alpha } = props;
  let twonu = nu + nu;

  printer_bessel_j_recurrence('recurrence selected:%d', props);

  const intx = trunc(x);

  let nbmx = trunc(nb - intx);

  let n = intx + 1;

  let en = 2 * n + twonu;
  let plast = 1;
  let p = en / x;

  /* ---------------------------------------------------
            Calculate general significance test.
           --------------------------------------------------- */
  let test = ensig_BESS + ensig_BESS;

  let sum: number;
  let alp2em;
  let alpem;
  let pold;
  let psave;
  let psavel;
  let gotos: string | undefined;
  if (nbmx >= 3) {
    /* ------------------------------------------------------------
              Calculate P*S until N = NB-1.  Check for possible overflow.
             ---------------------------------------------------------- */
    let tover = 1e292; // enten_BESS / ensig_BESS;
    let nstart = intx + 2;
    let nend = nb - 1;
    let en = nstart + nstart - 2 + twonu;

    gotos = (function() {
      for (let k = nstart; k <= nend; ++k) {
        n = k;
        en += 2;
        pold = plast;
        plast = p;
        p = en * plast / x - pold;
        if (p > tover) {
          /* -------------------------------------------
                    To avoid overflow, divide P*S by TOVER.
                    Calculate P*S until ABS(P) > 1.
                 -------------------------------------------*/
          tover = enten_BESS;
          p /= tover;
          plast /= tover;
          let psave = p;
          let psavel = plast;
          nstart = n + 1;
          do {
            ++n;
            en += 2;
            pold = plast;
            plast = p;
            p = en * plast / x - pold;
          } while (p <= 1);

          let bb = en / x;
          /* -----------------------------------------------
                   Calculate backward test and find NCALC,
                   the highest N such that the test is passed.
                 ----------------------------------------------- */
          test = pold * plast * (0.5 - 0.5 / (bb * bb));
          test /= ensig_BESS;
          p = plast * tover;
          --n;
          en -= 2;
          nend = min0(nb, n);
          for (let l = nstart; l <= nend; ++l) {
            pold = psavel;
            psavel = psave;
            psave = en * psavel / x - pold;
            if (psave * psavel > test) {
              ncalc = l - 1;
              printer_bessel_j_recurrence('goto L190');
              return 'L190'; //goto L190;
            }
          }
          ncalc = nend;
          return 'L190';
        } // if
      } // for
      return undefined;
    })();

    if (gotos === undefined) {
      n = nend;
      en = n + n + twonu;
      /* -----------------------------------------------------
               Calculate special significance test for NBMX > 2.
             -----------------------------------------------------*/
      test = fmax2(test, sqrt(plast * ensig_BESS) * sqrt(p + p));
    }
  } // if
  /* 
             ------------------------------------------------
             Calculate P*S until significance test passes. 
           */
  if (gotos === undefined) {
    do {
      ++n;
      en += 2;
      let pold = plast;
      plast = p;
      p = en * plast / x - pold;
    } while (p < test);
  }
  //L190:
  /*---------------------------------------------------------------
                   Initialize the backward recursion and the normalization sum.
                   --------------------------------------------------------------- */
  ++n;
  en += 2;
  let bb = 0;
  let aa = 1 / p;
  let m = n / 2;
  let em = m;
  m =
    n * 2 -
    m *
      4; /* = 2 n - 4 (n/2)
                            = 0 for even, 2 for odd n */
  if (m === 0) {
    sum = 0;
  } else {
    alpem = em - 1 + nu;
    alp2em = em + em + nu;
    sum = aa * alpem * alp2em / em;
  }
  let nend = n - nb;
  /* if (nend > 0) */
  /* --------------------------------------------------------
                    Recur backward via difference equation, calculating
                    (but not storing) b[N], until N = NB.
                    -------------------------------------------------------- */
  for (let l = 1; l <= nend; ++l) {
    --n;
    en -= 2;
    let cc = bb;
    bb = aa;
    aa = en * bb / x - cc;
    m = m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
    if (m !== 0) {
      em -= 1;
      alp2em = em + em + nu;
      if (n === 1) {
        break;
      }
      alpem = em - 1 + nu;
      if (alpem === 0) {
        alpem = 1;
      }
      sum = (sum + aa * alp2em) * alpem / em;
    }
  }
  /*--------------------------------------------------
                   Store b[NB].
                   --------------------------------------------------*/
  b[n - 1] = aa;
  gotos = (function() {
    if (nend >= 0) {
      if (nb <= 1) {
        alp2em = nu + 1 === 1 ? 1 : nu;
        sum += b[0] * alp2em;
        //goto L250;
        return 'gotoL250';
      } else {
        /*-- nb >= 2 : ---------------------------
                 Calculate and store b[NB-1].
                 ----------------------------------------*/
        --n;
        en -= 2;
        b[n - 1] = en * aa / x - bb;

        if (n === 1) {
          return 'gotoL240';
        }

        m = m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
        if (m !== 0) {
          em -= 1;
          alp2em = em + em + nu;
          alpem = em - 1 + nu;
          if (alpem === 0) {
            alpem = 1;
          }
          sum = (sum + b[n - 1] * alp2em) * alpem / em;
        }
      }
    }
    return undefined;
  })();

  /* if (n - 2 != 0) */
  /* --------------------------------------------------------
                    Calculate via difference equation and store b[N],
                    until N = 2.
                    -------------------------------------------------------- */
  //skip if L240 or L250
  if (gotos === undefined) {
    for (n = n - 1; n >= 2; n--) {
      en -= 2;
      b[n - 1] = en * b[n + 1 - 1] / x - b[n + 2 - 1];
      m = m ? 0 : 2; /* m = 2 - m failed on gcc4-20041019 */
      if (m !== 0) {
        em -= 1;
        alp2em = em + em + nu;
        alpem = em - 1 + nu;
        if (alpem === 0) {
          alpem = 1;
        }
        sum = (sum + b[n - 1] * alp2em) * alpem / em;
      }
    }

    /* ---------------------------------------
                        Calculate b[1].
                        -----------------------------------------*/
    b[0] = 2 * (nu + 1) * b[2 - 1] / x - b[3 - 1];
  }
  if (gotos === 'gotoL240' || gotos === undefined) {
    //L240:
    em -= 1;
    alp2em = em + em + nu;
    if (alp2em === 0) {
      alp2em = 1;
    }
    sum += b[1 - 1] * alp2em;
  }
  // L250:
  /* ---------------------------------------------------
                    Normalize.  Divide all b[N] by sum.
                    ---------------------------------------------------*/
  /*	    if (nu + 1. != 1.) poor test */
  if (fabs(nu) > 1e-15) {
    sum *= Rf_gamma_cody(nu) * pow(0.5 * x, -nu);
  }
  aa = enmten_BESS;
  if (sum > 1) {
    aa *= sum;
  }
  for (n = 1; n <= nb; ++n) {
    if (fabs(b[n - 1]) < aa) {
      b[n - 1] = 0;
    } else {
      b[n - 1] /= sum;
    }
  } //for
  return { x, nb, ncalc, b, alpha };
}

function bessel_j_assymptotic_large_x(
  props: JBesselProperties
): JBesselProperties {
  const pi2 = 0.636619772367581343075535;
  const fact = [
    1, // 0
    1, // 1
    2,
    6,
    24,
    120, // 5
    720,
    5040,
    40320,
    362880,
    3628800, // 10
    39916800,
    479001600,
    6227020800,
    87178291200,
    1.307674368e12, // 15!
    2.0922789888e13,
    3.55687428096e14,
    6.402373705728e15,
    1.21645100408832e17,
    2.43290200817664e18, // 20!
    5.109094217170944e19,
    1.12400072777760768e21,
    2.585201673888497664e22,
    6.2044840173323943936e23 //24!
  ];

  let { nb, x, ncalc, alpha: nu, b, alpha } = props;
  let twonu = nu + nu;
  /* ------------------------------------------------------------
               Asymptotic series for X > 25 (and not too large nb)
    ------------------------------------------------------------ */
  let xc = sqrt(pi2 / x);
  let xin = 1 / (64 * x * x);
  let m = (function() {
    switch (true) {
      case x >= 130:
        return 4;
      case x >= 35:
        return 8;
      default:
        return 11;
    }
  })();
  let xm = 4 * m;
  /* ------------------------------------------------
               Argument reduction for SIN and COS routines.
               ------------------------------------------------ */
  let t = round(x / pi2 + 0.5);
  //z = x - t * twopi1 - t * twopi2 - (nu + 0.5) / pi2;
  const z = x - t * pi2 + (nu + 0.5) / pi2;
  let vsin = sin(z);
  let vcos = cos(z);
  let gnu = twonu;
  for (let i = 1; i <= 2; ++i) {
    let s = (xm - 1 - gnu) * (xm - 1 + gnu) * xin * 0.5;
    let t = (gnu - (xm - 3)) * (gnu + (xm - 3));
    let t1 = (gnu - (xm + 1)) * (gnu + (xm + 1));
    let k = m + m;
    let capp = s * t / fact[k];
    let capq = s * t1 / fact[k + 1];
    let xk = xm;
    for (; k >= 4; k -= 2) {
      /* k + 2(j-2) == 2m */
      xk -= 4;
      s = (xk - 1 - gnu) * (xk - 1 + gnu);
      t1 = t;
      t = (gnu - (xk - 3)) * (gnu + (xk - 3));
      capp = (capp + 1 / fact[k - 2]) * s * t * xin;
      capq = (capq + 1 / fact[k - 1]) * s * t1 * xin;
    }
    capp += 1;
    capq = (capq + 1) * (gnu * gnu - 1) * (0.125 / x);
    b[i - 1] = xc * (capp * vcos - capq * vsin);

    if (nb === 1) {
      // end
      return { x, nb, ncalc, b, alpha };
    }

    /* vsin <--> vcos */ t = vsin;
    vsin = -vcos;
    vcos = t;
    gnu += 2;
  }
  /* -----------------------------------------------
               If  NB > 2, compute J(X,ORDER+I)	for I = 2, NB-1
               ----------------------------------------------- */
  if (nb > 2) {
    //place this outside the loop
    gnu = twonu + 2;
    for (let /*gnu = twonu + 2,*/ j = 3; j <= nb; j++, gnu += 2) {
      b[j - 1] = gnu * b[j - 1 - 1] / x - b[j - 2 - 1];
    }
  }
  return { x, nb, ncalc, b, alpha };
}

function bessel_j_small_x(props: JBesselProperties): JBesselProperties {
  let { nb, x, ncalc, alpha: nu, b, alpha } = props;
  /* ---------------------------------------------------------------
        Two-term ascending series for small X.
      ---------------------------------------------------------------*/
  let alpham = 1 + nu;

  let halfx = x > enmten_BESS ? 0.5 * x : 0;

  let aa = nu !== 0 ? pow(halfx, nu) / (nu * Rf_gamma_cody(nu)) : 1;
  let bb = x + 1 > 1 ? -halfx * halfx : 0;
  b[0] = aa + aa * bb / alpham;
  if (x !== 0 && b[0] === 0) {
    ncalc = 0;
  }

  if (nb !== 1) {
    if (x <= 0) {
      for (let n = 2; n <= nb; ++n) {
        b[n - 1] = 0;
      }
    } else {
      /* ----------------------------------------------
                       Calculate higher order functions.
                       ---------------------------------------------- */
      let tover = bb === 0 ? (enmten_BESS + enmten_BESS) / x : enmten_BESS / bb;

      let cc = halfx;
      for (let n = 2; n <= nb; ++n) {
        aa /= alpham;
        alpham += 1;
        aa *= cc;
        if (aa <= tover * alpham) {
          aa = 0;
        }

        b[n - 1] = aa + aa * bb / alpham;
        if (b[n - 1] === 0 && ncalc > n) {
          ncalc = n - 1;
        }
      } //for
    } //if (x <= 0)
  } // if (nb !== 1) {
  return { nb, x, ncalc, b, alpha };
}
