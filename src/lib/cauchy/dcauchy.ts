/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';

import { map } from '../r-func';

const { isNaN: ISNAN } = Number;
const { PI: M_PI, log } = Math;
const printer = debug('dcauchy');

export function dcauchy<T>(
  xx: T,
  location = 0,
  scale = 1,
  giveLog = false
): T {
  return map(xx)(x => {
    let y: number;
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(location) || ISNAN(scale)) {
      return x + location + scale;
    }

    if (scale <= 0) {
      return ML_ERR_return_NAN(printer);
    }

    y = (x - location) / scale;
    return giveLog
      ? -log(M_PI * scale * (1 + y * y))
      : 1 / (M_PI * scale * (1 + y * y));
  }) as any;
}
