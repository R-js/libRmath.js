import { dcauchy } from './dcauchy';
import { pcauchy } from './pcauchy';
import { qcauchy } from './qcauchy';
import { rcauchy } from './rcauchy';

import { MersenneTwister } from 'src/lib/rng/mersenne-twister';
import { IRNG, rng } from '../rng';

export function Cauchy(rng = new MersenneTwister(0)) {
  return {
    rcauchy: (n: number, location = 0, scale = 1) =>
      rcauchy(n, location, scale, rng),
    dcauchy,
    pcauchy,
    qcauchy
  };
}
