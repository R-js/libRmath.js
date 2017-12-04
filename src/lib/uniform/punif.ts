/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 18, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2006 The R Core Team
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
 *  DESCRIPTION
 *
 *    The distribution function of the uniform distribution.
 */
import * as debug from 'debug';
const printer = debug('punif');

import { ML_ERR_return_NAN, R_DT_1, R_DT_0, R_D_val } from '~common';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const { isArray } = Array;

export function punif(
  x: number | number[],
  a: number = 0,
  b: number = 1,
  lower_tail: boolean = true,
  log_p: boolean = false
): number | number[] {
  let fa = (() => (isArray(x) && x) || [x])();

  let result = fa.map(fx => {
    if (ISNAN(fx) || ISNAN(a) || ISNAN(b)) {
      return fx + a + b;
    }

    if (b < a) {
      return ML_ERR_return_NAN(printer);
    }
    if (!R_FINITE(a) || !R_FINITE(b)) {
      return ML_ERR_return_NAN(printer);
    }

    if (fx >= b) {
      return R_DT_1(lower_tail, log_p);
    }
    if (fx <= a) {
      return R_DT_0(lower_tail, log_p);
    }
    if (lower_tail) {
      return R_D_val(log_p, (fx - a) / (b - a));
    }
    return R_D_val(log_p, (b - fx) / (b - a));
  });

  return result.length === 1 ? result[0] : result;
}
