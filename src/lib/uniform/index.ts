'use strict';

import { dunif } from './dunif';
import { punif } from './punif';
import { qunif } from './qunif';
import { runif } from './runif';

import { IRNG, rng } from '../rng';
const { MersenneTwister } = rng;

export function Uniform(rng: IRNG = new MersenneTwister(0)) {
  return {
    dunif,
    punif,
    qunif,
    rng, // class of the rng
    runif: (n: number = 1, min: number = 0, max: number = 1) =>
      runif(n, min, max, rng)
  };
}
