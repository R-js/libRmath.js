/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 *
 *  ORIGINAL AUTHOR
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 1995, 1996	Robert Gentleman and Ross Ihaka
 *  Copyright (C) 2000		The R Core Team
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

/* Compute  log(1 + exp(x))  without overflow (and fast for x > 18)
   For the two cutoffs, consider
   curve(log1p(exp(x)) - x,       33.1, 33.5, n=2^10)
   curve(x+exp(-x) - log1p(exp(x)), 15, 25,   n=2^11)
*/

import * as debug from 'debug';
import { ML_ERR_return_NAN, R_P_bounds_Inf_01 } from '../common/_general';
import { map } from '../r-func';

const { exp, log1p } = Math;
const { isNaN: ISNAN } = Number;


export function Rf_log1pexp(x: number): number {
  if (x <= 18) return log1p(exp(x));
  if (x > 33.3) return x;
  // else: 18.0 < x <= 33.3 :
  return x + exp(-x);
}

const printer_plogis = debug('plogis');

export function plogis<T>(
  xx: T,
  location: number = 0,
  scale: number = 1,
  lower_tail: boolean = true,
  log_p: boolean = false
): T {


  return map(xx)(x => {
    if (ISNAN(x) || ISNAN(location) || ISNAN(scale))
      return x + location + scale;

    if (scale <= 0.0) {
      return ML_ERR_return_NAN(printer_plogis);
    }

    x = (x - location) / scale;
    if (ISNAN(x)) {
      return ML_ERR_return_NAN(printer_plogis);
    }
    let rc = R_P_bounds_Inf_01(lower_tail, log_p, x);
    if (rc !== undefined) {
      return rc;
    }

    if (log_p) {
      // log(1 / (1 + exp( +- x ))) = -log(1 + exp( +- x))
      return -Rf_log1pexp(lower_tail ? -x : x);
    } else {
      return 1 / (1 + exp(lower_tail ? -x : x));
    }
  }) as any;

}
