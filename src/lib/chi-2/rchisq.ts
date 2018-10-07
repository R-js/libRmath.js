/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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
import { ML_ERR_return_NAN } from '../common/_general';
import { rgammaOne } from '../gamma/rgamma';
import { randomGenHelper } from '../r-func'
import { IRNGNormal } from '../rng/normal/inormal-rng';

const { isFinite: R_FINITE } = Number;
const printer = debug('rchisq');

export function rchisq(
  n: number | number[],
  df: number,
  rng: IRNGNormal
): number[] {
  return randomGenHelper(n, rchisqOne, df, rng);
}

export function rchisqOne(
  df: number,
  rng: IRNGNormal
): number {
  if (!R_FINITE(df) || df < 0.0) {
    return ML_ERR_return_NAN(printer);
  }
  return rgammaOne(df / 2.0, 2.0, rng);
}
