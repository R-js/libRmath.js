import { dhyper } from './dhyper';
import { phyper } from './phyper';
import { qhyper } from './qhyper';
import { rhyper as _rhyper } from './rhyper';

import { INormal, Normal } from '~normal';

export function HyperGeometric(rng: INormal = Normal()) {
  //rhyper(nn, m, n, k)
  function rhyper(N: number = 1, nn1in: number, nn2in: number, kkin: number) {
    return _rhyper(N, nn1in, nn2in, kkin, rng);
  }

  return {
    dhyper,
    phyper,
    qhyper,
    rhyper
  };
}
