/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import {
  M_1_SQRT_2PI,
  M_LN_SQRT_2PI,
  ML_ERR_return_NAN,
  R_D__0
} from '../common/_general';
import { map } from '../r-func';

const { isNaN: ISNAN, POSITIVE_INFINITY: ML_POSINF } = Number;
const { log, exp } = Math;
const printer = debug('dlnorm');

export function dlnorm<T>(
  x: T,
  meanlog: number,
  sdlog: number,
  give_log: boolean
): T {
  return map(x)(fx => {
    if (ISNAN(fx) || ISNAN(meanlog) || ISNAN(sdlog)) {
      return fx + meanlog + sdlog;
    }
    if (sdlog <= 0) {
      if (sdlog < 0) {
        return ML_ERR_return_NAN(printer);
      }
      // sdlog == 0 :
      return log(fx) === meanlog ? ML_POSINF : R_D__0(give_log);
    }
    if (fx <= 0) {
      return R_D__0(give_log);
    }
    let y = (log(fx) - meanlog) / sdlog;
    return give_log
      ? -(M_LN_SQRT_2PI + 0.5 * y * y + log(fx * sdlog))
      : M_1_SQRT_2PI * exp(-0.5 * y * y) / (fx * sdlog);
    /* M_1_SQRT_2PI = 1 / sqrt(2 * pi) */
  }) as any;
}
