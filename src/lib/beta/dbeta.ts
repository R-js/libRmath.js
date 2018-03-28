/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';

import {
  ML_ERR_return_NAN,
  R_D__0,
  R_D_exp,
  R_D_val
} from '../common/_general';

import { boolVector, numVector } from '../types';

import { dbinom_raw } from '../binomial/dbinom';
import { multiplexer } from '../r-func';
import { internal_lbeta } from './lbeta';

const { log , log1p } = Math;
const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer = debug('dbeta');

export function dbeta(_x: numVector, _a: numVector, _b: numVector, _asLog: boolVector): numVector {
  
  return multiplexer(_x, _a, _b, _asLog)((x, a, b, asLog) => {
    
    if (ISNAN(x) || ISNAN(a) || ISNAN(b)) return x + a + b;

    if (a < 0 || b < 0) return ML_ERR_return_NAN(printer);
    if (x < 0 || x > 1) return R_D__0(asLog);

    // limit cases for (a,b), leading to point masses

    if (a === 0 || b === 0 || !R_FINITE(a) || !R_FINITE(b)) {
      if (a === 0 && b === 0) {
        // point mass 1/2 at each of {0,1} :
        if (x === 0 || x === 1) return ML_POSINF;
        else return R_D__0(asLog);
      }
      if (a === 0 || a / b === 0) {
        // point mass 1 at 0
        if (x === 0) return ML_POSINF;
        else return R_D__0(asLog);
      }
      if (b === 0 || b / a === 0) {
        // point mass 1 at 1
        if (x === 1) return ML_POSINF;
        else return R_D__0(asLog);
      }
      // else, remaining case:  a = b = Inf : point mass 1 at 1/2
      if (x === 0.5) return ML_POSINF;
      else return R_D__0(asLog);
    }

    if (x === 0) {
      if (a > 1) return R_D__0(asLog);
      if (a < 1) return ML_POSINF;
      /* a == 1 : */ return R_D_val(asLog, b);
    }
    if (x === 1) {
      if (b > 1) return R_D__0(asLog);
      if (b < 1) return ML_POSINF;
      /* b == 1 : */ return R_D_val(asLog, a);
    }

    let lval: number;
    if (a <= 2 || b <= 2)
      lval = (a - 1) * log(x) + (b - 1) * log1p(-x) - internal_lbeta(a, b);
    else {
      lval = log(a + b - 1) + dbinom_raw(a - 1, a + b - 2, x, 1 - x, true);
    }
    return R_D_exp(asLog, lval);
  });

}
