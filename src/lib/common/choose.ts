/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
/* These are recursive, so we should do a stack check */
import * as debug from 'debug';
import { isOdd } from '../common/_general';

const { abs: fabs, log, exp, round } = Math;
const { isInteger, NEGATIVE_INFINITY: ML_NEGINF, isNaN: ISNAN } = Number;

import { internal_lbeta } from '../beta/lbeta';
import { lgammafn } from '../gamma/lgamma_fn';
import { lgammafn_sign } from '../gamma/lgammafn_sign';
import { multiplexer } from '../r-func';
import { numVector } from '../types';

// used by "qhyper"
function lfastchoose(n: number, k: number) {
  return -log(n + 1) - internal_lbeta(n - k + 1, k + 1);
}
/* mathematically the same:
   less stable typically, but useful if n-k+1 < 0 : */

function lfastchoose2(n: number, k: number, sChoose?: number[]) {
  let r: number;
  r = lgammafn_sign(n - k + 1, sChoose);
  return lgammafn(n + 1) - lgammafn(k + 1) - r;
}


export function choose(_n: numVector, _k: numVector): numVector {
  return multiplexer(_n, _k)((n, k) => internal_choose(n, k));
}

export function lchoose(_n: numVector, _k: numVector): numVector {
  return multiplexer(_n, _k)((n, k) => internal_lchoose(n, k));
}

const printer_lchoose = debug('lchoose');

export function internal_lchoose(n: number, k: number): number {
  let k0 = k;
  k = Math.round(k);
  /* NaNs propagated correctly */
  if (ISNAN(n) || ISNAN(k)) return n + k;
  if (fabs(k - k0) > 1e-7)
    printer_lchoose('"k" (%d) must be integer, rounded to %d', k0, k);
  if (k < 2) {
    if (k < 0) return ML_NEGINF;
    if (k === 0) return 0;
    /* else: k == 1 */
    return log(fabs(n));
  }
  /* else: k >= 2 */
  if (n < 0) {
    return internal_lchoose(-n + k - 1, k);
  } else if (isInteger(n)) {
    n = round(n);
    if (n < k) return ML_NEGINF;
    /* k <= n :*/
    if (n - k < 2) return internal_lchoose(n, n - k); /* <- Symmetry */
    /* else: n >= k+2 */
    return lfastchoose(n, k);
  }
  /* else non-integer n >= 0 : */
  if (n < k - 1) {
    return lfastchoose2(n, k);
  }
  return lfastchoose(n, k);
}

const k_small_max = 30;

/* 30 is somewhat arbitrary: it is on the *safe* side:
 * both speed and precision are clearly improved for k < 30.
*/
const printer_choose = debug('choose');

export function internal_choose(n: number, k: number): number {
  let r: number;
  let k0 = k;
  k = round(k);
  /* NaNs propagated correctly */
  if (ISNAN(n) || ISNAN(k)) return n + k;
  if (fabs(k - k0) > 1e-7)
    printer_choose('k (%d) must be integer, rounded to %d', k0, k);
  if (k < k_small_max) {
    let j: number;
    if (n - k < k && n >= 0 && isInteger(n)) k = n - k; /* <- Symmetry */
    if (k < 0) return 0;
    if (k === 0) return 1;
    /* else: k >= 1 */
    r = n;
    for (j = 2; j <= k; j++) r *= (n - j + 1) / j;
    return isInteger(n) ? round(r) : r;
    /* might have got rounding errors */
  }
  /* else: k >= k_small_max */
  if (n < 0) {
    r = internal_choose(-n + k - 1, k);
    if (isOdd(k)) r = -r;
    return r;
  } else if (isInteger(n)) {
    n = round(n);
    if (n < k) return 0;
    if (n - k < k_small_max) return internal_choose(n, n - k); /* <- Symmetry */
    return round(exp(lfastchoose(n, k)));
  }
  /* else non-integer n >= 0 : */
  if (n < k - 1) {
    let schoose: number[] = [0];
    r = lfastchoose2(n, k, /* -> */ schoose);
    return schoose[0] * exp(r);
  }
  return exp(lfastchoose(n, k));
}
