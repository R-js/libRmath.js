/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';
import { ML_ERR_return_NAN, R_D__0 } from '../common/_general';
import { dpois_raw } from '../poisson/dpois';
import { map } from '../r-func';

const { log } = Math;
const { isNaN: ISNAN } = Number;
const ML_POSINF = Infinity;

const printer = debug('dgamma');

export function dgamma<T>(
  xx: T,
  shape: number,
  scale: number,
  aslog: boolean = false
): T {
  return map(xx)(x => {
    let pr: number;

    if (ISNAN(x) || ISNAN(shape) || ISNAN(scale)) return x + shape + scale;
    if (shape < 0 || scale <= 0) {
      return ML_ERR_return_NAN(printer);
    }
    if (x < 0) {
      return R_D__0(aslog);
    }
    if (shape === 0) {
      /* point mass at 0 */
      return x === 0 ? ML_POSINF : R_D__0(aslog);
    }
    if (x === 0) {
      if (shape < 1) return ML_POSINF;
      if (shape > 1) {
        return R_D__0(aslog);
      }
      /* else */
      return aslog ? -log(scale) : 1 / scale;
    }

    if (shape < 1) {
      pr = dpois_raw(shape, x / scale, aslog);
      return aslog ? pr + log(shape / x) : pr * shape / x;
    }
    /* else  shape >= 1 */
    pr = dpois_raw(shape - 1, x / scale, aslog);
    return aslog ? pr - log(scale) : pr / scale;
  }) as any;
}
