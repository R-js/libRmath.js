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

const { isFinite: R_FINITE } = Number;

const printer_rnbinom = debug('rnbinom');

export function rnbinom(
  n: number,
  size: number,
  prob: number,
  rng: IRNGNormal
): number| number[] {
  printer_rnbinom('n:%d, size:%d, prob:%d', n, size, prob);
  const result = new Array(n).fill(0).map(() => {
    if (
      !R_FINITE(size) ||
      !R_FINITE(prob) ||
      size <= 0 ||
      prob <= 0 ||
      prob > 1
    ) {
      /* prob = 1 is ok, PR#1218 */
      return ML_ERR_return_NAN(printer_rnbinom);
    }
    return prob === 1
      ? 0
      : (rpois(
          1,
          rgamma(1, size, (1 - prob) / prob, rng) as number,
          rng
        ) as number);
  });
  return result.length === 1 ? result[0] : result;
}

const printer_rnbinom_mu = debug('rnbinom_mu');

export function rnbinom_mu(n: number= 1, size: number, mu: number, rng: IRNGNormal): number| number[] {

  const result = new Array(n).fill(0).map(() => {

  if (!R_FINITE(size) || !R_FINITE(mu) || size <= 0 || mu < 0) {
    return ML_ERR_return_NAN(printer_rnbinom_mu);
  }
  return mu === 0
    ? 0
    : (rpois(
        1,
        rgamma(1, size, mu / size, rng) as number,
        rng
      ) as number);

});
return result.length === 1 ? result[0] :result ;
}
