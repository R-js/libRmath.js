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

export function df(
  x: number,
  m: number,
  n: number,
  giveLog = false
): number {
  
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
}
