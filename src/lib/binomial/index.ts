import { INormal, Normal } from '../normal';
import { dbinom } from './dbinom';
import { pbinom } from './pbinom';
import { qbinom } from './qbinom';
import { rbinom } from './rbinom';

export function Binomial(rng: INormal = Normal()) {
  return {
    dbinom,
    pbinom,
    qbinom,
    rbinom: (N: number, nin: number, pp: number) => rbinom(N, nin, pp, rng)
  };
}
