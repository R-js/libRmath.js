import { dpois } from './dpois';
import { ppois } from './ppois';
import { qpois } from './qpois';
import { rpois } from './rpois';

import { Inversion, IRNGNormal } from '../rng/normal';


export function Poisson(rng: IRNGNormal = new Inversion()) {
  return {
    dpois,
    ppois,
    qpois,
    rpois: (n: number, lambda: number) => rpois(n, lambda, rng)
  };
}
