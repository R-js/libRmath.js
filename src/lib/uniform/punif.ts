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
import * as debug from 'debug';
const printer = debug('punif');

import { ML_ERR_return_NAN, R_D_val, R_DT_0, R_DT_1 } from '../common/_general';
import { map } from '../r-func';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

export function punif(
  q: number | number[],
  min: number = 0,
  max: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[] {
  return map(q)(fx => {
    if (ISNAN(fx) || ISNAN(min) || ISNAN(max)) {
      return fx + min + max;
    }

    if (max < min) {
      return ML_ERR_return_NAN(printer);
    }
    if (!R_FINITE(min) || !R_FINITE(max)) {
      return ML_ERR_return_NAN(printer);
    }

    if (fx >= max) {
      return R_DT_1(lowerTail, logP);
    }
    if (fx <= min) {
      return R_DT_0(lowerTail, logP);
    }
    if (lowerTail) {
      return R_D_val(logP, (fx - min) / (max - min));
    }
    return R_D_val(logP, (max - fx) / (max - min));
  }) as any; 
}
