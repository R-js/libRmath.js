/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_D__0, R_D__1 } from '../common/_general';

import { dbinom_raw } from '../binomial/dbinom';
import { dgamma } from '../gamma/dgamma';

const { log } = Math;
const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer_df = debug('df');

export function df<T>(
  xx: T,
  m: number,
  n: number,
  giveLog: boolean = false
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);
  const result = fx.map(x => {
    let p: number;
    let q: number;
    let f: number;
    let dens: number;

    if (ISNAN(x) || ISNAN(m) || ISNAN(n)) {
      return x + m + n;
    }
    if (m <= 0 || n <= 0) {
      return ML_ERR_return_NAN(printer_df);
    }
    if (x < 0) {
      return R_D__0(giveLog);
    }
    if (x === 0) {
      return m > 2 ? R_D__0(giveLog) : m === 2 ? R_D__1(giveLog) : ML_POSINF;
    }
    if (!R_FINITE(m) && !R_FINITE(n)) {
      /* both +Inf */
      if (x === 1) {
        return ML_POSINF;
      } else {
        return R_D__0(giveLog);
      }
    }
    if (!R_FINITE(n)) {
      /* must be +Inf by now */
      return dgamma(x, m / 2, 2 / m, giveLog);
    }
    if (m > 1e14) {
      /* includes +Inf: code below is inaccurate there */
      dens = dgamma(1 / x, n / 2, 2 / n, giveLog);
      return giveLog ? dens - 2 * log(x) : dens / (x * x);
    }

    f = 1 / (n + x * m);
    q = n * f;
    p = x * m * f;

    if (m >= 2) {
      f = m * q / 2;
      dens = dbinom_raw((m - 2) / 2, (m + n - 2) / 2, p, q, giveLog);
    } else {
      f = m * m * q / (2 * p * (m + n));
      dens = dbinom_raw(m / 2, (m + n) / 2, p, q, giveLog);
    }
    return giveLog ? log(f) + dens : f * dens;
  });
  return result.length === 1 ? result[0] : (result as any);
}
