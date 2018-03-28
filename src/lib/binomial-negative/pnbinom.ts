/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import { ML_ERR_return_NAN, R_DT_0, R_DT_1 } from '../common/_general';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const { floor, log } = Math;

import { pbeta } from '../beta/pbeta';
import { NumberW, Toms708 } from '../common/toms708';

const printer = debug('pnbinom');

export function pnbinom<T>(
  xx: T,
  size: number,
  prob: number,
  lowerTail: boolean,
  logP: boolean
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);

  const result = fx.map(x => {
    if (ISNAN(x) || ISNAN(size) || ISNAN(prob)) return x + size + prob;
    if (!R_FINITE(size) || !R_FINITE(prob)) {
      return ML_ERR_return_NAN(printer);
    }

    if (size < 0 || prob <= 0 || prob > 1) {
      return ML_ERR_return_NAN(printer);
    }

    /* limiting case: point mass at zero */
    if (size === 0)
      return x >= 0 ? R_DT_1(lowerTail, logP) : R_DT_0(lowerTail, logP);

    if (x < 0) return R_DT_0(lowerTail, logP);
    if (!R_FINITE(x)) return R_DT_1(lowerTail, logP);
    x = floor(x + 1e-7);
    return pbeta(prob, size, x + 1, lowerTail, logP);
  });

  return result.length === 1 ? result[0] : (result as any);
}

const printer_pnbinom_mu = debug('printer_pnbinom_mu');

export function pnbinom_mu<T>(
  xx: T,
  size: number,
  mu: number,
  lowerTail: boolean,
  logP: boolean
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);
  const result = fx.map(x => {
    if (ISNAN(x) || ISNAN(size) || ISNAN(mu)) return x + size + mu;
    if (!R_FINITE(size) || !R_FINITE(mu)) return ML_ERR_return_NAN(printer_pnbinom_mu);

    if (size < 0 || mu < 0) return ML_ERR_return_NAN(printer_pnbinom_mu);

    /* limiting case: point mass at zero */
    if (size === 0)
      return x >= 0 ? R_DT_1(lowerTail, logP) : R_DT_0(lowerTail, logP);

    if (x < 0) return R_DT_0(lowerTail, logP);
    if (!R_FINITE(x)) return R_DT_1(lowerTail, logP);
    x = floor(x + 1e-7);
    /* return
     * pbeta(pr, size, x + 1, lowerTail, logP);  pr = size/(size + mu), 1-pr = mu/(size+mu)
     *
     *= pbeta_raw(pr, size, x + 1, lowerTail, logP)
     *            x.  pin   qin
     *=  bratio (pin,  qin, x., 1-x., &w, &wc, &ierr, logP),  and return w or wc ..
     *=  bratio (size, x+1, pr, 1-pr, &w, &wc, &ierr, logP) */
    {
      let ierr = new NumberW(0);
      let w = new NumberW(0);
      let wc = new NumberW(0);
      Toms708.bratio(
        size,
        x + 1,
        size / (size + mu),
        mu / (size + mu),
        w,
        wc,
        ierr
      );
      if (ierr)
        printer('pnbinom_mu() -> bratio() gave error code %d', ierr.val);
      if (logP) {
        w.val = log(w.val);
        wc.val = log(wc.val);
      }
      return lowerTail ? w.val : wc.val;
    }
  });
  return result.length === 1 ? result[0] : (result as any);
}
