import { dbinom } from './dbinom';
import { pbinom } from './pbinom';
import { qbinom } from './qbinom';
import { rbinom } from './rbinom';
import { INormal, Normal } from '../normal';

export function Binomial(rng: INormal = Normal()) {
  return {
    dbinom,
    pbinom,
    qbinom: (
      pp: number | number[],
      n: number,
      pr: number,
      lowerTail: boolean = true,
      logP: boolean = false
    ) => qbinom(pp, n, pr, lowerTail, logP, rng),
    rbinom: (N: number= 1, nin: number, pp: number) => rbinom(N, nin, pp, rng)
  };
}
