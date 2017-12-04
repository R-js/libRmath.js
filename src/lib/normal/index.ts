/*export * from './lognormal/dlnorm';
export * from './lognormal/plnorm';
export * from './lognormal/qlnorm';
export * from './lognormal/rlnorm';
*/

'use strict';
import { dnorm4 as dnorm } from './dnorm';
import { pnorm5 as pnorm } from './pnorm';
import { qnorm } from './qnorm';
import { rnorm } from './rnorm';
//export { snorm } from './snorm';

import { rng, IRNG } from '../rng';
const { MersenneTwister } = rng;

export interface INormal {
  rnorm: (n: number, mu: number, sigma: number) => number | number[];
  dnorm: (x: number, mu: number, sigma: number, give_log: boolean) => number;
  pnorm: (
    x: number,
    mu: number,
    sigma: number,
    lower_tail: boolean,
    log_p: boolean
  ) => number;
  qnorm: (
    p: number,
    mu: number,
    sigma: number,
    lower_tail: boolean,
    log_p: boolean
  ) => number;
  unif_rand: () => number;
  norm_rand: () => number;
}

export function normal(rng: IRNG = new MersenneTwister()): INormal {
  // replace this with norm rand
  const unif_rand: () => number = rng.unif_rand.bind(rng);
  const norm_rand: () => number = rng.unif_rand.bind(rng);
  return {
    rnorm: (n: number = 1, mu: number = 0, sigma = 1) =>
      rnorm(n, mu, sigma, unif_rand),
    dnorm,
    pnorm,
    qnorm,
    unif_rand,
    norm_rand
  };
}
