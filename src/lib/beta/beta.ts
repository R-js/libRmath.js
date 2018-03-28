/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ME, ML_ERR_return_NAN, ML_ERROR } from '../common/_general';
import { gammafn } from '../gamma/gamma_fn';
import { multiplexer } from '../r-func';
import { internal_lbeta } from './lbeta';

//const xmin =  - 170.5674972726612;
const xmax = 171.61447887182298;
const lnsml = -708.39641853226412;

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer_beta = debug('beta');

export function beta(_a: number | number[], _b: number | number[]): number | number[] {
  return multiplexer(_a, _b)((a, b) => internal_beta(a, b));
}

export function internal_beta(a: number, b: number): number {


  if (ISNAN(a) || ISNAN(b)) return a + b;

  if (a < 0 || b < 0) return ML_ERR_return_NAN(printer_beta);
  else if (a === 0 || b === 0) return ML_POSINF;
  else if (!R_FINITE(a) || !R_FINITE(b)) return 0;

  if (a + b < xmax) {
    //
    // ~= 171.61 for IEEE
    //	return gammafn(a) * gammafn(b) / gammafn(a+b);
    // All the terms are positive, and all can be large for large
    //   or small arguments.  They are never much less than one.
    //   gammafn(x) can still overflow for x ~ 1e-308,
    //   but the result would too.
    //
    return 1 / gammafn(a + b) * gammafn(a) * gammafn(b);
  } else {
    let val: number = internal_lbeta(a, b);
    // underflow to 0 is not harmful per se;  exp(-999) also gives no warning
    //#ifndef IEEE_754
    if (val < lnsml) {
      // a and/or b so big that beta underflows
      ML_ERROR(ME.ME_UNDERFLOW, 'beta', printer_beta);
      // return ML_UNDERFLOW; pointless giving incorrect value
    }
    //#endif
    return Math.exp(val);
  }

}
