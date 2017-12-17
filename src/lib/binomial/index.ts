import { dbinom } from './dbinom';
import { pbinom } from './pbinom';
import { qbinom } from './qbinom';
import { rbinom } from './rbinom';
import { INormal, Normal } from '../normal';

export interface IBinomial {
  dbinom: (
    N: number,
    x: number,
    n: number,
    p: number,
    logX: boolean
  ) => number | number[];
  pbinom: (
    xx: number | number[],
    n: number,
    p: number,
    lower_tail: boolean,
    log_p: boolean
  ) => number | number[];
  qbinom: (
    pp: number | number[],
    n: number,
    pr: number,
    lowerTail: boolean,
    logP: boolean
  ) => number | number[];
  rbinom: (N: number, nin: number, pp: number) => number | number[];
}

export function Binomial(rng: INormal = Normal()): IBinomial {
  return {
    dbinom: (N: number = 1, x: number, n: number, p: number, logX: boolean) =>
      dbinom(N, x, n, p, logX),
    pbinom: (
      xx: number | number[],
      n: number,
      p: number,
      lower_tail: boolean,
      log_p: boolean
    ) => pbinom(xx, n, p, lower_tail, log_p),
    qbinom: (
      pp: number | number[],
      n: number,
      pr: number,
      lowerTail: boolean,
      logP: boolean
    ) => qbinom(pp, n, pr, lowerTail, logP, rng),
    rbinom: (N: number= 1, nin: number, pp: number) => rbinom(N, nin, pp, rng)
  };
}
