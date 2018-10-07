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

import { ME, ML_ERR_return_NAN, ML_ERROR, R_P_bounds_01 } from '../common/_general';

import { lgammafn } from '../gamma/lgamma_fn';

import { NumberW, Toms708 } from '../common/toms708';

const { log1p, floor, max: fmax2, sqrt, log, exp } = Math;
const { isNaN: ISNAN } = Number;

const printer = debug('pnbeta_raw');

function pnbeta_raw(
  x: number,
  o_x: number,
  a: number,
  b: number,
  ncp: number
): number {
  /* o_x  == 1 - x  but maybe more accurate */

  /* change errmax and itrmax if desired;
     * original (AS 226, R84) had  (errmax; itrmax) = (1e-6; 100) */
  const errmax = 1.0e-9;
  const itrmax = 10000; /* 100 is not enough for pf(ncp=200)
                     see PR#11277 */
  // double
  let a0;
  let lbeta;
  let c;
  let errbd;
  let x0;
  let temp = new NumberW(0);
  let tmp_c = new NumberW(0);
  // int
  let ierr = new NumberW(0);

  // long double
  let ans;
  let ax;
  let gx;
  let q;
  let sumq;

  if (ncp < 0 || a <= 0 || b <= 0) {
    return ML_ERR_return_NAN(printer);
  }

  if (x < 0 || o_x > 1 || (x === 0 && o_x === 1)) return 0;
  if (x > 1 || o_x < 0 || (x === 1 && o_x === 0)) return 1;

  c = ncp / 2;

  /* initialize the series */

  x0 = floor(fmax2(c - 7 * sqrt(c), 0));
  a0 = a + x0;
  lbeta = lgammafn(a0) + lgammafn(b) - lgammafn(a0 + b);
  /* temp = pbeta_raw(x, a0, b, TRUE, FALSE), but using (x, o_x): */
  Toms708.bratio(a0, b, x, o_x, temp, tmp_c, ierr);

  gx = exp(
    a0 * log(x) + b * (x < 0.5 ? log1p(-x) : log(o_x)) - lbeta - log(a0)
  );
  if (a0 > a) q = exp(-c + x0 * log(c) - lgammafn(x0 + 1));
  else q = exp(-c);

  sumq = 1 - q;
  ans = ax = q * temp.val;

  /* recurse over subsequent terms until convergence is achieved */
  let j = floor(x0); // x0 could be billions, and is in package EnvStats
  do {
    j++;
    temp.val -= gx;
    gx *= x * (a + b + j - 1) / (a + j);
    q *= c / j;
    sumq -= q;
    ax = temp.val * q;
    ans += ax;
    errbd = (temp.val - gx) * sumq;
  } while (errbd > errmax && j < itrmax + x0);

  if (errbd > errmax)  ML_ERROR(ME.ME_PRECISION, 'pnbeta', printer);
  if (j >= itrmax + x0)  ML_ERROR(ME.ME_NOCONV, 'pnbeta', printer);

  return ans;
}

const printer_pnbeta2 = debug('pnbeta2');
export function pnbeta2(
  x: number,
  o_x: number,
  a: number,
  b: number,
  ncp: number /* o_x  == 1 - x  but maybe more accurate */,
  lower_tail: boolean,
  log_p: boolean
) {
  let ans = pnbeta_raw(x, o_x, a, b, ncp);

  /* return R_DT_val(ans), but we want to warn about cancellation here */
  if (lower_tail) {
    return log_p ? log(ans) : ans;
  } else {
    if (ans > 1 - 1e-10) ML_ERROR(ME.ME_PRECISION, 'pnbeta', printer_pnbeta2);
    if (ans > 1.0) ans = 1.0; /* Precaution */
    /* include standalone case */
    return log_p ? log1p(-ans) : 1 - ans;
  }
}

export function pnbeta<T>(
  _x: T,
  a: number,
  b: number,
  ncp: number,
  lower_tail: boolean,
  log_p: boolean
): T {

  const fa: number[] = Array.isArray(_x) ? _x : [_x] as any;

  const result = fa.map(x => {
    if (ISNAN(x) || ISNAN(a) || ISNAN(b) || ISNAN(ncp)) return x + a + b + ncp;

    let rc = R_P_bounds_01(lower_tail, log_p, x, 0, 1);
    if (rc !== undefined) {
      return rc;
    }
    return pnbeta2(x, 1 - x, a, b, ncp, lower_tail, log_p);
  });

  return result.length === 1 ? result[0] : result as any;
}
