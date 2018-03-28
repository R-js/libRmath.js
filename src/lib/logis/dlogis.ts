/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';
import { map } from '../r-func';

const { log, exp, abs: fabs } = Math;
const { isNaN: ISNAN } = Number;

const printer_dlogis = debug('dlogis');

export function dlogis<T>(
  xx: T,
  location: number = 0,
  scale: number = 1,
  give_log: boolean = false
): T {
  return map(xx)(x => {
    let e: number;
    let f: number;

    if (ISNAN(x) || ISNAN(location) || ISNAN(scale)) return NaN;
    if (scale <= 0.0) {
      return ML_ERR_return_NAN(printer_dlogis);
    }

    x = fabs((x - location) / scale);
    e = exp(-x);
    f = 1.0 + e;
    return give_log ? -(x + log(scale * f * f)) : e / (scale * f * f);
  }) as any;
}
