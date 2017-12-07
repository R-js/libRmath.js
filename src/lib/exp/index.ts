import { dexp } from './dexp';
import { pexp } from './pexp';
import { qexp } from './qexp';
import { rexp } from './rexp';

import { IRNG, rng } from '../rng';
const { normal: { Inversion }, MersenneTwister } = rng;

export interface IExponential {
  rexp: (n: number, rate: number) => number | number[];
  dexp: (x: number|number[], rate: number, log: boolean) => number|number[];
  pexp: (q: number|number[], rate: number, lowerTail: boolean, logp: boolean) => number|number[];
  qexp: (_p: number | number[], rate: number, lowerTail: boolean, logp: boolean) => number|number[];
}

export function exponential(
  rng: IRNG = new MersenneTwister(0)
): IExponential {
  // underlying uniform PRNG
 // const unif_rand: () => number = rng.unif_rand.bind(rng);
  return {
    rexp: (n: number , rate: number) =>
      rexp(n, rate, rng),
    dexp,
    pexp,
    qexp
 };
}
