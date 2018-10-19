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

import { ML_ERR_return_NAN } from '../common/_general';
import { randomGenHelper } from '../r-func';
import { IRNG } from '../rng';

const { log, pow } = Math;
const { isFinite: R_FINITE } = Number;
const printer = debug('rweibull');

export  function rweibull(
  n: number|number[],
  shape: number,
  scale: number = 1,
  rng: IRNG
){
  return randomGenHelper(n, rweibullOne, shape, scale, rng)
}

export function rweibullOne(
  shape: number,
  scale: number = 1,
  rng: IRNG
): number {

  if (!R_FINITE(shape) || !R_FINITE(scale) || shape <= 0 || scale <= 0) {
    if (scale === 0) return 0;
    /* else */
    return ML_ERR_return_NAN(printer);
  }

  return scale * pow(-log((rng.unif_rand() as number)), 1.0 / shape);

}
