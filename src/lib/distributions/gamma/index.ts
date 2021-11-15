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

import { dgamma as _dgamma } from './dgamma';
import { pgamma as _pgamma } from './pgamma';
import { qgamma as _qgamma } from './qgamma';
import { rgamma as _rgamma } from './rgamma';
import type { IRNGNormal } from '@rng/normal/normal-rng';
import { globalNorm } from '@rng/global-rng';

import { repeatedCall64 } from '@lib/r-func';

function gammaNormalizeParams(rate?: number, scale?: number): number {
    // decision table
    //  |                  | rate=undefined | rate=value    |
    //  | ---------------- | -------------- | ------------- |
    //  | scale= undefined | return 1       | return 1/rate |
    //  | scale= vale      | return scale   | throw error   |


    if (scale === undefined) {
        if (rate === undefined) {
            return 1;
        }
        return 1 / rate;
    }
    // scale is defined
    if (rate === undefined) {
        return scale;
    }
    throw new TypeError("specify 'rate' or 'scale' but not both");
}

export { rgamma } from './rgamma';

export function dgamma(x: number, shape: number, rate?: number, scale?: number, asLog = false): number {
    const _scale = gammaNormalizeParams(rate, scale);
    return _dgamma(x, shape, _scale, asLog);
}

export function qgamma(q: number, shape: number, rate?: number, scale?: number, lowerTail = true, logP = false): number {
    const _scale = gammaNormalizeParams(rate, scale);
    return _qgamma(q, shape, _scale, lowerTail, logP);
}

export function pgamma(q: number, shape: number, rate?: number, scale?: number, lowerTail = true, logP = false): number {
    const _scale = gammaNormalizeParams(rate, scale);
    return _pgamma(q, shape, _scale, lowerTail, logP);
}

export function rgamma(
    n: number,
    shape: number,
    rate?: number,
    scale?: number,
    rng: IRNGNormal = globalNorm()
    ): Float64Array {
    const _scale = gammaNormalizeParams(rate, scale);
    return repeatedCall64(n, _rgamma, shape, _scale, rng);
}



