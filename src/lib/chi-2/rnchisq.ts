/* 
This is a conversion from BLAS to Typescript/Javascript
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
import { rpois } from '../poisson/rpois';
import { randomGenHelper } from '../r-func'
import { IRNGNormal } from '../rng/normal/inormal-rng';
import { rchisqOne } from './rchisq';

const printer = debug('rnchisq');
const { isFinite: R_FINITE } = Number;

export function rnchisq(
  n: number| number[],
  df: number,
  lambda: number,
  rng: IRNGNormal
): number[] {
  return randomGenHelper(n, rnchisqOne, df, lambda, rng);
}

export function rnchisqOne(
  df: number,
  lambda: number,
  rng: IRNGNormal
): number {

  if (!R_FINITE(df) || !R_FINITE(lambda) || df < 0 || lambda < 0) {
    return ML_ERR_return_NAN(printer);
  }
  if (lambda === 0) {
    return df === 0 ? 0 : (rgammaOne(df / 2, 2, rng) as number);
  } else {
    let r = rpois(1, lambda / 2, rng) as number;
    if (r > 0) r = rchisqOne(2 * r, rng);
    if (df > 0) r += rgammaOne(df / 2, 2, rng) as number;
    return r;
  }
}
