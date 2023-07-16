'use strict';

export { dpois } from './dpois';
export { ppois } from './ppois';
export { qpois } from './qpois';
import { rpoisOne } from './rpois';
import { repeatedCall } from '@lib/r-func';

export function rpois(n: number, lamda: number): Float32Array {
    return repeatedCall(n, rpoisOne, lamda);
}

export { rpoisOne };

// function dpois(x: number, lambda: number, log = false): number
// function ppois(q: number,lambda: number, lowerTail = true, logP = false): number
// function qpois(p: number, lambda: number, lowerTail = true, logP = false): number
// function rpois(n: number, lamda: number): Float32Array
// function rpoisOne(lambda: number): number
