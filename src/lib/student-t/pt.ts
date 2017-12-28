/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 16, 2017
 *
 *  ORIGINAL AUTHOR
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 1995, 1996  Robert Gentleman and Ross Ihaka
 *  Copyright (C) 2000-2007   The R Core Team
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

import * as debug from 'debug';

import {
  M_LN2,
  ML_ERR_return_NAN,
  R_D_Cval,
  R_DT_0,
  R_DT_1
} from '../common/_general';

import { INormal } from '~normal';

import { lbeta } from '../beta/lbeta';

import { pbeta } from '../beta/pbeta';

const { log1p, sqrt, log, abs: fabs, exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const printer = debug('pt');

export function pt<T>(
  xx: T,
  n: number,
  lowerTail: boolean = true,
  log_p: boolean = false,
  normal: INormal
): T {
  /* return  P[ T <= x ]	where
     * T ~ t_{n}  (t distrib. with n degrees of freedom).
    
     *	--> ./pnt.c for NON-central
     */
  const fx: number[] = (Array.isArray(xx) ? xx : [xx]) as any;
  const result = fx.map(x => {
    let val;
    let nx;

    let lower_tail = lowerTail;

    if (ISNAN(x) || ISNAN(n)) return x + n;

    if (n <= 0.0) {
      return ML_ERR_return_NAN(printer);
    }

    if (!R_FINITE(x)) {
      return x < 0 ? R_DT_0(lower_tail, log_p) : R_DT_1(lower_tail, log_p);
    }

    if (!R_FINITE(n)) {
      return normal.pnorm(x, 0.0, 1.0, lower_tail, log_p);
    }

    if (n > 4e5) {
      /*-- Fixme(?): test should depend on `n' AND `x' ! */
      /* Approx. from	 Abramowitz & Stegun 26.7.8 (p.949) */
      val = 1 / (4 * n);
      return normal.pnorm(
        x * (1 - val) / sqrt(1 + x * x * 2 * val),
        0.0,
        1.0,
        lower_tail,
        log_p
      );
    }

    nx = 1 + x / n * x;
    /* FIXME: This test is probably losing rather than gaining precision,
     * now that pbeta(*, log_p = TRUE) is much better.
     * Note however that a version of this test *is* needed for x*x > D_MAX */
    if (nx > 1e100) {
      /* <==>  x*x > 1e100 * n  */
      /* Danger of underflow. So use Abramowitz & Stegun 26.5.4
           pbeta(z, a, b) ~ z^a(1-z)^b / aB(a,b) ~ z^a / aB(a,b),
           with z = 1/nx,  a = n/2,  b= 1/2 :
        */
      let lval;
      lval =
        -0.5 * n * (2 * log(fabs(x)) - log(n)) -
        lbeta(0.5 * n, 0.5) -
        log(0.5 * n);
      val = log_p ? lval : exp(lval);
    } else {
      val =
        n > x * x
          ? pbeta(x * x / (n + x * x), 0.5, n / 2, /*lower_tail*/ false, log_p)
          : pbeta(1 / nx, n / 2, 0.5, /*lower_tail*/ true, log_p);
    }

    /* Use "1 - v"  if	lower_tail  and	 x > 0 (but not both):*/
    if (x <= 0) {
      lower_tail = !lower_tail;
    }

    if (log_p) {
      if (lower_tail) {
        return log1p(-0.5 * exp(val));
      } else {
        return val - M_LN2; /* = log(.5* pbeta(....)) */
      }
    } else {
      val /= 2;
      return R_D_Cval(lower_tail, val);
    }
  });
  return (result.length === 1 ? result[0] : result) as any;
}
