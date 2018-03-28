/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_D_val, R_DT_0, R_DT_1 } from '../common/_general';

import { R_D_Clog } from '../common/_general';
import { map  } from '../r-func';
import { atanpi } from '../trigonometry';


const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const { abs: fabs } = Math;

const printer = debug('pcauchy');

export function pcauchy<T>(
  xx: T,
  location = 0,
  scale = 1,
  lowerTail = true,
  logP = false
): T {
  
  return map(xx)(x => {
    if (ISNAN(x) || ISNAN(location) || ISNAN(scale))
      return x + location + scale;

    if (scale <= 0) {
      return ML_ERR_return_NAN(printer);
    }

    x = (x - location) / scale;
    if (ISNAN(x)) {
      return ML_ERR_return_NAN(printer);
    }

    if (!R_FINITE(x)) {
      if (x < 0) return R_DT_0(lowerTail, logP);
      else return R_DT_1(lowerTail, logP);
    }

    if (!lowerTail) x = -x;
    /* for large x, the standard formula suffers from cancellation.
     * This is from Morten Welinder thanks to  Ian Smith's  atan(1/x) : */

    if (fabs(x) > 1) {
      let y = atanpi(1 / x);
      return x > 0 ? R_D_Clog(logP, y) : R_D_val(logP, -y);
    } else {
      return R_D_val(logP, 0.5 + atanpi(x));
    }
  }) as any;
}
