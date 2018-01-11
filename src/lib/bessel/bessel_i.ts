/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 10, 2017
 * 
 *  ORIGINAL AUTHOR:
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998-2014 Ross Ihaka and the R Core team.
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
 *  License for JS language implementation
 *  https://www.jacob-bogers.com/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 */

/*  DESCRIPTION --> see below */

/* From http://www.netlib.org/specfun/ribesl	Fortran translated by f2c,...
 *	------------------------------=#----	Martin Maechler, ETH Zurich
 */

import * as debug from 'debug';

import {
  //bessel
  enmten_BESS,
  ensig_BESS,
  enten_BESS,
  exparg_BESS,
  ldexp,
  ME,
  //other,
  ML_ERROR,
  nsig_BESS,
  R_pow_di,
  rtnsig_BESS,
  xlrg_BESS_IJ
} from '../common/_general';

const { pow, max: fmax2, sqrt, exp, floor, trunc, min: min0, PI: M_PI } = Math;
const { isNaN: ISNAN, NaN: ML_NAN, POSITIVE_INFINITY: ML_POSINF } = Number;

import { Rf_gamma_cody } from '../gamma/gamma_cody';

interface IBesselInput {
  x: number; // double
  alpha: number; //double
  nb: number; //int
  ize: number; //int
  bi: number[]; //double
  ncalc: number; //int
}

import { sinpi } from '../trigonometry/sinpi';
import { bessel_k, bessel_k_ex } from './bessel_k';

const printer_bessel_i = debug('bessel_i');
/** .Internal(besselI(*)) : */

export function bessel_i(x: number, alpha: number, expo: number): number {
  //int

  let ncalc: number;
  //double
  let bi: number[];

  /* NaNs propagated correctly */
  if (ISNAN(x) || ISNAN(alpha)) {
    return NaN;
  }

  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_i', printer_bessel_i);
    return ML_NAN;
  }
  let ize = trunc(expo);
  let na = floor(alpha);
  if (alpha < 0) {
    /* Using Abramowitz & Stegun  9.6.2 & 9.6.6
         * this may not be quite optimal (CPU and accuracy wise) */
    return (
      bessel_i(x, -alpha, expo) +
      (alpha === na
        ? /* sin(pi * alpha) = 0 */ 0
        : bessel_k(x, -alpha, expo) *
          (ize === 1 ? 2 : 2 * exp(-2 * x)) /
          M_PI *
          sinpi(-alpha))
    );
  }
  let nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
  alpha -= nb - 1;
  let input: IBesselInput = { x, alpha, nb, ize, bi: [], ncalc: 0 };
  I_bessel(input);
  ({ x, alpha, nb, ize, bi, ncalc } = input);

  if (ncalc !== nb) {
    /* error input */
    if (ncalc < 0)
      printer_bessel_i(
        'bessel_i(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?',
        x,
        ncalc,
        nb,
        alpha
      );
    else
      printer_bessel_i(
        'bessel_i(%d,nu=%d): precision lost in result',
        x,
        alpha + nb - 1
      );
  }
  x = bi[nb - 1];
  return x;
}

/* modified version of bessel_i that accepts a work array instead of
   allocating one. */
const printer_bessel_i_ex = debug('bessel_i_ex');
export function bessel_i_ex(
  x: number,
  alpha: number,
  expo: number,
  bi: number[]
): number {
  //int
  let nb: number;
  let ncalc: number;
  let ize: number;
  //double
  let na: number;

  /* NaNs propagated correctly */
  if (ISNAN(x) || ISNAN(alpha)) return x + alpha;

  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_i', printer_bessel_i_ex);
    return ML_NAN;
  }
  ize = trunc(expo);
  na = floor(alpha);
  if (alpha < 0) {
    /* Using Abramowitz & Stegun  9.6.2 & 9.6.6
         * this may not be quite optimal (CPU and accuracy wise) */
    return (
      bessel_i_ex(x, -alpha, expo, bi) +
      (alpha === na
        ? 0
        : bessel_k_ex(x, -alpha, expo, bi) *
          (ize === 1 ? 2 : 2 * exp(-2 * x)) /
          M_PI *
          sinpi(-alpha))
    );
  }
  nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
  alpha -= nb - 1;
  let input: IBesselInput = { x, alpha, nb, ize, bi, ncalc: 0 };
  I_bessel(input);
  ({ x, alpha, nb, ize, bi, ncalc } = input);
  if (ncalc !== nb) {
    /* error input */
    if (ncalc < 0)
      printer_bessel_i_ex(
        'bessel_i(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?',
        x,
        ncalc,
        nb,
        alpha
      );
    else
      printer_bessel_i_ex(
        'bessel_i(%d,nu=%d): precision lost in result',
        x,
        alpha + nb - 1
      );
  }
  x = bi[nb - 1];
  return x;
}

function I_bessel(µ: IBesselInput) {
  /* -------------------------------------------------------------------
    
     This routine calculates Bessel functions I_(N+ALPHA) (X)
     for non-negative argument X, and non-negative order N+ALPHA,
     with or without exponential scaling.
    
    
     Explanation of variables in the calling sequence
    
     X     - Non-negative argument for which
         I's or exponentially scaled I's (I*EXP(-X))
         are to be calculated.	If I's are to be calculated,
         X must be less than exparg_BESS (IZE=1) or xlrg_BESS_IJ (IZE=2),
         (see bessel.h).
     ALPHA - Fractional part of order for which
         I's or exponentially scaled I's (I*EXP(-X)) are
         to be calculated.  0 <= ALPHA < 1.0.
     NB    - Number of functions to be calculated, NB > 0.
         The first function calculated is of order ALPHA, and the
         last is of order (NB - 1 + ALPHA).
     IZE   - Type.	IZE = 1 if unscaled I's are to be calculated,
                = 2 if exponentially scaled I's are to be calculated.
     BI    - Output vector of length NB.	If the routine
         terminates normally (NCALC=NB), the vector BI contains the
         functions I(ALPHA,X) through I(NB-1+ALPHA,X), or the
         corresponding exponentially scaled functions.
     NCALC - Output variable indicating possible errors.
         Before using the vector BI, the user should check that
         NCALC=NB, i.e., all orders have been calculated to
         the desired accuracy.	See error returns below.
    
    
     *******************************************************************
     *******************************************************************
    
     Error returns
    
      In case of an error,	NCALC != NB, and not all I's are
      calculated to the desired accuracy.
    
      NCALC < 0:  An argument is out of range. For example,
         NB <= 0, IZE is not 1 or 2, or IZE=1 and ABS(X) >= EXPARG_BESS.
         In this case, the BI-vector is not calculated, and NCALC is
         set to MIN0(NB,0)-1 so that NCALC != NB.
    
      NB > NCALC > 0: Not all requested function values could
         be calculated accurately.	This usually occurs because NB is
         much larger than ABS(X).  In this case, BI[N] is calculated
         to the desired accuracy for N <= NCALC, but precision
         is lost for NCALC < N <= NB.  If BI[N] does not vanish
         for N > NCALC (because it is too small to be represented),
         and BI[N]/BI[NCALC] = 10**(-K), then only the first NSIG-K
         significant figures of BI[N] can be trusted.
    
    
     Intrinsic functions required are:
    
         DBLE, EXP, gamma_cody, INT, MAX, MIN, REAL, SQRT
    
    
     Acknowledgement
    
      This program is based on a program written by David J.
      Sookne (2) that computes values of the Bessel functions J or
      I of float argument and long order.  Modifications include
      the restriction of the computation to the I Bessel function
      of non-negative float argument, the extension of the computation
      to arbitrary positive order, the inclusion of optional
      exponential scaling, and the elimination of most underflow.
      An earlier version was published in (3).
    
     References: "A Note on Backward Recurrence Algorithms," Olver,
              F. W. J., and Sookne, D. J., Math. Comp. 26, 1972,
              pp 941-947.
    
             "Bessel Functions of Real Argument and Integer Order,"
              Sookne, D. J., NBS Jour. of Res. B. 77B, 1973, pp
              125-132.
    
             "ALGORITHM 597, Sequence of Modified Bessel Functions
              of the First Kind," Cody, W. J., Trans. Math. Soft.,
              1983, pp. 242-245.
    
      Latest modification: May 30, 1989
    
      Modified by: W. J. Cody and L. Stoltz
               Applied Mathematics Division
               Argonne National Laboratory
               Argonne, IL  60439
    */

  /*-------------------------------------------------------------------
      Mathematical constants
      -------------------------------------------------------------------*/
  const _const = 1.585;

  /* Local variables */
  // int
  let nend: number;
  let intx: number;
  let nbmx: number;
  let k: number;
  let l: number;
  let n: number;
  let nstart: number;
  // double
  let pold: number;
  let test: number;
  let p: number;
  let em: number;
  let en: number;
  let empal: number;
  let emp2al: number;
  let halfx: number;
  let aa: number;
  let bb: number;
  let cc: number;
  let psave: number;
  let plast: number;
  let tover: number;
  let psavel: number;
  let sum: number;
  let nu: number;
  let twonu: number;

  /*Parameter adjustments */
  nu = µ.alpha;
  twonu = nu + nu;

  /*-------------------------------------------------------------------
      Check for X, NB, OR IZE out of range.
      ------------------------------------------------------------------- */
  if (
    µ.nb > 0 &&
    µ.x >= 0 &&
    (0 <= nu && nu < 1) &&
    (1 <= µ.ize && µ.ize <= 2)
  ) {
    µ.ncalc = µ.nb;
    if (µ.ize === 1 && µ.x > exparg_BESS) {
      for (k = 0; k < µ.nb; k++){
        µ.bi[k] = ML_POSINF; /* the limit *is* = Inf */
      }
      return;
    }
    if (µ.ize === 2 && µ.x > xlrg_BESS_IJ) {
      for (k = 1; k <= µ.nb; k++)
        µ.bi[k - 1] = 0; /* The limit exp(-x) * I_nu(x) --> 0 : */
      return;
    }
    intx = trunc(µ.x); /* fine, since *x <= xlrg_BESS_IJ <<< LONG_MAX */
    let L120 = false;
    if (µ.x >= rtnsig_BESS) {
      /* "non-small" x ( >= 1e-4 ) */
      /* -------------------------------------------------------------------
               Initialize the forward sweep, the P-sequence of Olver
               ------------------------------------------------------------------- */
      nbmx = µ.nb - intx;
      n = intx + 1;
      en = n + n + twonu;
      plast = 1;
      p = en / µ.x;
      /* ------------------------------------------------
               Calculate general significance test
               ------------------------------------------------ */
      test = ensig_BESS + ensig_BESS;
      if (intx << 1 > nsig_BESS * 5) {
        test = sqrt(test * p);
      } else {
        test /= R_pow_di(_const, intx);
      }
      if (nbmx >= 3) {
        /* --------------------------------------------------
                   Calculate P-sequence until N = NB-1
                   Check for possible overflow.
                   ------------------------------------------------ */
        tover = enten_BESS / ensig_BESS;
        nstart = intx + 2;
        nend = µ.nb - 1;
        for (k = nstart; k <= nend; ++k) {
          n = k;
          en += 2;
          pold = plast;
          plast = p;
          p = en * plast / µ.x + pold;
          if (p > tover) {
            /* ------------------------------------------------
                           To avoid overflow, divide P-sequence by TOVER.
                           Calculate P-sequence until ABS(P) > 1.
                           ---------------------------------------------- */
            tover = enten_BESS;
            p /= tover;
            plast /= tover;
            psave = p;
            psavel = plast;
            nstart = n + 1;
            do {
              ++n;
              en += 2;
              pold = plast;
              plast = p;
              p = en * plast / µ.x + pold;
            } while (p <= 1);

            bb = en / µ.x;
            /* ------------------------------------------------
                           Calculate backward test, and find NCALC,
                           the highest N such that the test is passed.
                           ------------------------------------------------ */
            test = pold * plast / ensig_BESS;
            test *= 0.5 - 0.5 / (bb * bb);
            p = plast * tover;
            --n;
            en -= 2;
            nend = min0(µ.nb, n);
            let L90 = false;
            for (l = nstart; l <= nend; ++l) {
              µ.ncalc = l;
              pold = psavel;
              psavel = psave;
              psave = en * psavel / µ.x + pold;
              if (psave * psavel > test) {
                L90 = true;
                break;
              }
            }
            if (!L90) {
              µ.ncalc = nend + 1;
            }
            --µ.ncalc;
            L120 = true;
            break;
          } //if statement
        } //for-loop
        if (!L120) {
          n = nend;
          en = n + n + twonu;
          /*---------------------------------------------------
                      Calculate special significance test for NBMX > 2.
                      --------------------------------------------------- */
          test = fmax2(test, sqrt(plast * ensig_BESS) * sqrt(p + p));
        }
      } //if statement
      /* --------------------------------------------------------
               Calculate P-sequence until significance test passed.
               -------------------------------------------------------- */
      if (!L120) {
        do {
          ++n;
          en += 2;
          pold = plast;
          plast = p;
          p = en * plast / µ.x + pold;
        } while (p < test);
      }
      // L120:
      /* -------------------------------------------------------------------
             Initialize the backward recursion and the normalization sum.
             ------------------------------------------------------------------- */
      ++n;
      en += 2;
      bb = 0;
      aa = 1 / p;
      em = n - 1;
      empal = em + nu;
      emp2al = em - 1 + twonu;
      sum = aa * empal * emp2al / em;
      nend = n - µ.nb;
      let L220 = false;
      let L230 = false;
      if (nend < 0) {
        /* -----------------------------------------------------
                   N < NB, so store BI[N] and set higher orders to 0..
                   ----------------------------------------------------- */
        µ.bi[n] = aa;
        nend = -nend;
        for (l = 1; l <= nend; ++l) {
          µ.bi[n + l - 1] = 0;
        }
      } else {
        if (nend > 0) {
          /* -----------------------------------------------------
                       Recur backward via difference equation,
                       calculating (but not storing) BI[N], until N = NB.
                       --------------------------------------------------- */

          for (l = 1; l <= nend; ++l) {
            --n;
            en -= 2;
            cc = bb;
            bb = aa;
            /* for x ~= 1500,  sum would overflow to 'inf' here,
                         * and the final bi[] /= sum would give 0 wrongly;
                         * RE-normalize (aa, sum) here -- no need to undo */
            if (nend > 100 && aa > 1e200) {
              /* multiply by  2^-900 = 1.18e-271 */
              cc = ldexp(cc, -900);
              bb = ldexp(bb, -900);
              sum = ldexp(sum, -900);
            }
            aa = en * bb / µ.x + cc;
            em -= 1;
            emp2al -= 1;
            if (n === 1) {
              break;
            }
            if (n === 2) {
              emp2al = 1;
            }
            empal -= 1;
            sum = (sum + aa * empal) * emp2al / em;
          }
        }
        /* ---------------------------------------------------
                   Store BI[NB]
                   --------------------------------------------------- */

        µ.bi[n - 1] = aa;
        if (µ.nb <= 1) {
          sum = sum + sum + aa;
          L230 = true;
        }
        if (!L230) {
          /* -------------------------------------------------
                       Calculate and Store BI[NB-1]
                       ------------------------------------------------- */
          --n;
          en -= 2;
          µ.bi[n - 1] = en * aa / µ.x + bb;

          if (n === 1) {
            L220 = true;
          }
          if (!L220) {
            em -= 1;
            if (n === 2) emp2al = 1;
            else emp2al -= 1;

            empal -= 1;
            sum = (sum + µ.bi[n - 1] * empal) * emp2al / em;
          } //because of goto L220
        } // because of goto L230
      }
      //
      if (!L230 || !L220) {
        nend = n - 2;
        if (nend > 0) {
          /* --------------------------------------------
                       Calculate via difference equation
                       and store BI[N], until N = 2.
                       ------------------------------------------ */
          for (l = 1; l <= nend; ++l) {
            --n;
            en -= 2;
            µ.bi[n - 1] = en * µ.bi[n + 1 - 1] / µ.x + µ.bi[n + 2 - 1];
            em -= 1;
            if (n === 2) emp2al = 1;
            else emp2al -= 1;
            empal -= 1;
            sum = (sum + µ.bi[n - 1] * empal) * emp2al / em;
          }
        }
        /* ----------------------------------------------
                   Calculate BI[1]
                   -------------------------------------------- */
        µ.bi[1 - 1] = 2 * empal * µ.bi[2 - 1] / µ.x + µ.bi[3 - 1];
      }
      // label for goto L220:
      if (!L230) {
        sum = sum + sum + µ.bi[1 - 1];
      }
      // label for goto L230:
      /* ---------------------------------------------------------
               Normalize.  Divide all BI[N] by sum.
               --------------------------------------------------------- */
      if (nu !== 0) sum *= Rf_gamma_cody(1 + nu) * pow(µ.x * 0.5, -nu);
      if (µ.ize === 1) sum *= exp(-µ.x);
      aa = enmten_BESS;
      if (sum > 1) aa *= sum;
      for (n = 1; n <= µ.nb; ++n) {
        if (µ.bi[n] < aa) µ.bi[n] = 0;
        else µ.bi[n] /= sum;
      }
      return;
    } else {
      /* small x  < 1e-4 */
      /* -----------------------------------------------------------
               Two-term ascending series for small X.
               -----------------------------------------------------------*/
      aa = 1;
      empal = 1 + nu;
      /* No need to check for underflow */
      halfx = 0.5 * µ.x;

      if (nu !== 0) aa = pow(halfx, nu) / Rf_gamma_cody(empal);
      if (µ.ize === 2) aa *= exp(-µ.x);
      bb = halfx * halfx;
      µ.bi[1 - 1] = aa + aa * bb / empal;
      if (µ.x !== 0 && µ.bi[1] === 0) µ.ncalc = 0;
      if (µ.nb > 1) {
        if (µ.x === 0) {
          for (n = 2; n <= µ.nb; ++n) µ.bi[n] = 0;
        } else {
          /* -------------------------------------------------
                       Calculate higher-order functions.
                       ------------------------------------------------- */
          cc = halfx;
          tover = (enmten_BESS + enmten_BESS) / µ.x;
          if (bb !== 0) tover = enmten_BESS / bb;
          for (n = 2; n <= µ.nb; ++n) {
            aa /= empal;
            empal += 1;
            aa *= cc;
            if (aa <= tover * empal) µ.bi[n - 1] = aa = 0;
            else µ.bi[n - 1] = aa + aa * bb / empal;
            if (µ.bi[n - 1] === 0 && µ.ncalc > n) µ.ncalc = n - 1;
          }
        }
      }
    }
  } else {
    /* argument out of range */
    µ.ncalc = min0(µ.nb, 0) - 1;
  }
}
