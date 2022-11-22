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
'use strict';
export { dnorm4 as dnorm } from './dnorm.js';
export { pnorm5 as pnorm } from './pnorm.js';
export { qnorm } from './qnorm.js';
import { rnormOne } from './rnorm.js';
import { repeatedCall64 } from '@lib/r-func.js';

import type { IRNGNormal } from '@rng/normal/normal-rng.js';

export function rnorm(n: number, mu?: number, sigma?: number, rng?:IRNGNormal): Float64Array {
    return repeatedCall64(n, rnormOne, mu, sigma, rng);
}
