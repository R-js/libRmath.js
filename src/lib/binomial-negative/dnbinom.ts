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
  R_D_exp,
  R_D_nonint_check
} from '../common/_general';

import { dbinom_raw } from '../binomial/dbinom';
import { lgammafn } from '../gamma/lgamma_fn';

const printer = debug('dnbinom');
const { log, round: R_forceint, log1p } = Math;
const { isFinite: R_FINITE, isNaN: ISNAN } = Number;

export function dnbinom<T>(
  xx: T,
  size: number,
  prob: number,
  give_log: boolean
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);

  const result = fx.map(x => {
    let ans: number;
    let p: number;

    if (ISNAN(x) || ISNAN(size) || ISNAN(prob)) {
      return x + size + prob;
    }

    if (prob <= 0 || prob > 1 || size < 0) {
      return ML_ERR_return_NAN(printer);
    }

    let rc = R_D_nonint_check(give_log, x, printer);
    if (rc !== undefined) {
      return rc;
    }

    if (x < 0 || !R_FINITE(x)) {
      return R_D__0(give_log);
    }
    /* limiting case as size approaches zero is point mass at zero */
    if (x === 0 && size === 0) {
      return R_D__1(give_log);
    }

    x = R_forceint(x);

    ans = dbinom_raw(size, x + size, prob, 1 - prob, give_log);

    p = size / (size + x);

    return give_log ? log(p) + ans : p * ans;
  });

  return result.length === 1 ? result[0] : (result as any);
}

const printer_dnbinom_mu = debug('dnbinom_mu');

export function dnbinom_mu<T>(
  xx: T,
  size: number,
  mu: number,
  give_log: boolean
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);

  const result = fx.map(x => {
    /* originally, just set  prob :=  size / (size + mu)  and called dbinom_raw(),
     * but that suffers from cancellation when   mu << size  */
    let ans: number;
    let p: number;

    if (ISNAN(x) || ISNAN(size) || ISNAN(mu)) {
      return x + size + mu;
    }

    if (mu < 0 || size < 0) {
      return ML_ERR_return_NAN(printer_dnbinom_mu);
    }

    let rc = R_D_nonint_check(give_log, x, printer_dnbinom_mu);
    if (rc !== undefined) {
      return rc;
    }

    if (x < 0 || !R_FINITE(x)) {
      return R_D__0(give_log);
    }

    /* limiting case as size approaches zero is point mass at zero,
     * even if mu is kept constant. limit distribution does not
     * have mean mu, though.
     */
    if (x === 0 && size === 0) {
      return R_D__1(give_log);
    }

    x = R_forceint(x);
    if (x === 0) {
      /* be accurate, both for n << mu, and n >> mu :*/
      // old code   size * (size < mu ? log(size / (size + mu)) : log1p(- mu / (size + mu))));
      let llogx: number;
      if (size < mu) {
        llogx = log(size / (size + mu));
      } else {
        llogx = log1p(-mu / (size + mu));
      }
      return R_D_exp(give_log, size * llogx);
    }
    if (x < 1e-10 * size) {
      /* don't use dbinom_raw() but MM's formula: */
      /* FIXME --- 1e-8 shows problem; rather use algdiv() from ./toms708.c */
      p = size < mu ? log(size / (1 + size / mu)) : log(mu / (1 + mu / size));
      return R_D_exp(
        give_log,
        x * p - mu - lgammafn(x + 1) + log1p(x * (x - 1) / (2 * size))
      );
    }

    /* else: no unnecessary cancellation inside dbinom_raw, when
     * x_ = size and n_ = x+size are so close that n_ - x_ loses accuracy
     */

    ans = dbinom_raw(
      size,
      x + size,
      size / (size + mu),
      mu / (size + mu),
      give_log
    );
    p = size / (size + x);

    return give_log ? log(p) + ans : p * ans;
  });
  return result.length === 0 ? result[0] : (result as any);
}
