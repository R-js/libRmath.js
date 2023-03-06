export { dbinom } from './dbinom';
export { pbinom } from './pbinom';
export { qbinom } from './qbinom';
import { rbinomOne } from './rbinom';
import { repeatedCall64 } from '@lib/r-func';

export function rbinom(
  n: number,
  size: number,
  prob: number
): Float64Array {
  return repeatedCall64(n, rbinomOne, size, prob);
}

export { rbinomOne };
