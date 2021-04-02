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
import { _qgamma } from './qgamma';
import { rgammaOne as _rgammaOne } from './rgamma';
import type { IRNGNormal } from '@rng/normal/normal-rng';
import { globalNorm } from '@rng/globalRNG';

import { repeatedCall } from '$helper';

function gammaNormalizeParams(rate?: number, scale?: number): number {
    //B: if scale and rate are undefined then _scale = 1
    //C: if scale and rate are both defined and scale != 1/rate, return undefined
    //D: if scale is defined and rate is not , use scale
    //E: if rate is defined and scale is not then use 1/rate
    //B
    if (scale === undefined && rate === undefined) {
        return 1;
    }
    //C
    if (scale !== undefined && rate !== undefined) {
        throw new TypeError('Both rate and scale are defined, use either scale or rate');
    }
    //D
    if (scale !== undefined && rate === undefined) {
        return scale;
    }
    //E
    if (scale === undefined && rate !== undefined) {
        return 1 / rate;
    }
    throw new Error('unreachable code, you cant be here!');
}

export { rgammaOne } from './rgamma';

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

export function rgamma(n: number, shape: number, rate?: number, scale?: number, rng: IRNGNormal = globalNorm()): Float32Array {
    const _scale = gammaNormalizeParams(rate, scale);
    return repeatedCall(n, _rgammaOne, shape, _scale, rng);
}



