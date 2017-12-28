import { dweibull } from './dweibull';
import { pweibull } from './pweibull';
import { qweibull } from './qweibull';
import { rweibull as _rweibull } from './rweibull';

import { IRNG, rng as _rng } from '../rng';

export function Weibull(rng: IRNG = new _rng.SuperDuper(0)) {
  function rweibull(n: number, shape: number, scale: number = 1) {
    return _rweibull(n, shape, scale, rng);
  }

  return {
    dweibull,
    pweibull,
    qweibull,
    rweibull
  };
}
