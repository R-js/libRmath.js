/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import { ML_ERR_return_NAN, R_P_bounds_Inf_01 } from '../common/_general';
import { map } from '../r-func';

const { exp, log1p } = Math;
const { isNaN: ISNAN } = Number;


export function Rf_log1pexp(x: number): number {
  if (x <= 18) return log1p(exp(x));
  if (x > 33.3) return x;
  // else: 18.0 < x <= 33.3 :
  return x + exp(-x);
}

const printer_plogis = debug('plogis');

export function plogis<T>(
  xx: T,
  location: number = 0,
  scale: number = 1,
  lower_tail: boolean = true,
  log_p: boolean = false
): T {


  return map(xx)(x => {
    if (ISNAN(x) || ISNAN(location) || ISNAN(scale))
      return x + location + scale;

    if (scale <= 0.0) {
      return ML_ERR_return_NAN(printer_plogis);
    }

    x = (x - location) / scale;
    if (ISNAN(x)) {
      return ML_ERR_return_NAN(printer_plogis);
    }
    let rc = R_P_bounds_Inf_01(lower_tail, log_p, x);
    if (rc !== undefined) {
      return rc;
    }

    if (log_p) {
      // log(1 / (1 + exp( +- x ))) = -log(1 + exp( +- x))
      return -Rf_log1pexp(lower_tail ? -x : x);
    } else {
      return 1 / (1 + exp(lower_tail ? -x : x));
    }
  }) as any;

}
