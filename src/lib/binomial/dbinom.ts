/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 25, 2017
 *
 *  ORIGINAL AUTHOR
 *   Catherine Loader, catherine@research.bell-labs.com.
 *   October 23, 2000.
 *
 *  Merge in to R and further tweaks :
 *	Copyright (C) 2000-2015 The R Core Team
 *	Copyright (C) 2008 The R Foundation
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
 * 
 *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 *
 * DESCRIPTION
 *
 *   To compute the binomial probability, call dbinom(x,n,p).
 *   This checks for argument validity, and calls dbinom_raw().
 *
 *   dbinom_raw() does the actual computation; note this is called by
 *   other functions in addition to dbinom().
 *     (1) dbinom_raw() has both p and q arguments, when one may be represented
 *         more accurately than the other (in particular, in df()).
 *     (2) dbinom_raw() does NOT check that inputs x and n are integers. This
 *         should be done in the calling function, where necessary.
 *         -- but is not the case at all when called e.g., from df() or dbeta() !
 *     (3) Also does not check for 0 <= p <= 1 and 0 <= q <= 1 or NaN's.
 *         Do this in the calling function.
 */

import * as debug from 'debug';

import { bd0 } from '~deviance';
import { stirlerr } from '~stirling';

import {
  ML_ERR_return_NAN,
  M_LN_2PI,
  R_D_negInonint,
  R_forceint,
  R_D__0,
  R_D_exp,
  R_D__1,
  R_D_nonint_check
} from '~common';

const { log, log1p } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('dbinom');

export function dbinom_raw(
  x: number,
  n: number,
  p: number,
  q: number,
  give_log: boolean
): number {
  let lf: number;
  let lc: number;

  if (p === 0) return x === 0 ? R_D__1(give_log) : R_D__0(give_log);
  if (q === 0) return x === n ? R_D__1(give_log) : R_D__0(give_log);

  if (x === 0) {
    if (n === 0) return R_D__1(give_log);
    let lc = p < 0.1 ? -bd0(n, n * q) - n * p : n * log(q);
    return R_D_exp(give_log, lc);
  }

  if (x === n) {
    lc = q < 0.1 ? -bd0(n, n * p) - n * q : n * log(p);
    return R_D_exp(give_log, lc);
  }

  if (x < 0 || x > n) return R_D__0(give_log);

  /* n*p or n*q can underflow to zero if n and p or q are small.  This
       used to occur in dbeta, and gives NaN as from R 2.3.0.  */
  lc =
    stirlerr(n) -
    stirlerr(x) -
    stirlerr(n - x) -
    bd0(x, n * p) -
    bd0(n - x, n * q);

  /* f = (M_2PI*x*(n-x))/n; could overflow or underflow */
  /* Upto R 2.7.1:
     * lf = log(M_2PI) + log(x) + log(n-x) - log(n);
     * -- following is much better for  x << n : */
  lf = M_LN_2PI + log(x) + log1p(-x / n);

  return R_D_exp(give_log, lc - 0.5 * lf);
}

export function dbinom(
  N: number = 1,
  x: number,
  n: number,
  p: number,
  logX: boolean
): number | number[] {
  const result = new Array(N).fill(0).map(() => {
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(n) || ISNAN(p)) return x + n + p;

    if (p < 0 || p > 1 || R_D_negInonint(n)) ML_ERR_return_NAN(printer);
    R_D_nonint_check(logX, x);
    if (x < 0 || !R_FINITE(x)) return R_D__0(logX);

    n = R_forceint(n);
    x = R_forceint(x);

    return dbinom_raw(x, n, p, 1 - p, logX);
  });
  return result.length === 1 ? result[0] : result;
}
