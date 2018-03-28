/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import { ML_ERR_return_NAN, R_D_exp, R_DT_0 } from '../common/_general';
import { map } from '../r-func';

import * as debug from 'debug';
import { R_Log1_Exp } from './expm1';

const { expm1 } = Math;
const { isNaN: ISNAN } = Number;
const printer = debug('pexp');

export function pexp<T>(
  q: T,
  scale: number,
  lower_tail: boolean,
  log_p: boolean
): T {
  return map(q)(fx => {
    if (ISNAN(fx) || ISNAN(scale)) return fx + scale;
    if (scale < 0) {
      return ML_ERR_return_NAN(printer);
    }

    if (fx <= 0) return R_DT_0(lower_tail, log_p);
    /* same as weibull( shape = 1): */
    fx = -(fx / scale);
    return lower_tail
      ? log_p ? R_Log1_Exp(fx) : -expm1(fx)
      : R_D_exp(log_p, fx);
  }) as any;
}
