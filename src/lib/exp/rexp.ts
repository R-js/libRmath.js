/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import { ML_ERR_return_NAN } from '../common/_general';

import * as debug from 'debug';
import { IRNG } from '../rng/irng';
import { exp_rand } from './sexp';

const { isFinite: R_FINITE } = Number;
const printer = debug('rexp');

export function rexp(
  n: number = 1,
  scale: number = 1,
  rng: IRNG
): number | number[] {
  const result = new Array(n).fill(0).map(m => {
    if (!R_FINITE(scale) || scale <= 0.0) {
      if (scale === 0) return 0;
      /* else */
      return ML_ERR_return_NAN(printer);
    }
    return scale * exp_rand(rng.unif_rand as any); // --> in ./sexp.c
  });

  return result.length === 1 ? result[0] : result;
}
