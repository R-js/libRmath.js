
'use strict';
import { dnorm4 as dnorm } from './dnorm';
import { pnorm5 as pnorm } from './pnorm';
import { qnorm  } from './qnorm';
import { rnorm } from './rnorm';

import { IRNGNormal, rng as _rng } from '../rng';
const { normal: { Inversion } } = _rng;


export function Normal(prng: IRNGNormal = new Inversion()) {

  return {
    rnorm,
    dnorm,
    pnorm,
    qnorm,
    rng: prng,
  };
}
