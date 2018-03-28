/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';

import { R_Log1_Exp } from '../exp/expm1';

import { map } from '../r-func';

const {
  isNaN: ISNAN,
  POSITIVE_INFINITY: ML_POSINF,
  NEGATIVE_INFINITY: ML_NEGINF
} = Number;

const { log } = Math;

const printer_qlogis = debug('qlogis');

export function qlogis<T>(
  pp: T,
  location: number = 0,
  scale: number = 1,
  lower_tail: boolean = true,
  log_p: boolean = false
): T {
  return map(pp)(p => {
    if (ISNAN(p) || ISNAN(location) || ISNAN(scale))
      return p + location + scale;

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, ML_NEGINF, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }

    if (scale < 0) {
      return ML_ERR_return_NAN(printer_qlogis);
    }
    if (scale === 0) return location;

    /* p := logit(p) = log( p / (1-p) )	 : */
    if (log_p) {
      if (lower_tail) p = p - R_Log1_Exp(p);
      else p = R_Log1_Exp(p) - p;
    } else p = log(lower_tail ? p / (1 - p) : (1 - p) / p);

    return location + scale * p;
  }) as any;
}
