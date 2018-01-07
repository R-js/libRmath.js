/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  MArch 4, 2017
 * 
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 2002 The R Core Team
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
 *	#include <Rmath.h>
 *	double expm1(double x);
 *
 *  DESCRIPTION
 *
 *	Compute the Exponential minus 1
 *
 *			exp(x) - 1
 *
 *      accurately also when x is close to zero, i.e. |x| << 1
 *
 *  NOTES
 *
 *	As log1p(), this is a standard function in some C libraries,
 *	particularly GNU and BSD (but is neither ISO/ANSI C nor POSIX).
 *
 *  We supply a substitute for the case when there is no system one.
 */

import {
  M_LN2,
  R_D_Cval,
  R_D_log,
  R_D_Lval
} from '../common/_general';

//import { log1p } from '~log';

const { exp, expm1, log, log1p } = Math;

function R_DT_qIv(lower_tail: boolean, log_p: boolean, p: number) {
  return log_p ? (lower_tail ? exp(p) : -expm1(p)) : R_D_Lval(lower_tail, p);
}

function R_DT_CIv(lower_tail: boolean, log_p: boolean, p: number) {
  return log_p ? (lower_tail ? -expm1(p) : exp(p)) : R_D_Cval(lower_tail, p);
}

/*
export function expm1(x: number) {

    let y: number;
    let a = fabs(x);

    if (a < DBL_EPSILON) return x;
    if (a > 0.697) return exp(x) - 1;  // negligible cancellation 

    if (a > 1e-8)
        y = exp(x) - 1;
    else // Taylor expansion, more accurate in this range 
        y = (x / 2 + 1) * x;

    // Newton step for solving   log(1 + y) = x   for y : 
    // WARNING: does not work for y ~ -1: bug in 1.5.0 
    y -= (1 + y) * (log1p(y) - x);
    return y;
}
*/

function R_D_LExp(log_p: boolean, x: number): number {
  return log_p ? R_Log1_Exp(x) : log1p(-x);
}

// log(1 - exp(x))  in more stable form than log1p(- R_D_qIv(x)) :
function R_Log1_Exp(x: number) {
  if (x > -M_LN2) {
    return log(-expm1(x));
  }
  return log1p(-exp(x));
}

function R_DT_Clog(lower_tail: boolean, log_p: boolean, p: number): number {
  return lower_tail
    ? R_D_LExp(log_p, p)
    : R_D_log(log_p, p); /* log(1-p) in qF*/
}

function R_DT_log(lower_tail: boolean, log_p: boolean, p: number): number {
  /* log(p) in qF */
  return lower_tail ? R_D_log(log_p, p) : R_D_LExp(log_p, p);
}

export { R_DT_qIv, R_DT_CIv, R_DT_log, R_DT_Clog, R_Log1_Exp, R_D_LExp };
