/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 20, 2017
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
 *    The quantile function of the uniform distribution.
 */

import { R_Q_P01_check, ML_ERR_return_NAN } from '~common';

import { R_DT_qIv } from '~exp-utils';
import * as debug from 'debug';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('qunif');
const { isArray } = Array;

export function qunif(
  p: number | number[],
  a: number = 0,
  b: number = 1,
  lower_tail: boolean = true,
  log_p: boolean = false
): number| number[] {
  let fa = (() => (isArray(p) && p) || [p])();

  let result = fa.map(fp => {
    if (ISNAN(fp) || ISNAN(a) || ISNAN(b)) return fp + a + b;

    let rc = R_Q_P01_check(log_p, fp);
    if (rc !== undefined) {
      return rc;
    }
    if (!R_FINITE(a) || !R_FINITE(b)) return ML_ERR_return_NAN(printer);
    if (b < a) return ML_ERR_return_NAN(printer);
    if (b === a) return a;

    return a + R_DT_qIv(lower_tail, log_p, fp) * (b - a);
  });

  return result.length === 1 ? result[0] : result;
}
