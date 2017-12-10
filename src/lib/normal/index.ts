
'use strict';
import { dnorm4 as dnorm } from './dnorm';
import { pnorm5 as pnorm } from './pnorm';
import { qnorm } from './qnorm';
import { rnorm } from './rnorm';

import { IRNGNormal, rng } from '../rng';
const { normal: { BoxMuller }, SuperDuper } = rng;

export interface INormal {
  rnorm: (n: number, mu: number, sigma: number) => number | number[];
  dnorm: <T>(x: T, mu: number, sigma: number, give_log: boolean) => T;
  pnorm: <T>(
    x: T,
    mu: number,
    sigma: number,
    lower_tail: boolean,
    log_p: boolean
  ) => T;
  qnorm: <T>(
    p: T,
    mu: number,
    sigma: number,
    lower_tail: boolean,
    log_p: boolean
  ) => T;
  unif_rand: () => number;
  norm_rand: () => number;
}

export function normal(rng: IRNGNormal = new BoxMuller( new SuperDuper(0))): INormal {
 
  const norm_rand: () => number = rng.norm_rand.bind(rng);
  // underlying uniform PRNG
  const unif_rand: () => number = rng.unif_rand.bind(rng);
  return {
    rnorm: (n: number = 1, mu: number = 0, sigma = 1) =>
      rnorm(n, mu, sigma, norm_rand),
    dnorm,
    pnorm,
    qnorm,
    unif_rand,
    norm_rand
  };
}
