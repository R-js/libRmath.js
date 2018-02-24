import { IRNG } from '../rng/irng';
import { MersenneTwister } from '../rng/mersenne-twister';
import { dbinom } from './dbinom';
import { pbinom } from './pbinom';
import { qbinom } from './qbinom';
import { rbinom } from './rbinom';

export function Binomial(rng: IRNG = new MersenneTwister()) {
  return {
    dbinom,
    pbinom,
    qbinom,
    rbinom: (N: number, nin: number, pp: number) => rbinom(N, nin, pp, rng)
  };
}
