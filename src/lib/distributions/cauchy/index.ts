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
export { dcauchy } from './dcauchy';
export { pcauchy } from './pcauchy';
export { qcauchy } from './qcauchy';
import { rcauchyOne } from './rcauchy';

import { repeatedCall } from '$helper';
import type { IRNGNormal } from '@rng/normal/normal-rng';
import { globalNorm } from '@rng/globalRNG';


export function rcauchy(n: number, location = 0, scale = 1, rng?: IRNGNormal): Float32Array {
    const _rng = rng || globalNorm();
    return repeatedCall(n, rcauchyOne, location, scale, _rng);
}
