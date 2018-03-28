/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';

import { R_DT_qIv } from '../exp/expm1';
import { map } from '../r-func';
import { pnbeta } from './pnbeta';

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  MIN_VALUE: DBL_MIN,
  EPSILON: DBL_EPSILON
} = Number;

const { min: fmin2 } = Math;

const printer_qnbeta = debug('qnbeta');

export function qnbeta<T>(
  _p: T,
  a: number,
  b: number,
  ncp: number,
  lower_tail: boolean,
  log_p: boolean
): T {
  const accu = 1e-15;
  const Eps = 1e-14; /* must be > accu */

  return map(_p)(p => {
    let ux;
    let lx;
    let nx;
    let pp;

    if (ISNAN(p) || ISNAN(a) || ISNAN(b) || ISNAN(ncp)) return p + a + b + ncp;

    if (!R_FINITE(a)) return ML_ERR_return_NAN(printer_qnbeta);

    if (ncp < 0 || a <= 0 || b <= 0) return ML_ERR_return_NAN(printer_qnbeta);

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, 1);
    if (rc !== undefined) {
      return rc;
    }
    p = R_DT_qIv(lower_tail, log_p, p);

    /* Invert pnbeta(.) :
     * 1. finding an upper and lower bound */
    if (p > 1 - DBL_EPSILON) return 1.0;
    pp = fmin2(1 - DBL_EPSILON, p * (1 + Eps));
    for (
      ux = 0.5;
      ux < 1 - DBL_EPSILON && pnbeta(ux, a, b, ncp, true, false) < pp;
      ux = 0.5 * (1 + ux)
    );
    pp = p * (1 - Eps);
    for (
      lx = 0.5;
      lx > DBL_MIN && pnbeta(lx, a, b, ncp, true, false) > pp;
      lx *= 0.5
    );

    /* 2. interval (lx,ux)  halving : */
    do {
      nx = 0.5 * (lx + ux);
      if (pnbeta(nx, a, b, ncp, true, false) > p) ux = nx;
      else lx = nx;
    } while ((ux - lx) / nx > accu);

    return 0.5 * (ux + lx);
  }) as any;
}
