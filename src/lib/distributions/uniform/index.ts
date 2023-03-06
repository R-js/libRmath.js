'use strict';

export { dunif } from './dunif';
export { punif } from './punif';
export { qunif } from './qunif';
import { runifOne } from './runif';
import { repeatedCall64 } from '@lib/r-func';

export function runif(n: number, min = 0, max = 1): Float64Array {
    return repeatedCall64(n, runifOne, min, max);
}

export { runifOne };

// function dunif(x: number, min = 0, max = 1, log = false): number
// function punif(q: number, min = 0, max = 1, lowerTail = true, logP = false): number
// function qunif(p: number, min = 0, max = 1, lowerTail = true, logP = false): number
// function runif(n: number, min = 0, max = 1): Float64Array
// function runifOne(min: number, max: number): number