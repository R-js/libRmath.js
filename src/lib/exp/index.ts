import { dexp as _dexp } from './dexp';
import { pexp as _pexp } from './pexp';
import { qexp as _qexp } from './qexp';
import { rexp as _rexp } from './rexp';

import { IRNG, rng } from '../rng';
const { MersenneTwister } = rng;

export function Exponential(rng: IRNG = new MersenneTwister(0)) {
  /*
  NOTE: scale = 1/rate, the R code looks like
      > rexp
      function (n, rate = 1) 
        .Call(C_rexp, n, 1/rate)
        <bytecode: 0x0000000005f90fd0>
        <environment: namespace:stats>
  */
  return {
    dexp: (x: number | number[], rate = 1, asLog = false) =>
      _dexp(x, 1 / rate, asLog),

    pexp: (q: number | number[], rate = 1, lowerTail = true, logP = false) =>
      _pexp(q, 1 / rate, lowerTail, logP),

    qexp: (p: number | number[], rate = 1, lowerTail = true, logP = false) =>
      _qexp(p, 1 / rate, lowerTail, logP),

    rexp: (n: number, rate = 1) => _rexp(n, 1 / rate, rng)
  };
}
