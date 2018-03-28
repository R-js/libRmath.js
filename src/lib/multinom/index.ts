/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import { dmultinom, IdmultinomOptions } from './dmultinom';
import { rmultinom as _rmultinom } from './rmultinom';
//FIXME: convert dmultinom from pure R to ts equivalent

import { IRNG } from '../rng/irng';
import { MersenneTwister } from '../rng/mersenne-twister';

export { IdmultinomOptions };

export function Multinomial(rng: IRNG = new MersenneTwister(0)) {
  function rmultinom(n: number, size: number, prob: number | number[]) {
    return _rmultinom(n, size, prob, rng);
  }
  return {
    rmultinom,
    dmultinom
  };
}
