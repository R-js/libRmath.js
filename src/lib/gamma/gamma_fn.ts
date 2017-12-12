/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Januari 22, 2017
 * 
 *  ORIGINAL C-CODE AUTHOR (R Project)
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2013 The R Core Team
 *  Copyright (C) 2002-2004 The R Foundation
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
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 * 
 *
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double gammafn(double x);
 *
 *  DESCRIPTION
 *
 *    This function computes the value of the gamma function.
 *
 *  NOTES
 *
 *    This function is a translation into C of a Fortran subroutine
 *    by W. Fullerton of Los Alamos Scientific Laboratory.
 *    (e.g. http://www.netlib.org/slatec/fnlib/gamma.f)
 *
 *    The accuracy of this routine compares (very) favourably
 *    with those of the Sun Microsystems portable mathematical
 *    library.
 *
 *    MM specialized the case of  n!  for n < 50 - for even better precision
 */

import { ML_ERROR, ME } from '~common';
import { chebyshev_eval } from '~chebyshev';
import { stirlerr } from '~stirling';
import { sinpi } from '~trigonometry';
import { lgammacor } from './lgammacor';

import * as debug from 'debug';

const printer = debug('gammafn');

const {
  isNaN: ISNAN,
  NaN: ML_NAN,
  POSITIVE_INFINITY: ML_POSINF,
  NEGATIVE_INFINITY: ML_NEGINF
} = Number;

const { PI: M_PI, abs: fabs, round, trunc, exp, log } = Math;

const M_LN_SQRT_2PI = Math.log(Math.sqrt(2 * Math.PI));

const gamcs: number[] = [
  +0.8571195590989331421920062399942e-2,
  +0.4415381324841006757191315771652e-2,
  +0.5685043681599363378632664588789e-1,
  -0.4219835396418560501012500186624e-2,
  +0.1326808181212460220584006796352e-2,
  -0.1893024529798880432523947023886e-3,
  +0.3606925327441245256578082217225e-4,
  -0.6056761904460864218485548290365e-5,
  +0.1055829546302283344731823509093e-5,
  -0.1811967365542384048291855891166e-6,
  +0.3117724964715322277790254593169e-7,
  -0.5354219639019687140874081024347e-8,
  +0.919327551985958894688778682594e-9,
  -0.1577941280288339761767423273953e-9,
  +0.2707980622934954543266540433089e-10,
  -0.4646818653825730144081661058933e-11,
  +0.7973350192007419656460767175359e-12,
  -0.1368078209830916025799499172309e-12,
  +0.2347319486563800657233471771688e-13,
  -0.4027432614949066932766570534699e-14,
  +0.6910051747372100912138336975257e-15,
  -0.1185584500221992907052387126192e-15,
  +0.2034148542496373955201026051932e-16,
  -0.3490054341717405849274012949108e-17,
  +0.5987993856485305567135051066026e-18,
  -0.1027378057872228074490069778431e-18,
  +0.1762702816060529824942759660748e-19,
  -0.3024320653735306260958772112042e-20,
  +0.5188914660218397839717833550506e-21,
  -0.8902770842456576692449251601066e-22,
  +0.1527474068493342602274596891306e-22,
  -0.2620731256187362900257328332799e-23,
  +0.4496464047830538670331046570666e-24,
  -0.7714712731336877911703901525333e-25,
  +0.1323635453126044036486572714666e-25,
  -0.2270999412942928816702313813333e-26,
  +0.3896418998003991449320816639999e-27,
  -0.6685198115125953327792127999999e-28,
  +0.1146998663140024384347613866666e-28,
  -0.1967938586345134677295103999999e-29,
  +0.3376448816585338090334890666666e-30,
  -0.5793070335782135784625493333333e-31
];

const { isArray } = Array;

export function gammafn<T>(x: T): T {
  const fx: number[] = isArray(x) ? x : [x] as any;

  const result = fx.map(fx => {
    return _gammafn(fx);
  });

  return result.length === 1 ? result[0] : result as any;
}

function _gammafn(x: number): number {
  let i: number;
  let n: number;
  let y: number;
  let sinpiy: number;
  let value: number;

  /* #ifdef NOMORE_FOR_THREADS
     static int ngam = 0;
     static double xmin = 0, xmax = 0., xsml = 0., dxrel = 0.;
 
     // Initialize machine dependent constants, the first time gamma() is called.
     //FIXME for threads ! 
     if (ngam == 0) {
         ngam = chebyshev_init(gamcs, 42, DBL_EPSILON / 20);//was .1*d1mach(3)
         gammalims(&xmin, &xmax);//-> ./gammalims.c 
         xsml = exp(fmax2(log(DBL_MIN), -log(DBL_MAX)) + 0.01);
         //   = exp(.01)*DBL_MIN = 2.247e-308 for IEEE 
         dxrel = sqrt(DBL_EPSILON);//was sqrt(d1mach(4)) 
     }
     #else
     */
  // For IEEE double precision DBL_EPSILON = 2^-52 = 2.220446049250313e-16 :
  // (xmin, xmax) are non-trivial, see ./gammalims.c
  // xsml = exp(.01)*DBL_MIN
  // dxrel = sqrt(DBL_EPSILON) = 2 ^ -26
  //
  const ngam = 22;
  const xmin = -170.5674972726612;
  const xmax = 171.61447887182298;
  const xsml = 2.2474362225598545e-308;
  const dxrel = 1.490116119384765696e-8;

  if (ISNAN(x)) return x;

  //If the argument is exactly zero or a negative integer
  //then return NaN.
  if (x === 0 || (x < 0 && x === round(x))) {
    ML_ERROR(ME.ME_DOMAIN, 'gammafn', printer);
    return ML_NAN;
  }

  y = fabs(x);

  if (y <= 10) {
    // Compute gamma(x) for -10 <= x <= 10
    // Reduce the interval and find gamma(1 + y) for 0 <= y < 1
    // first of all.

    n = x >> 0; // make int32
    if (x < 0) --n;
    y = x - n; // n = floor(x)  ==>	y in [ 0, 1 )
    --n;
    value = chebyshev_eval(y * 2 - 1, gamcs, ngam) + 0.9375;
    if (n === 0) return value; // x = 1.dddd = 1+y

    if (n < 0) {
      // compute gamma(x) for -10 <= x < 1
      // exact 0 or "-n" checked already above
      // The answer is less than half precision
      // because x too near a negative integer.
      if (x < -0.5 && fabs(x - trunc(x - 0.5) / x) < dxrel) {
        ML_ERROR(ME.ME_PRECISION, 'gammafn', printer);
      }
      // The argument is so close to 0 that the result would overflow.
      if (y < xsml) {
        ML_ERROR(ME.ME_RANGE, 'gammafn', printer);
        if (x > 0) return ML_POSINF;
        else return ML_NEGINF;
      }

      n = -n;

      for (i = 0; i < n; i++) {
        value /= x + i;
      }
      return value;
    } else {
      // gamma(x) for 2 <= x <= 10

      for (i = 1; i <= n; i++) {
        value *= y + i;
      }
      return value;
    }
  } else {
    // gamma(x) for	 y = |x| > 10.

    if (x > xmax) {
      // Overflow
      ML_ERROR(ME.ME_RANGE, 'gammafn', printer);
      return ML_POSINF;
    }

    if (x < xmin) {
      // Underflow
      ML_ERROR(ME.ME_UNDERFLOW, 'gammafn', printer);
      return 0;
    }

    if (y <= 50 && y === trunc(y)) {
      // compute (n - 1)!
      value = 1;
      for (i = 2; i < y; i++) value *= i;
    } else {
      // normal case
      value = exp(
        (y - 0.5) * log(y) -
          y +
          M_LN_SQRT_2PI +
          (2 * y === trunc(2) * y ? stirlerr(y) : lgammacor(y))
      );
    }
    if (x > 0) return value;

    if (fabs((x - trunc(x - 0.5)) / x) < dxrel) {
      // The answer is less than half precision because
      // the argument is too near a negative integer.

      ML_ERROR(ME.ME_PRECISION, 'gammafn', printer);
    }

    sinpiy = sinpi(y);
    if (sinpiy === 0) {
      // Negative integer arg - overflow
      ML_ERROR(ME.ME_RANGE, 'gammafn', printer);
      return ML_POSINF;
    }
    return -M_PI / (y * sinpiy * value);
  }
}
