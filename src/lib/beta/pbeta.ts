/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 * 
 *  ORIGNINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 2006 The R Core Team
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
 * #include <Rmath.h>
 *
 * double pbeta_raw(double x, double a, double b, int lower_tail, int log_p)
 * double pbeta	   (double x, double a, double b, int lower_tail, int log_p)
 *
 *  DESCRIPTION
 *
 *	Returns distribution function of the beta distribution.
 *	( = The incomplete beta ratio I_x(p,q) ).
 *
 *  NOTES
 *
 *      As from R 2.3.0, a wrapper for TOMS708
 *      as from R 2.6.0, 'log_p' partially improved over log(p..)
 */

import {
  ISNAN,
  ML_ERR_return_NAN,
  R_FINITE,
  R_DT_1,
  R_DT_0,
  M_LN2,
  MATHLIB_WARNING4
} from '~common';

import { Toms708, NumberW } from '../common/toms708';

export function pbeta_raw(
  x: number,
  a: number,
  b: number,
  lower_tail: boolean,
  log_p: boolean
): number {
  // treat limit cases correctly here:
  if (a === 0 || b === 0 || !R_FINITE(a) || !R_FINITE(b)) {
    // NB:  0 < x < 1 :
    if (a === 0 && b === 0)
      // point mass 1/2 at each of {0,1} :
      return log_p ? -M_LN2 : 0.5;
    if (a === 0 || a / b === 0)
      // point mass 1 at 0 ==> P(X <= x) = 1, all x > 0
      return R_DT_1(lower_tail, log_p);
    if (b === 0 || b / a === 0)
      // point mass 1 at 1 ==> P(X <= x) = 0, all x < 1
      return R_DT_0(lower_tail, log_p);
    // else, remaining case:  a = b = Inf : point mass 1 at 1/2
    if (x < 0.5) return R_DT_0(lower_tail, log_p);
    else return R_DT_1(lower_tail, log_p);
  }
  // Now:  0 < a < Inf;  0 < b < Inf

  let x1 = 0.5 - x + 0.5;
  let w: NumberW = new NumberW(0);
  let wc: NumberW = new NumberW(0);
  let ierr: NumberW = new NumberW(0);
  //====
  //Toms708.bratio(a, b, x, x1, &w, &wc, &ierr, log_p); /* -> ./toms708.c */
  Toms708.bratio(a, b, x, x1, w, wc, ierr, log_p); /* -> ./toms708.c */
  //====
  // ierr in {10,14} <==> bgrat() error code ierr-10 in 1:4; for 1 and 4, warned *there*
  if (ierr && ierr.val && ierr.val !== 11 && ierr.val !== 14)
    MATHLIB_WARNING4(
      'pbeta_raw(%g, a=%g, b=%g, ..) -> bratio() gave error code %d',
      x,
      a,
      b,
      ierr
    );
  return lower_tail ? w.val : wc.val;
} /* pbeta_raw() */

export function pbeta<T>(
  q: T,
  a: number = 0.5,
  b: number = 0.5,
  lower_tail: boolean = true,
  log_p: boolean = false
): T {
  const fa: number[] = Array.isArray(q) ? q : [q] as any;

  const result = fa.map(x => {
    if (ISNAN(x) || ISNAN(a) || ISNAN(b)) return x + a + b;

    if (a < 0 || b < 0) ML_ERR_return_NAN;
    // allowing a==0 and b==0  <==> treat as one- or two-point mass

    if (x <= 0) return R_DT_0(lower_tail, log_p);
    if (x >= 1) return R_DT_1(lower_tail, log_p);

    return pbeta_raw(x, a, b, lower_tail, log_p);
  });
  return result.length === 1 ? result[0] : result as any;
}
