
'use strict';
import { dnorm4 } from './dnorm';
import { pnorm5 } from './pnorm';
import { qnorm as _qnorm } from './qnorm';
import { rnorm as _rnorm } from './rnorm';

import { IRNGNormal, rng as _rng } from '../rng';
const { normal: { Inversion } } = _rng;


/*export interface INormal {
  rnorm: (n: number, mu: number, sigma: number) => number | number[];
  dnorm: <T>(x: T, mu: number, sigma: number, giveLog: boolean) => T;
  pnorm: <T>(
    x: T,
    mu: number,
    sigma: number,
    lowerTail: boolean,
    logP: boolean
  ) => T;
  qnorm: <T>(
    p: T,
    mu: number,
    sigma: number,
    lower_tail: boolean,
    log_p: boolean
  ) => T;
  rng: IRNGNormal;
}*/

export function Normal(prng: IRNGNormal = new Inversion()) {

  return {
    rnorm: (n: number = 1, mu: number = 0, sigma = 1) =>
      _rnorm(n, mu, sigma, prng)
    ,
    dnorm: dnorm4,
    pnorm: pnorm5,
    qnorm: _qnorm,
    rng: prng,
  };
}
