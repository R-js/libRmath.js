'use strict';

import { runif } from './runif';
import { dunif } from './dunif';
import { punif } from './punif';
import { qunif } from './qunif';

import { rng, IRNG } from '../rng';
const { MersenneTwister } = rng;

export function uniform(rng: IRNG = new MersenneTwister()) {
  
  return {
    runif: (n: number = 1, a: number = 0, b: number= 1 ) => runif(n, a, b, rng.unif_rand),
    dunif,
    punif,
    qunif,
  };
}
