/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 10, 2017
 * 
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998-2014 Ross Ihaka and the R Core team.
 *  Copyright (C) 2002-3    The R Foundation
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
 * 
 *  License for R statistical package
 * https://www.r-project.org/Licenses/
 */

/*  DESCRIPTION --> see below */


/* From http://www.netlib.org/specfun/rkbesl	Fortran translated by f2c,...
 *	------------------------------=#----	Martin Maechler, ETH Zurich
 */
import * as debug from 'debug';

import {
  DBL_MIN,
  M_SQRT_2dPI,
  DBL_EPSILON,
  sqrt,
  fabs,
  DBL_MAX,
  sinh,
  log,
  exp,
  ML_POSINF,
  ISNAN,
  ML_ERROR,
  ME,
  ML_NAN,
  trunc,
  floor,
  MATHLIB_WARNING4,
  MATHLIB_WARNING2,
  xmax_BESS_K,
  sqxmin_BESS_K,
  max0,
  min0
} from '~common';

const printer_bessel_k = debug('bessel_k');

export function bessel_k(x: number, alpha: number, expo: number): number {

  let nb: number;
  let ncalc: number;
  let ize: number;
  let _bk: number[];


  if (ISNAN(x) || ISNAN(alpha)) return x + alpha;

  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_k', printer_bessel_k);
    return ML_NAN;
  }
  ize = trunc(expo);

  if (alpha < 0) alpha = -alpha;

  nb = 1 + floor(alpha);
  alpha -= (nb - 1);

  _bk = new Array(nb);
  let p: KBesselProps = { x, alpha, nb, ize, bk: _bk, ncalc: 0 };
  K_bessel(p);
  x = p.x;
  alpha = p.alpha;
  nb = p.nb;
  _bk = p.bk;
  ncalc = p.ncalc;

  if (ncalc !== nb) {// error input 
    if (ncalc < 0)
      MATHLIB_WARNING4('bessel_k(%g): ncalc (=%d) != nb (=%d); alpha=%g. Arg. out of range?\n',
        x, ncalc, nb, alpha);
    else
      MATHLIB_WARNING2('bessel_k(%g,nu=%g): precision lost in result\n',
        x, alpha + nb - 1);
  }
  x = _bk[nb - 1];
  return x;
}

export function bessel_k_ex(x: number, alpha: number, expo: number, bk: number[]) {
  let nb: number;
  let ncalc: number;
  let ize: number;

  if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_k', printer_bessel_k);
    return ML_NAN;
  }
  ize = trunc(expo);
  if (alpha < 0)
    alpha = -alpha;
  nb = 1 + floor(alpha); // nb-1 <= |alpha| < nb 
  alpha -= floor(nb - 1);
  let p: KBesselProps = { x, alpha, nb, ize, bk, ncalc: 0 };
  K_bessel(p);
  x = p.x;
  alpha = p.alpha;
  ize = p.ize;
  bk = p.bk;
  ncalc = p.ncalc;

  if (ncalc !== nb) {// error input 
    if (ncalc < 0)
      MATHLIB_WARNING4('bessel_k(%g): ncalc (=%d) != nb (=%d); alpha=%g. Arg. out of range?\n',
        x, ncalc, nb, alpha);
    else
      MATHLIB_WARNING2('bessel_k(%g,nu=%g): precision lost in result\n',
        x, alpha + nb - 1);
  }
  x = bk[nb - 1];
  return x;
}

export interface KBesselProps {
  x: number;
  alpha: number;
  nb: number;
  ize: number;
  bk: number[];
  ncalc: number;
}


export function K_bessel(input: KBesselProps): void {
  /*-------------------------------------------------------------------
   
    This routine calculates modified Bessel functions
    of the third kind, K_(N+ALPHA) (X), for non-negative
    argument X, and non-negative order N+ALPHA, with or without
    exponential scaling.
   
    Explanation of variables in the calling sequence
   
   X     - Non-negative argument for which
     K's or exponentially scaled K's (K*EXP(X))
     are to be calculated.	If K's are to be calculated,
     X must not be greater than XMAX_BESS_K.
   ALPHA - Fractional part of order for which
     K's or exponentially scaled K's (K*EXP(X)) are
     to be calculated.  0 <= ALPHA < 1.0.
   NB    - Number of functions to be calculated, NB > 0.
     The first function calculated is of order ALPHA, and the
     last is of order (NB - 1 + ALPHA).
   IZE   - Type.	IZE = 1 if unscaled K's are to be calculated,
          = 2 if exponentially scaled K's are to be calculated.
   BK    - Output vector of length NB.	If the
     routine terminates normally (NCALC=NB), the vector BK
     contains the functions K(ALPHA,X), ... , K(NB-1+ALPHA,X),
     or the corresponding exponentially scaled functions.
     If (0 < NCALC < NB), BK(I) contains correct function
     values for I <= NCALC, and contains the ratios
     K(ALPHA+I-1,X)/K(ALPHA+I-2,X) for the rest of the array.
   NCALC - Output variable indicating possible errors.
     Before using the vector BK, the user should check that
     NCALC=NB, i.e., all orders have been calculated to
     the desired accuracy.	See error returns below.
   
   
   *******************************************************************
   
   Error returns
   
    In case of an error, NCALC != NB, and not all K's are
    calculated to the desired accuracy.
   
    NCALC < -1:  An argument is out of range. For example,
    NB <= 0, IZE is not 1 or 2, or IZE=1 and ABS(X) >= XMAX_BESS_K.
    In this case, the B-vector is not calculated,
    and NCALC is set to MIN0(NB,0)-2	 so that NCALC != NB.
    NCALC = -1:  Either  K(ALPHA,X) >= XINF  or
    K(ALPHA+NB-1,X)/K(ALPHA+NB-2,X) >= XINF.	 In this case,
    the B-vector is not calculated.	Note that again
    NCALC != NB.
   
    0 < NCALC < NB: Not all requested function values could
    be calculated accurately.  BK(I) contains correct function
    values for I <= NCALC, and contains the ratios
    K(ALPHA+I-1,X)/K(ALPHA+I-2,X) for the rest of the array.
   
   
   Intrinsic functions required are:
   
       ABS, AINT, EXP, INT, LOG, MAX, MIN, SINH, SQRT
   
   
   Acknowledgement
   
    This program is based on a program written by J. B. Campbell
    (2) that computes values of the Bessel functions K of float
    argument and float order.  Modifications include the addition
    of non-scaled functions, parameterization of machine
    dependencies, and the use of more accurate approximations
    for SINH and SIN.
   
   References: "On Temme's Algorithm for the Modified Bessel
          Functions of the Third Kind," Campbell, J. B.,
          TOMS 6(4), Dec. 1980, pp. 581-586.
   
         "A FORTRAN IV Subroutine for the Modified Bessel
          Functions of the Third Kind of Real Order and Real
          Argument," Campbell, J. B., Report NRC/ERB-925,
          National Research Council, Canada.
   
    Latest modification: May 30, 1989
   
    Modified by: W. J. Cody and L. Stoltz
           Applied Mathematics Division
           Argonne National Laboratory
           Argonne, IL  60439
   
   -------------------------------------------------------------------
  */
  /*---------------------------------------------------------------------
   * Mathematical constants
   *	A = LOG(2) - Euler's constant
   *	D = SQRT(2/PI)
   ---------------------------------------------------------------------*/
  const a = .11593151565841244881;

  /*---------------------------------------------------------------------
    P, Q - Approximation for LOG(GAMMA(1+ALPHA))/ALPHA + Euler's constant
    Coefficients converted from hex to decimal and modified
    by W. J. Cody, 2/26/82 */
  const p = [
    .805629875690432845, 20.4045500205365151,
    157.705605106676174, 536.671116469207504, 900.382759291288778,
    730.923886650660393, 229.299301509425145, .822467033424113231];

  const q = [
    29.4601986247850434, 277.577868510221208,
    1206.70325591027438, 2762.91444159791519, 3443.74050506564618,
    2210.63190113378647, 572.267338359892221];

  /* R, S - Approximation for (1-ALPHA*PI/SIN(ALPHA*PI))/(2.D0*ALPHA) */

  const r = [-.48672575865218401848, 13.079485869097804016,
  -101.96490580880537526, 347.65409106507813131,
    3.495898124521934782e-4
  ];
  const s = [-25.579105509976461286, 212.57260432226544008,
  -610.69018684944109624, 422.69668805777760407];
  /* T    - Approximation for SINH(Y)/Y */
  const t = [
    1.6125990452916363814e-10,
    2.5051878502858255354e-8, 2.7557319615147964774e-6,
    1.9841269840928373686e-4, .0083333333333334751799,
    .16666666666666666446];
  /*---------------------------------------------------------------------*/
  const estm = [52.0583, 5.7607, 2.7782, 14.4303, 185.3004, 9.3715];
  const estf = [41.8341, 7.1075, 6.4306, 42.511, 1.35633, 84.5096, 20.];

  /* Local variables */
  let iend: number;
  let i: number;
  let j: number;
  let k: number;
  let m: number;
  let ii: number;
  let mplus1: number;

  let x2by4: number;
  let twox: number;
  let c: number;
  let blpha: number;
  let ratio: number;
  let wminf: number = 0;
  let d1: number;
  let d2: number;
  let d3: number;
  let f0: number;
  let f1: number;
  let f2: number;
  let p0: number;
  let q0: number;
  let t1: number;
  let t2: number;
  let twonu: number;
  let dm: number;
  let ex: number;
  let bk1: number = 0;
  let bk2: number = 0;
  let nu: number;

  ii = 0; /* -Wall */

  ex = input.x;
  nu = input.alpha;
  input.ncalc = min0(input.nb, 0) - 2;
  if (input.nb > 0 && (0. <= nu && nu < 1.) && (1 <= input.ize && input.ize <= 2)) {
    if (ex <= 0 || (input.ize === 1 && ex > xmax_BESS_K)) {
      if (ex <= 0) {
        if (ex < 0) ML_ERROR(ME.ME_RANGE, 'K_bessel', printer_bessel_k);
        for (i = 0; i < input.nb; i++)
          input.bk[i] = ML_POSINF;
      } else /* would only have underflow */
        for (i = 0; i < input.nb; i++)
          input.bk[i] = 0.;
      input.ncalc = input.nb;
      return;
    }
    k = 0;
    if (nu < sqxmin_BESS_K) {
      nu = 0.;
    } else if (nu > .5) {
      k = 1;
      nu -= 1.;
    }
    twonu = nu + nu;
    iend = input.nb + k - 1;
    c = nu * nu;
    d3 = -c;
    if (ex <= 1.) {
      /* ------------------------------------------------------------
         Calculation of P0 = GAMMA(1+ALPHA) * (2/X)**ALPHA
            Q0 = GAMMA(1-ALPHA) * (X/2)**ALPHA
         ------------------------------------------------------------ */
      d1 = 0.; d2 = p[0];
      t1 = 1.; t2 = q[0];
      for (i = 2; i <= 7; i += 2) {
        d1 = c * d1 + p[i - 1];
        d2 = c * d2 + p[i];
        t1 = c * t1 + q[i - 1];
        t2 = c * t2 + q[i];
      }
      d1 = nu * d1;
      t1 = nu * t1;
      f1 = log(ex);
      f0 = a + nu * (p[7] - nu * (d1 + d2) / (t1 + t2)) - f1;
      q0 = exp(-nu * (a - nu * (p[7] + nu * (d1 - d2) / (t1 - t2)) - f1));
      f1 = nu * f0;
      p0 = exp(f1);
      /* -----------------------------------------------------------
         Calculation of F0 =
         ----------------------------------------------------------- */
      d1 = r[4];
      t1 = 1.;
      for (i = 0; i < 4; ++i) {
        d1 = c * d1 + r[i];
        t1 = c * t1 + s[i];
      }
      /* d2 := sinh(f1)/ nu = sinh(f1)/(f1/f0)
       *	   = f0 * sinh(f1)/f1 */
      if (fabs(f1) <= .5) {
        f1 *= f1;
        d2 = 0.;
        for (i = 0; i < 6; ++i) {
          d2 = f1 * d2 + t[i];
        }
        d2 = f0 + f0 * f1 * d2;
      } else {
        d2 = sinh(f1) / nu;
      }
      f0 = d2 - nu * d1 / (t1 * p0);
      if (ex <= 1e-10) {
        /* ---------------------------------------------------------
           X <= 1.0E-10
           Calculation of K(ALPHA,X) and X*K(ALPHA+1,X)/K(ALPHA,X)
           --------------------------------------------------------- */
        input.bk[0] = f0 + ex * f0;
        if (input.ize === 1) {
          input.bk[0] -= ex * input.bk[0];
        }
        ratio = p0 / f0;
        c = ex * DBL_MAX;
        if (k !== 0) {
          /* ---------------------------------------------------
             Calculation of K(ALPHA,X)
             and  X*K(ALPHA+1,X)/K(ALPHA,X),	ALPHA >= 1/2
             --------------------------------------------------- */
          input.ncalc = -1;
          if (input.bk[0] >= c / ratio) {
            return;
          }
          input.bk[0] = ratio * input.bk[0] / ex;
          twonu += 2.;
          ratio = twonu;
        }
        input.ncalc = 1;
        if (input.nb === 1)
          return;

        /* -----------------------------------------------------
           Calculate  K(ALPHA+L,X)/K(ALPHA+L-1,X),
           L = 1, 2, ... , NB-1
           ----------------------------------------------------- */
        input.ncalc = -1;
        for (i = 1; i < input.nb; ++i) {
          if (ratio >= c)
            return;

          input.bk[i] = ratio / ex;
          twonu += 2.;
          ratio = twonu;
        }
        input.ncalc = 1;
        return L420();
      } else {
        /* ------------------------------------------------------
           10^-10 < X <= 1.0
           ------------------------------------------------------ */
        c = 1.;
        x2by4 = ex * ex / 4.;
        p0 = .5 * p0;
        q0 = .5 * q0;
        d1 = -1.;
        d2 = 0.;
        bk1 = 0.;
        bk2 = 0.;
        f1 = f0;
        f2 = p0;
        do {
          d1 += 2.;
          d2 += 1.;
          d3 = d1 + d3;
          c = x2by4 * c / d2;
          f0 = (d2 * f0 + p0 + q0) / d3;
          p0 /= d2 - nu;
          q0 /= d2 + nu;
          t1 = c * f0;
          t2 = c * (p0 - d2 * f0);
          bk1 += t1;
          bk2 += t2;
        } while (fabs(t1 / (f1 + bk1)) > DBL_EPSILON ||
          fabs(t2 / (f2 + bk2)) > DBL_EPSILON);
        bk1 = f1 + bk1;
        bk2 = 2. * (f2 + bk2) / ex;
        if (input.ize === 2) {
          d1 = exp(ex);
          bk1 *= d1;
          bk2 *= d1;
        }
        wminf = estf[0] * ex + estf[1];
      }
    } else if (DBL_EPSILON * ex > 1.) {
/* -------------------------------------------------
	       X > 1./EPS
	       ------------------------------------------------- */
      input.ncalc = input.nb;
      bk1 = 1. / (M_SQRT_2dPI * sqrt(ex));
      for (i = 0; i < input.nb; ++i)
        input.bk[i] = bk1;
      return;

    } else {
      /* -------------------------------------------------------
         X > 1.0
         ------------------------------------------------------- */
      twox = ex + ex;
      blpha = 0.;
      ratio = 0.;
      if (ex <= 4.) {
        /* ----------------------------------------------------------
           Calculation of K(ALPHA+1,X)/K(ALPHA,X),  1.0 <= X <= 4.0
           ----------------------------------------------------------*/
        d2 = trunc(estm[0] / ex + estm[1]);
        m = trunc(d2);
        d1 = d2 + d2;
        d2 -= .5;
        d2 *= d2;
        for (i = 2; i <= m; ++i) {
          d1 -= 2.;
          d2 -= d1;
          ratio = (d3 + d2) / (twox + d1 - ratio);
        }
        /* -----------------------------------------------------------
           Calculation of I(|ALPHA|,X) and I(|ALPHA|+1,X) by backward
           recurrence and K(ALPHA,X) from the wronskian
           -----------------------------------------------------------*/
        d2 = trunc(estm[2] * ex + estm[3]);
        m = trunc(d2);
        c = fabs(nu);
        d3 = c + c;
        d1 = d3 - 1.;
        f1 = DBL_MIN;
        f0 = (2. * (c + d2) / ex + .5 * ex / (c + d2 + 1.)) * DBL_MIN;
        for (i = 3; i <= m; ++i) {
          d2 -= 1.;
          f2 = (d3 + d2 + d2) * f0;
          blpha = (1. + d1 / d2) * (f2 + blpha);
          f2 = f2 / ex + f1;
          f1 = f0;
          f0 = f2;
        }
        f1 = (d3 + 2.) * f0 / ex + f1;
        d1 = 0.;
        t1 = 1.;
        for (i = 1; i <= 7; ++i) {
          d1 = c * d1 + p[i - 1];
          t1 = c * t1 + q[i - 1];
        }
        p0 = exp(c * (a + c * (p[7] - c * d1 / t1) - log(ex))) / ex;
        f2 = (c + .5 - ratio) * f1 / ex;
        bk1 = p0 + (d3 * f0 - f2 + f0 + blpha) / (f2 + f1 + f0) * p0;
        if (input.ize === 1) {
          bk1 *= exp(-ex);
        }
        wminf = estf[2] * ex + estf[3];
      } else {
        /* ---------------------------------------------------------
           Calculation of K(ALPHA,X) and K(ALPHA+1,X)/K(ALPHA,X), by
           backward recurrence, for  X > 4.0
           ----------------------------------------------------------*/
        dm = trunc(estm[4] / ex + estm[5]);
        m = trunc(dm);
        d2 = dm - .5;
        d2 *= d2;
        d1 = dm + dm;
        for (i = 2; i <= m; ++i) {
          dm -= 1.;
          d1 -= 2.;
          d2 -= d1;
          ratio = (d3 + d2) / (twox + d1 - ratio);
          blpha = (ratio + ratio * blpha) / dm;
        }
        bk1 = 1. / ((M_SQRT_2dPI + M_SQRT_2dPI * blpha) * sqrt(ex));
        if (input.ize === 1)
          bk1 *= exp(-ex);
        wminf = estf[4] * (ex - fabs(ex - estf[6])) + estf[5];
      }
      /* ---------------------------------------------------------
         Calculation of K(ALPHA+1,X)
         from K(ALPHA,X) and  K(ALPHA+1,X)/K(ALPHA,X)
         --------------------------------------------------------- */
      bk2 = bk1 + bk1 * (nu + .5 - ratio) / ex;
    }
    /*--------------------------------------------------------------------
      Calculation of 'NCALC', K(ALPHA+I,X),	I  =  0, 1, ... , NCALC-1,
      &	  K(ALPHA+I,X)/K(ALPHA+I-1,X),	I = NCALC, NCALC+1, ... , NB-1
      -------------------------------------------------------------------*/
    input.ncalc = input.nb;
    input.bk[0] = bk1;
    if (iend === 0){
      return;
    }

    j = 1 - k;
    if (j >= 0){
      input.bk[j] = bk2;
    }

    if (iend === 1){
      return;
    }

    m = min0(trunc(wminf - nu), iend);
    for (i = 2; i <= m; ++i) {
      t1 = bk1;
      bk1 = bk2;
      twonu += 2.;
      if (ex < 1.) {
        if (bk1 >= DBL_MAX / twonu * ex)
          break;
      } else {
        if (bk1 / ex >= DBL_MAX / twonu)
          break;
      }
      bk2 = twonu / ex * bk1 + t1;
      ii = i;
      ++j;
      if (j >= 0) {
        input.bk[j] = bk2;
      }
    }

    m = ii;
    if (m === iend) {
      return;
    }
    ratio = bk2 / bk1;
    mplus1 = m + 1;
    input.ncalc = -1;
    for (i = mplus1; i <= iend; ++i) {
      twonu += 2.;
      ratio = twonu / ex + 1. / ratio;
      ++j;
      if (j >= 1) {
        input.bk[j] = ratio;
      } else {
        if (bk2 >= DBL_MAX / ratio)
          return;

        bk2 *= ratio;
      }
    }
    input.ncalc = max0(1, mplus1 - k);
    if (input.ncalc === 1)
      input.bk[0] = bk2;
    if (input.nb === 1)
      return;

    L420();
  }
  function L420(){
    for (i = input.ncalc; i < input.nb; ++i) { /* i == *ncalc */
      input.bk[i] *= input.bk[i - 1];
      input.ncalc++;
    }
  }
}


