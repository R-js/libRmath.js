/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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
import { dexp as _dexp} from './dexp';
import { pexp as _pexp} from './pexp';
import { qexp as _qexp} from './qexp.js';
import { rexpOne } from './rexp.js';

import { globalUni } from '@lib/rng/global-rng.js';
import type { IRNG } from '@rng/irng.js';
import { repeatedCall64 } from '@lib/r-func.js';

export function dexp(x: number, rate = 1, asLog = false): number{
  return _dexp(x, 1 / rate, asLog);
}

export function pexp(q: number, rate = 1, lowerTail = true, logP = false): number {
  return _pexp(q, 1 / rate, lowerTail, logP);
}

export function qexp(p: number, rate = 1, lowerTail = true, logP = false): number { 
  return _qexp(p, 1 / rate, lowerTail, logP);
}

export  function rexp(n: number, rate = 1, rng: IRNG = globalUni()):Float64Array{
  return repeatedCall64(n, rexpOne, 1 / rate, rng);
}
