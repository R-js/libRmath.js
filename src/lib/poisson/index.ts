import { dpois, dpois_raw } from './dpois';
import { ppois } from './ppois';
import { rpois } from './rpois';
import { qpois } from './qpois';

import { INormal, Normal } from '../normal';

export function Poisson(norm: INormal = Normal()) {
  return {
    rpois: (n: number = 1, lambda: number = 1) => rpois(n, lambda, norm),
    dpois: (x: number | number[], lambda: number = 1, logP: boolean = false) =>
      dpois(x, lambda, logP),
    ppois: (
      q: number | number[],
      lambda: number = 1,
      lowerTail: boolean = true,
      logP: boolean = false
    ) => ppois(q, lambda, lowerTail, logP, norm),
    qpois: (
      p: number | number[],
      lambda: number = 1,
      lowerTail: boolean = true,
      logP: boolean = false
    ) => qpois(p, lambda, lowerTail, logP, norm)
  };
}
