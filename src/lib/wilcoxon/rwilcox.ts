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
import { randomGenHelper, seq_len } from '../r-func';
import { IRNG } from '../rng';

const printer_rwilcox = debug('rwilcox');
const { round: R_forceint, trunc, floor } = Math;
const { isNaN: ISNAN } = Number;

export function rwilcox(
  N: number| number[],
  m: number,
  n: number,
  rng: IRNG
): number[] {
  return randomGenHelper(N, rwilcoxOne, m, n, rng);
}

export function rwilcoxOne(m: number, n: number, rng: IRNG): number {
    /* NaNs propagated correctly */
    if (ISNAN(m) || ISNAN(n)) return m + n;

    m = R_forceint(m);
    n = R_forceint(n);
    if (m < 0 || n < 0) return ML_ERR_return_NAN(printer_rwilcox);

    if (m === 0 || n === 0) return 0;

    let r = 0.0;
    let k = trunc(m + n);
    let x: number[] = Array.from(seq_len({ length:k, base: 0}))
    printer_rwilcox(`------v`);
    for (let i = 0; i < n; i++) {
      let j = floor(k * (rng.unif_rand() as number));
      r += x[j];
      x[j] = x[--k];
      printer_rwilcox('i:%d,\tn:%d\tj:%d\tk:%d\tr:%d\tx:%o', i, n, j, k, x);
    }

    return r - n * (n - 1) / 2;

  }
