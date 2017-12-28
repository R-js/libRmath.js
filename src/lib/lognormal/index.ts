'use strict';
import { dlnorm } from './dlnorm';
import { plnorm } from './plnorm';
import { qlnorm } from './qlnorm';
import { rlnorm } from './rlnorm';

import { INormal, Normal } from '../normal';

export function LogNormal(norm: INormal = Normal()) {
  return {
    dlnorm,
    plnorm,
    qlnorm,
    rlnorm: (n: number, meanlog: number, sdlog: number): number | number[] =>
      rlnorm(n, meanlog, sdlog, norm)
  };
}
