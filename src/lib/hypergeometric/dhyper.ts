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

import {
  ML_ERR_return_NAN,
  R_D__0,
  R_D__1,
  R_D_negInonint,
  R_D_nonint_check
} from '../common/_general';

import { dbinom_raw } from '../binomial/dbinom';

const printer = debug('dhyper');
const { round: R_forceint } = Math;
const { isNaN: ISNAN } = Number;

export function dhyper(
  x: number,
  r: number,
  b: number,
  n: number,
  give_log: boolean = false
): number {
  
    let p: number;
    let q: number;
    let p1: number;
    let p2: number;
    let p3: number;

    if (ISNAN(x) || ISNAN(r) || ISNAN(b) || ISNAN(n)) return x + r + b + n;

    if (
      R_D_negInonint(r) ||
      R_D_negInonint(b) ||
      R_D_negInonint(n) ||
      n > r + b
    )
      return ML_ERR_return_NAN(printer);
    if (x < 0) return R_D__0(give_log);
    let rc = R_D_nonint_check(give_log, x, printer); // incl warning
    if (rc !== undefined) {
      return rc;
    }
    x = R_forceint(x);
    r = R_forceint(r);
    b = R_forceint(b);
    n = R_forceint(n);

    if (n < x || r < x || n - x > b) return R_D__0(give_log);
    if (n === 0) return x === 0 ? R_D__1(give_log) : R_D__0(give_log);

    p = n / (r + b);
    q = (r + b - n) / (r + b);

    p1 = dbinom_raw(x, r, p, q, give_log);
    p2 = dbinom_raw(n - x, b, p, q, give_log);
    p3 = dbinom_raw(n, r + b, p, q, give_log);

    return give_log ? p1 + p2 - p3 : p1 * p2 / p3;
 

}
