import { dhyper } from './dhyper';
import { phyper } from './phyper';
import { qhyper } from './qhyper';
import { rhyper as _rhyper } from './rhyper';

import { IRNG } from '../rng/irng';
import { MersenneTwister } from '../rng/mersenne-twister';


export function HyperGeometric(rng: IRNG = new MersenneTwister()) {
  //rhyper(nn, m, n, k)
  function rhyper(N: number, nn1in: number, nn2in: number, kkin: number) {
    return _rhyper(N, nn1in, nn2in, kkin, rng);
  }

  return {
    dhyper,
    phyper,
    qhyper,
    rhyper
  };
}
