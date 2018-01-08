import { IRNG } from '../rng/irng';
import { MersenneTwister } from '../rng/mersenne-twister';
import { dlogis } from './dlogis';
import { plogis } from './plogis';
import { qlogis } from './qlogis';
import { rlogis as _rlogis } from './rlogis';

export function Logistic(rng: IRNG = new MersenneTwister(0)) {
  //
  function rlogis(N: number, location: number = 0, scale: number = 1) {
    return _rlogis(N, location, scale, rng);
  }

  return {
    dlogis,
    plogis,
    qlogis,
    rlogis
  };
}
