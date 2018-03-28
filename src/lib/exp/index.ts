/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import { dexp as _dexp } from './dexp';
import { pexp as _pexp } from './pexp';
import { qexp as _qexp } from './qexp';
import { rexp as _rexp } from './rexp';

import { IRNG, rng } from '../rng';
const { MersenneTwister } = rng;

export function Exponential(rng: IRNG = new MersenneTwister(0)) {
  /*
  NOTE: scale = 1/rate, the R code looks like
      > rexp
      function (n, rate = 1) 
        .Call(C_rexp, n, 1/rate)
        <bytecode: 0x0000000005f90fd0>
        <environment: namespace:stats>
  */
  return {
    dexp: (x: number | number[], rate = 1, asLog = false) =>
      _dexp(x, 1 / rate, asLog),

    pexp: (q: number | number[], rate = 1, lowerTail = true, logP = false) =>
      _pexp(q, 1 / rate, lowerTail, logP),

    qexp: (p: number | number[], rate = 1, lowerTail = true, logP = false) =>
      _qexp(p, 1 / rate, lowerTail, logP),

    rexp: (n: number, rate = 1) => _rexp(n, 1 / rate, rng)
  };
}
