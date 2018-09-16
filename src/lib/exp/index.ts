/* This is a conversion from BLAS to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
    dexp: (x: number, rate = 1, asLog = false) =>
      _dexp(x, 1 / rate, asLog),

    pexp: (q: number, rate = 1, lowerTail = true, logP = false) =>
      _pexp(q, 1 / rate, lowerTail, logP),

    qexp: (p: number, rate = 1, lowerTail = true, logP = false) =>
      _qexp(p, 1 / rate, lowerTail, logP),

    rexp: (n: number, rate = 1) => _rexp(n, 1 / rate, rng)
  };
}
