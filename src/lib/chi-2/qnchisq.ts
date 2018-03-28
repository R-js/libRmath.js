/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import {
  ME,
  ML_ERR_return_NAN,
  ML_ERROR,
  R_D_qIv,
  R_Q_P01_boundaries
} from '../common/_general';

import { qchisq } from '../chi-2/qchisq';
import { map } from '../r-func';
import { pnchisq_raw } from './pnchisq';

const { expm1, min: fmin2 } = Math;
const {
  MAX_VALUE: DBL_MAX,
  MIN_VALUE: DBL_MIN,
  EPSILON: DBL_EPSILON,
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer = debug('_qnchisq');

export function qnchisq<T>(
  pp: T,
  df: number,
  ncp = 0,
  lowerTail = true,
  logP = false
): T {
  return map(pp)(p => _qnchisq(p, df, ncp, lowerTail, logP)) as any;
}

function _qnchisq(
  p: number,
  df: number,
  ncp: number,
  lower_tail: boolean = true,
  log_p: boolean = false
): number {

  printer('start');
  
  const accu = 1e-13;
  const racc = 4 * DBL_EPSILON;
  /* these two are for the "search" loops, can have less accuracy: */
  const Eps = 1e-11; /* must be > accu */
  const rEps = 1e-10; /* relative tolerance ... */

  // double
  let ux: number;
  let lx: number;
  let ux0: number;
  let nx: number;
  let pp: number;

  if (ISNAN(p) || ISNAN(df) || ISNAN(ncp)) {
    return NaN;
  }

  if (!R_FINITE(df)) {
    return ML_ERR_return_NAN(printer);
  }

  /* Was
     * df = floor(df + 0.5);
     * if (df < 1 || ncp < 0) ML_ERR_return_NAN;
     */
  if (df < 0 || ncp < 0) {
    return ML_ERR_return_NAN(printer);
  }

  let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
  if (rc !== undefined) {
    return rc;
  }

  pp = R_D_qIv(log_p, p);
  if (pp > 1 - DBL_EPSILON) {
    return lower_tail ? ML_POSINF : 0.0;
  }

  /* Invert pnchisq(.) :
     * 1. finding an upper and lower bound */
  {
    /* This is Pearson's (1959) approximation,
       which is usually good to 4 figs or so.  */
    //double
    let b;
    let c;
    let ff;
    
    b = ncp * ncp / (df + 3 * ncp);
    c = (df + 3 * ncp) / (df + 2 * ncp);
    ff = (df + 2 * ncp) / (c * c);
    ux = b + c * qchisq(p, ff, lower_tail, log_p);
    if (ux < 0) ux = 1;
    ux0 = ux;
  }

  if (!lower_tail && ncp >= 80) {
    /* in this case, pnchisq() works via lower_tail = TRUE */
    if (pp < 1e-10) ML_ERROR(ME.ME_PRECISION, 'qnchisq', printer);
    p = /* R_DT_qIv(p)*/ log_p ? -expm1(p) : 0.5 - p + 0.5;
    lower_tail = true;
  } else {
    p = pp;
  }

  pp = fmin2(1 - DBL_EPSILON, p * (1 + Eps));
  if (lower_tail) {
    for (
      ;
      ux < DBL_MAX &&
      pnchisq_raw(ux, df, ncp, Eps, rEps, 10000, true, false) < pp;
      ux *= 2
    );
    pp = p * (1 - Eps);
    for (
      lx = fmin2(ux0, DBL_MAX);
      lx > DBL_MIN &&
      pnchisq_raw(lx, df, ncp, Eps, rEps, 10000, true, false) > pp;
      lx *= 0.5
    );
  } else {
    for (
      ;
      ux < DBL_MAX &&
      pnchisq_raw(ux, df, ncp, Eps, rEps, 10000, false, false) > pp;
      ux *= 2
    );
    pp = p * (1 - Eps);
    for (
      lx = fmin2(ux0, DBL_MAX);
      lx > DBL_MIN &&
      pnchisq_raw(lx, df, ncp, Eps, rEps, 10000, false, false) < pp;
      lx *= 0.5
    );
  }

  /* 2. interval (lx,ux)  halving : */
  if (lower_tail) {
    do {
      nx = 0.5 * (lx + ux);
      if (pnchisq_raw(nx, df, ncp, accu, racc, 100000, true, false) > p)
        ux = nx;
      else lx = nx;
    } while ((ux - lx) / nx > accu);
  } else {
    do {
      nx = 0.5 * (lx + ux);
      if (
        pnchisq_raw(nx, df, ncp, accu, racc, 100000, false, false) < p
      )
        ux = nx;
      else lx = nx;
    } while ((ux - lx) / nx > accu);
  }
  return 0.5 * (ux + lx);
}
