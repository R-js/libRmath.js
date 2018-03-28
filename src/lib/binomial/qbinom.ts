/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';

const { max: fmax2, min: fmin2, floor, sqrt } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, EPSILON: DBL_EPSILON } = Number;

import { NumberW } from '../common/toms708';
import { R_DT_qIv } from '../exp/expm1';
import { qnorm } from '../normal/qnorm';
import { map } from '../r-func';
import { pbinom } from './pbinom';

const printer_do_search = debug('do_search');

function do_search(
  y: number,
  z: NumberW,
  p: number,
  n: number,
  pr: number,
  incr: number
): number {
  if (z.val >= p) {
    /* search to the left */

    printer_do_search(
      'new z=%o >= p = %d  --> search to left (y--) ..',
      z,
      p
    );

    while (true) {
      let newz: number;
      if (
        y === 0 ||
        (newz = pbinom(y - incr, n, pr, /*l._t.*/ true, /*log_p*/ false)) < p
      )
        return y;
      y = fmax2(0, y - incr);
      z.val = newz;
    }
  } else {
    /* search to the right */

    printer_do_search(
      'new z=%d < p = %d  --> search to right (y++) ..',
      z.val,
      p
    );

    while (true) {
      y = fmin2(y + incr, n);
      if (
        y === n ||
        (z.val = pbinom(y, n, pr, /*l._t.*/ true, /*log_p*/ false)) >= p
      )
        return y;
    }
  }
}

export function qbinom<T>(
  pp: T,
  n: number,
  pr: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  return map(pp)(p => _qbinom(p, n, pr, lowerTail, logP)) as any;
}

const printer_qbinom = debug('_qbinom');

function _qbinom(
  p: number,
  size: number,
  pr: number,
  lower_tail: boolean,
  log_p: boolean
): number {
  let q: number;
  let mu: number;
  let sigma: number;
  let gamma: number;
  const z = new NumberW(0);
  let y: number;

  if (ISNAN(p) || ISNAN(size) || ISNAN(pr)) return NaN;

  if (!R_FINITE(size) || !R_FINITE(pr)) {
    return ML_ERR_return_NAN(printer_qbinom);
  }
  /* if log_p is true, p = -Inf is a legitimate value */
  if (!R_FINITE(p) && !log_p) {
    return ML_ERR_return_NAN(printer_qbinom);
  }

  if (!Number.isInteger(size)) {
    return ML_ERR_return_NAN(printer_qbinom);
  }

  if (pr < 0 || pr > 1 || size < 0) {
    return ML_ERR_return_NAN(printer_qbinom);
  }

  let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, size);
  if (rc !== undefined) {
    return rc;
  }

  //edge cases

  if (pr === 0 || size === 0) return 0;

  q = 1 - pr;
  if (q === 0) return size; /* covers the full range of the distribution */

  mu = size * pr; //mean
  sigma = sqrt(size * pr * q); //standard deviation

  gamma = (q - pr) / sigma; // = (  (1 - pr)-pr )/sd = (1 - 2pr)/sd

  printer_qbinom(
    'qbinom(p=%d, n=%d, pr=%d, l.t.=%s, log=%s): sigm=%d, gam=%d',
    p,
    size,
    pr,
    lower_tail,
    log_p,
    sigma,
    gamma
  );

  /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
  if (!lower_tail || log_p) {
    p = R_DT_qIv(lower_tail, log_p, p); /* need check again (cancellation!): */
    if (p === 0) return 0;
    if (p === 1) return size;
  }
  /* temporary hack --- FIXME --- */
  //if (p + 1.01 * DBL_EPSILON >= 1.) return size;
  if (Math.abs(p - 1) < DBL_EPSILON) {
    return size;
  }

  /* y := approx.value (Cornish-Fisher expansion) :  */
  z.val = qnorm(p, 0, 1, /*lower_tail*/ true, /*log_p*/ false);
  y = floor(mu + sigma * (z.val + gamma * (z.val * z.val - 1) / 6) + 0.5);

  if (y > size) {
    /* way off */ y = size;
  }

  printer_qbinom(
    '  new (p,1-p)=(%d,%d), z=qnorm(..)=%d, y=%d, size=%d',
    p,
    1 - p,
    z.val,
    y,
    size
  );

  z.val = pbinom(y, size, pr, /*lower_tail*/ true, /*log_p*/ false);

  /* fuzz to ensure left continuity: */
  p *= 1 - 64 * DBL_EPSILON;

  if (size < 1e5) {
    return do_search(y, z, p, size, pr, 1);
  }
  /* Otherwise be a bit cleverer in the search */

  let incr = floor(size * 0.001);
  let oldincr;
  do {
    console.log('loopdieloop');
    oldincr = incr;
    y = do_search(y, z, p, size, pr, incr);
    incr = fmax2(1, floor(incr / 100));
  } while (oldincr > 1 && incr > size * 1e-15);
  return y;
}
