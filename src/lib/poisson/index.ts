import { dpois, dpois_raw } from './dpois';
import { ppois } from './ppois';
import { rpois } from './rpois';
import { qpois } from './qpois';

export { dpois_raw, rpois }; //needed for rnbinom

import { INormal, Normal } from '../normal';

export interface IPoisson {
  rpois: (n: number, lambda: number) => number | number[];
  dpois: (
    x: number | number[],
    lambda: number,
    logP: boolean
  ) => number | number[];
  ppois: (
    q: number | number[],
    lambda: number,
    lowerTail: boolean,
    logP: boolean
  ) => number | number[];
  qpois: (
    p: number | number[],
    lambda: number,
    lowerTail: boolean,
    logP: boolean
  ) => number | number[];
}

export function Poisson(norm: INormal = Normal()): IPoisson {
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
