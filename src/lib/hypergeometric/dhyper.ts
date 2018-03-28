/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import { map } from '../r-func';

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

export function dhyper<T>(
  xx: T,
  r: number,
  b: number,
  n: number,
  give_log: boolean = false
): T {
  return map(xx)(x => {
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
  }) as any;

}
