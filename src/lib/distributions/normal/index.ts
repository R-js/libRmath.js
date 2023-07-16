'use strict';
export { dnorm4 as dnorm } from './dnorm';
export { pnorm5 as pnorm } from './pnorm';
export { qnorm } from './qnorm';
import { rnormOne } from './rnorm';
import { repeatedCall64 } from '@lib/r-func';

export function rnorm(n: number, mean = 0, sd = 1): Float64Array {
    return repeatedCall64(n, rnormOne, mean, sd);
}

export { rnormOne };
