/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';
import { rnorm } from '../normal/rnorm';
import { arrayrify, map, seq } from '../r-func';
import { IRNGNormal } from '../rng/normal';

const exp = arrayrify(Math.exp);
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('rlnorm');
const sequence = seq()();

export function rlnorm(
  N: number,
  meanlog: number = 0,
  sdlog: number = 1,
  rng: IRNGNormal
): number | number[] {
  if (ISNAN(meanlog) || !R_FINITE(sdlog) || sdlog < 0) {
    return map(sequence(N))(() => ML_ERR_return_NAN(printer));
  }
  return exp(rnorm(N, meanlog, sdlog, rng));
}
