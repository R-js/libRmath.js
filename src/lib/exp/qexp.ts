/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import { ML_ERR_return_NAN, R_DT_0, R_Q_P01_check } from '../common/_general';
import { map } from '../r-func';
import { R_DT_Clog } from './expm1';

const { isNaN: ISNAN } = Number;
const printer = debug('qexp');

export function qexp<T>(_p: T, scale: number, lower_tail: boolean, log_p: boolean): T {
  return map(_p)(p => {
    if (ISNAN(p) || ISNAN(scale)) return p + scale;

    if (scale < 0) return ML_ERR_return_NAN(printer);

    let rc = R_Q_P01_check(log_p, p);
    if (rc !== undefined) {
      return rc;
    }
    if (p === R_DT_0(lower_tail, log_p)) return 0;

    return -scale * R_DT_Clog(lower_tail, log_p, p);
  }) as any;
}
