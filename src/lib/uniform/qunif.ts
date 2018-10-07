'use strict'
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
