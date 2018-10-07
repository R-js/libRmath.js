/* This is a conversion from BLAS to Typescript/Javascript
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
import { rnormOne } from '../normal/rnorm';
import { randomGenHelper } from '../r-func';
import { IRNGNormal } from '../rng/normal';

const { exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('rlnorm');


export function rlnorm(
  N: number,
  meanlog: number = 0,
  sdlog: number = 1,
  rng: IRNGNormal
): number[] {
  return randomGenHelper(N, rlnormOne, meanlog, sdlog, rng);
}

export function rlnormOne(
  meanlog: number = 0,
  sdlog: number = 1,
  rng: IRNGNormal
): number {
  if (ISNAN(meanlog) || !R_FINITE(sdlog) || sdlog < 0) {
    return ML_ERR_return_NAN(printer);
  }
  return exp(rnormOne(meanlog, sdlog, rng));
}
