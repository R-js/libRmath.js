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

const { abs: fabs } = Math;

const printer = debug('chebyshev_eval');

export function chebyshev_init(
  dos: number[],
  nos: number,
  eta: number
): number {
  let retCode: number = 0;
  //let ii: number;
  let err: number;

  if (nos < 1) return 0;

  err = 0.0;

  for (let ii = 1; ii <= nos; ii++) {
    retCode = nos - ii;
    err += fabs(dos[retCode]);
    if (err > eta) {
      return retCode;
    }
  }
  return retCode;
}

export function chebyshev_eval(x: number, a: number[], n: number): number {
  let b0: number;
  let b1: number;
  let b2: number;
  let twox: number;
  let i: number;

  if (n < 1 || n > 1000) {
    return ML_ERR_return_NAN(printer);
  }

  if (x < -1.1 || x > 1.1) {
    return ML_ERR_return_NAN(printer);
  }

  twox = x * 2;
  b2 = b1 = 0;
  b0 = 0;
  for (i = 1; i <= n; i++) {
    b2 = b1;
    b1 = b0;
    b0 = twox * b1 - b2 + a[n - i];
  }
  return (b0 - b2) * 0.5;
}
