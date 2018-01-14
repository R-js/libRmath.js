'use strict';
import { dlnorm } from './dlnorm';
import { plnorm } from './plnorm';
import { qlnorm } from './qlnorm';
import { rlnorm } from './rlnorm';

import { Inversion, IRNGNormal } from '../rng/normal';

export function LogNormal(rng: IRNGNormal = new Inversion()) {
  return {
    dlnorm,
    plnorm,
    qlnorm,
    rlnorm: (n: number, meanlog: number = 0, sdlog: number = 1): number | number[] =>
      rlnorm(n, meanlog, sdlog, rng)
  };
}
