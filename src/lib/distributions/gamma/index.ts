import { dgamma as _dgamma } from './dgamma';
import { pgamma as _pgamma } from './pgamma';
import { qgamma as _qgamma } from './qgamma';
import { rgamma as _rgamma } from './rgamma';

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
    // scale !== defined
    if (rate === undefined) {
        return scale;
    }
    throw new TypeError("specify 'rate' or 'scale' but not both");
}

export function dgamma(x: number, shape: number, rate?: number, scale?: number, log = false): number {
    const _scale = gammaNormalizeParams(rate, scale);
    return _dgamma(x, shape, _scale, log);
}

export function qgamma(p: number, shape: number, rate?: number, scale?: number, lowerTail = true, logP = false): number {
    const _scale = gammaNormalizeParams(rate, scale);
    return _qgamma(p, shape, _scale, lowerTail, logP);
}

export function pgamma(q: number, shape: number, rate?: number, scale?: number, lowerTail = true, logP = false): number {
    const _scale = gammaNormalizeParams(rate, scale);
    return _pgamma(q, shape, _scale, lowerTail, logP);
}

export function rgamma(
    n: number,
    shape: number,
    rate?: number,
    scale?: number
): Float64Array {
    const _scale = gammaNormalizeParams(rate, scale);
    return repeatedCall64(n, _rgamma, shape, _scale);
}

export function rgammaOne(
    shape: number,
    rate?: number,
    scale?: number): number {
    const _scale = gammaNormalizeParams(rate, scale);
    return _rgamma(shape, _scale);
}



