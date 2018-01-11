/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 2, 2017
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
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 *  https://www.R-project.org/Licenses/
 *
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double lbeta(double a, double b);
 *
 *  DESCRIPTION
 *
 *    This function returns the value of the log beta function.
 *
 *  NOTES
 *
 *    This routine is a translation into C of a Fortran subroutine
 *    by W. Fullerton of Los Alamos Scientific Laboratory.
 */
import * as debug from 'debug';

import { M_LN_SQRT_2PI, ML_ERR_return_NAN } from '../common/_general';

import { gammafn } from '../gamma/gamma_fn';
import { lgammafn } from '../gamma/lgamma_fn';
import { lgammacor } from '../gamma/lgammacor';

const { log, log1p } = Math;

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF,
  NEGATIVE_INFINITY: ML_NEGINF
} = Number;

const printer = debug('lbeta');

export function lbeta(a: number, b: number): number {
  let corr: number;
  let p: number;
  let q: number;

  if (ISNAN(a) || ISNAN(b)) return a + b;
  p = q = a;
  if (b < p) p = b; // := min(a,b)
  if (b > q) q = b; // := max(a,b)

  // both arguments must be >= 0
  if (p < 0) return ML_ERR_return_NAN(printer);
  else if (p === 0) {
    return ML_POSINF;
  } else if (!R_FINITE(q)) {
    // q == +Inf
    return ML_NEGINF;
  }

  if (p >= 10) {
    // p and q are big.
    corr = lgammacor(p) + lgammacor(q) - lgammacor(p + q);
    return (
      log(q) * -0.5 +
      M_LN_SQRT_2PI +
      corr +
      (p - 0.5) * log(p / (p + q)) +
      q * log1p(-p / (p + q))
    );
  } else if (q >= 10) {
    // p is small, but q is big.
    corr = lgammacor(q) - lgammacor(p + q);
    return (
      lgammafn(p) +
      corr +
      p -
      p * log(p + q) +
      (q - 0.5) * log1p(-p / (p + q))
    );
  } else {
    // p and q are small: p <= q < 10.
    // R change for very small args

    //NOTE FROM JACOB, funny how only p is tested and not q?? doesnt make sense
    //  since the beta function is "symetric" for p and q aka beta(p,q) = beta (q,p)

    // removed  if (p < 1e-306) return lgamma(p) + (lgamma(q) - lgamma(p+q));
    //else
    return log(gammafn(p) * (gammafn(q) / gammafn(p + q)));
  }
}
