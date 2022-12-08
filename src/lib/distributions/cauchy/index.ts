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
import { rcauchyOne } from './rcauchy';

export { dcauchy } from './dcauchy';
export { pcauchy } from './pcauchy';
export { qcauchy } from './qcauchy';
export { rcauchyOne};

import { repeatedCall } from '@lib/r-func';
import { globalUni } from '@rng/global-rng';


export function rcauchy(n: number, location = 0, scale = 1, rng = globalUni()): Float32Array {
    return repeatedCall(n, rcauchyOne, location, scale, rng);
}
