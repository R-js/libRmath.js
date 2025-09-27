export { default as dbinom } from './dbinom';
export { default as pbinom } from './pbinom';
export { default as qbinom } from './qbinom';
import { default as rbinomOne } from './rbinom';
import { repeatedCall64 } from '@lib/r-func';

export function rbinom(n: number, size: number, prob: number): Float64Array {
    return repeatedCall64(n, rbinomOne, size, prob);
}

export { rbinomOne };
