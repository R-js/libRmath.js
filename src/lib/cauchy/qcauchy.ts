/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import { ML_ERR_return_NAN, R_Q_P01_check } from '../common/_general';

import { map } from '../r-func';
import { tanpi } from '../trigonometry/tanpi';

const { expm1, exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const { ML_POSINF, ML_NEGINF } = {
  ML_POSINF: Infinity,
  ML_NEGINF: -Infinity
};

const printer = debug('qcauchy');

export function qcauchy<T>(
  pp: T,
  location = 0,
  scale = 1,
  lowerTail = true,
  logP = false
): T {
  return map(pp)(p => {
    if (ISNAN(p) || ISNAN(location) || ISNAN(scale)) return NaN;
    let lower_tail = lowerTail;

    let rc = R_Q_P01_check(logP, p);
    if (rc !== undefined) {
      return rc;
    }

    if (scale <= 0 || !R_FINITE(scale)) {
      if (scale === 0) return location;
      /* else */ return ML_ERR_return_NAN(printer);
    }

    const my_INF = location + (lower_tail ? scale : -scale) * ML_POSINF;
    if (logP) {
      if (p > -1) {
        /* when ep := exp(p),
       * tan(pi*ep)= -tan(pi*(-ep))= -tan(pi*(-ep)+pi) = -tan(pi*(1-ep)) =
       *		 = -tan(pi*(-expm1(p))
       * for p ~ 0, exp(p) ~ 1, tan(~0) may be better than tan(~pi).
       */
        if (p === 0)
          /* needed, since 1/tan(-0) = -Inf  for some arch. */
          return my_INF;
        lower_tail = !lower_tail;
        p = -expm1(p);
      } else p = exp(p);
    } else {
      if (p > 0.5) {
        if (p === 1) return my_INF;
        p = 1 - p;
        lower_tail = !lower_tail;
      }
    }

    if (p === 0.5) return location; // avoid 1/Inf below
    if (p === 0) return location + (lower_tail ? scale : -scale) * ML_NEGINF; // p = 1. is handled above
    return location + (lower_tail ? -scale : scale) / tanpi(p);
    /*	-1/tan(pi * p) = -cot(pi * p) = tan(pi * (p - 1/2))  */
  }) as any;
}
