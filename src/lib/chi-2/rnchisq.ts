/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ML_ERR_return_NAN } from '../common/_general';

import { rgamma } from '../gamma/rgamma';
import { rpois } from '../poisson/rpois';
import { IRNGNormal } from '../rng/normal/inormal-rng';
import { rchisq } from './rchisq';

const printer = debug('rnchisq');
const { isFinite: R_FINITE } = Number;

export function rnchisq(
  n: number,
  df: number,
  lambda: number,
  rng: IRNGNormal
): number | number[] {

  const result = new Array(n).fill(0).map(() => {

    if (!R_FINITE(df) || !R_FINITE(lambda) || df < 0 || lambda < 0) {
      return ML_ERR_return_NAN(printer);
    }
    if (lambda === 0) {
      return df === 0 ? 0 : (rgamma(1, df / 2, 2, rng) as number);
    } else {
      let r = rpois(1, lambda / 2, rng) as number;
      if (r > 0) r = rchisq(1, 2 * r, rng) as number;
      if (df > 0) r += rgamma(1, df / 2, 2, rng) as number;
      return r;
    }
  });
  return result.length === 1 ? result[0] : result;
}
