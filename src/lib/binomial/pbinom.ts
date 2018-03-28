/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { pbeta } from '../beta/pbeta';
import {
  ML_ERR_return_NAN,
  R_DT_0,
  R_DT_1,
  R_nonint
} from '../common/_general';
import { map } from '../r-func';

const printer = debug('pbinom');
const { floor, round: R_forceint } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

export function pbinom<T>(
  xx: T,
  n: number,
  p: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  return map(xx)(x => {
    if (ISNAN(x) || ISNAN(n) || ISNAN(p)) return NaN;
    if (!R_FINITE(n) || !R_FINITE(p)) {
      return ML_ERR_return_NAN(printer);
    }

    let lower_tail = lowerTail;
    let log_p = logP;

    if (R_nonint(n)) {
      printer('non-integer n = %d', n);
      return ML_ERR_return_NAN(printer);
    }
    n = R_forceint(n);
    /* 
     PR#8560: n=0 is a valid value 
  */
    if (n < 0 || p < 0 || p > 1) return ML_ERR_return_NAN(printer);

    if (x < 0) return R_DT_0(lower_tail, log_p);
    x = floor(x + 1e-7);
    if (n <= x) return R_DT_1(lower_tail, log_p);
    printer('calling pbeta:(q=%d,a=%d,b=%d, l.t=%s, log=%s', p, x + 1, n - x, !lower_tail, log_p);
    return pbeta(p, x + 1, n - x, !lower_tail, log_p);
  }) as any;
}
