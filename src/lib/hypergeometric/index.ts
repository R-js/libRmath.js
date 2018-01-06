import { dhyper } from './dhyper';
import { phyper } from './phyper';
import { qhyper } from './qhyper';
import { rhyper as _rhyper } from './rhyper';

import { MersenneTwister } from 'src/lib/rng/mersenne-twister';
import { IRNG } from '../rng/irng';


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
