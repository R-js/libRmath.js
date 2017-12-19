import { dlogis } from './dlogis';
import { plogis } from './plogis';
import { qlogis } from './qlogis';
import { rlogis as _rlogis } from './rlogis';

import { IRNG, rng as _rng } from '../rng';

export function Logistic(rng: IRNG = new _rng.SuperDuper(0)) {
  //
  function rlogis(N: number = 1, location: number = 0, scale: number = 1) {
    return _rlogis(N, location, scale, rng);
  }

  return {
    rlogis,
    dlogis,
    qlogis,
    plogis
  };
}
