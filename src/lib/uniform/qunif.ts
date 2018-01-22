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

import { ML_ERR_return_NAN, R_Q_P01_check } from '../common/_general';

import * as debug from 'debug';
import { R_DT_qIv } from '../exp/expm1';
import { map } from '../r-func';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('qunif');

export function qunif(
  p: number | number[],
  min: number = 0,
  max: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[] {
  return map(p)(fp => {
    if (ISNAN(fp) || ISNAN(min) || ISNAN(max)) return NaN;

    let rc = R_Q_P01_check(logP, fp);
    if (rc !== undefined) {
      return rc;
    }
    if (!R_FINITE(min) || !R_FINITE(max)) return ML_ERR_return_NAN(printer);
    if (max < min) return ML_ERR_return_NAN(printer);
    if (max === min) return min;

    return min + R_DT_qIv(lowerTail, logP, fp) * (max - min);
  }) as any;
}
