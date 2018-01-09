import { dpois } from './dpois';
import { ppois } from './ppois';
import { qpois } from './qpois';
import { rpois } from './rpois';

import { INormal, Normal } from '../normal';

export function Poisson(norm: INormal = Normal()) {
  return {
    dpois,
    ppois: (
      q: number | number[],
      lambda: number = 1,
      lowerTail: boolean = true,
      logP: boolean = false
    ) => ppois(q, lambda, lowerTail, logP),
    qpois: (
      p: number | number[],
      lambda: number = 1,
      lowerTail: boolean = true,
      logP: boolean = false
    ) => qpois(p, lambda, lowerTail, logP),
    rpois: (n: number, lambda: number = 1) => rpois(n, lambda, norm)
  };
}
