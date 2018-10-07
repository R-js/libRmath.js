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
import { map, seq } from '../r-func';
import { IRNG } from '../rng';

const { log } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const sequence = seq()();
const printer_rlogis = debug('rlogis');


export function rlogis( N: number, location: number = 0,
  scale: number = 1,
  rng: IRNG): number[] {
    return Array.from({length:N}).map(() => rlogisOne(location,scale,rng));
}

export function rlogisOne(
  location: number = 0,
  scale: number = 1,
  rng: IRNG
): number {
 
    if (ISNAN(location) || !R_FINITE(scale)) {
      return ML_ERR_return_NAN(printer_rlogis);
    }

    if (scale === 0 || !R_FINITE(location)) return location;
    else {
      let u: number = rng.unif_rand() as number;
      return location + scale * log(u / (1 - u));
    }
}
