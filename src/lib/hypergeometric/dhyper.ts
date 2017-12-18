/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 4, 2017
 *
 *  ORIGINAL AUTHOR
 *    Catherine Loader, catherine@research.bell-labs.com.
 *    October 23, 2000.
 *
 *  Merge in to R:
 *	Copyright (C) 2000-2014 The R Core Team
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
 *
 * DESCRIPTION
 *
 *    Given a sequence of r successes and b failures, we sample n (\le b+r)
 *    items without replacement. The hypergeometric probability is the
 *    probability of x successes:
 *
 *		       choose(r, x) * choose(b, n-x)
 *	p(x; r,b,n) =  -----------------------------  =
 *			       choose(r+b, n)
 *
 *		      dbinom(x,r,p) * dbinom(n-x,b,p)
 *		    = --------------------------------
 *			       dbinom(n,r+b,p)
 *
 *    for any p. For numerical stability, we take p=n/(r+b); with this choice,
 *    the denominator is not exponentially small.
 */

import * as debug from 'debug';

const { round: R_forceint } = Math;
const { isNaN: ISNAN } = Number;

import {
  R_D_negInonint,
  R_D_nonint_check,
  ML_ERR_return_NAN,
  R_D__0,
  R_D__1
} from '~common';

import { dbinom_raw } from '../binomial/dbinom';

const printer = debug('dhyper');

export function dhyper(
  x: number,
  r: number,
  b: number,
  n: number,
  give_log: boolean
): number {
  let p: number;
  let q: number;
  let p1: number;
  let p2: number;
  let p3: number;

  if (ISNAN(x) || ISNAN(r) || ISNAN(b) || ISNAN(n)) return x + r + b + n;

  if (R_D_negInonint(r) || R_D_negInonint(b) || R_D_negInonint(n) || n > r + b)
    return ML_ERR_return_NAN(printer);
  if (x < 0) return R_D__0(give_log);
  let rc = R_D_nonint_check(give_log, x, printer); // incl warning
  if (rc !== undefined) {
    return rc;
  }
  x = R_forceint(x);
  r = R_forceint(r);
  b = R_forceint(b);
  n = R_forceint(n);

  if (n < x || r < x || n - x > b) return R_D__0(give_log);
  if (n === 0) return x === 0 ? R_D__1(give_log) : R_D__0(give_log);

  p = n / (r + b);
  q = (r + b - n) / (r + b);

  p1 = dbinom_raw(x, r, p, q, give_log);
  p2 = dbinom_raw(n - x, b, p, q, give_log);
  p3 = dbinom_raw(n, r + b, p, q, give_log);

  return give_log ? p1 + p2 - p3 : p1 * p2 / p3;
}
