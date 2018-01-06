import { MersenneTwister } from 'src/lib/rng/mersenne-twister';
import { IRNG } from '../rng/irng';
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
