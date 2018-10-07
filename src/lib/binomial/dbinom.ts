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

import {
  M_LN_2PI,
  ML_ERR_return_NAN,
  R_D__0,
  R_D__1,
  R_D_exp,
  R_D_negInonint,
  R_D_nonint_check
} from '../common/_general';
import { bd0 } from '../deviance';
import { map } from '../r-func';
import { stirlerr } from '../stirling';

const { log, log1p, round: R_forceint } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('dbinom');

export function dbinom_raw(
  x: number,
  n: number,
  p: number,
  q: number,
  give_log: boolean
): number {
  let lf: number;
  let lc: number;

  if (p === 0) return x === 0 ? R_D__1(give_log) : R_D__0(give_log);
  if (q === 0) return x === n ? R_D__1(give_log) : R_D__0(give_log);

  if (x === 0) {
    if (n === 0) return R_D__1(give_log);
    let lc = p < 0.1 ? -bd0(n, n * q) - n * p : n * log(q);
    return R_D_exp(give_log, lc);
  }

  if (x === n) {
    lc = q < 0.1 ? -bd0(n, n * p) - n * q : n * log(p);
    return R_D_exp(give_log, lc);
  }

  if (x < 0 || x > n) return R_D__0(give_log);

  /* n*p or n*q can underflow to zero if n and p or q are small.  This
       used to occur in dbeta, and gives NaN as from R 2.3.0.  */
  lc =
    stirlerr(n) -
    stirlerr(x) -
    stirlerr(n - x) -
    bd0(x, n * p) -
    bd0(n - x, n * q);

  /* f = (M_2PI*x*(n-x))/n; could overflow or underflow */
  /* Upto R 2.7.1:
     * lf = log(M_2PI) + log(x) + log(n-x) - log(n);
     * -- following is much better for  x << n : */
  lf = M_LN_2PI + log(x) + log1p(-x / n);

  return R_D_exp(give_log, lc - 0.5 * lf);
}

export function dbinom<T>(
  xx: T,
  n: number,
  p: number,
  logX: boolean = false
): T {
  return map(xx)(x => {
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(n) || ISNAN(p)) return x + n + p;

    if (p < 0 || p > 1 || R_D_negInonint(n)) return ML_ERR_return_NAN(printer);
    R_D_nonint_check(logX, x, printer);
    if (x < 0 || !R_FINITE(x)) return R_D__0(logX);

    n = R_forceint(n);
    x = R_forceint(x);

    return dbinom_raw(x, n, p, 1 - p, logX);
  }) as any;
}
