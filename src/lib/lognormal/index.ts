'use strict';
import { dlnorm } from './dlnorm';
import { plnorm } from './plnorm';
import { qlnorm } from './qlnorm';
import { rlnorm } from './rlnorm';

import { INormal, Normal } from '../normal';

export interface ILogNormal {
  rlnorm: (n: number, meanlog: number, sdlog: number) => number | number[];
  dlnorm: (
    x: number | number[],
    mu: number,
    sigma: number,
    give_log: boolean
  ) => number | number[];
  plnorm: (
    x: number | number[],
    mu: number,
    sigma: number,
    lower_tail: boolean,
    log_p: boolean
  ) => number | number[];
  qlnorm: (
    p: number | number[],
    mu: number,
    sigma: number,
    lower_tail: boolean,
    log_p: boolean
  ) => number | number[];
}

export function LogNormal(norm: INormal = Normal() ): ILogNormal {
  return {
    rlnorm: (n: number, meanlog: number, sdlog: number): number | number[] =>
      rlnorm(n, meanlog, sdlog, norm),
    dlnorm,
    plnorm,
    qlnorm
  };
}
