import { dcauchy } from './dcauchy';
import { pcauchy } from './pcauchy';
import { qcauchy } from './qcauchy';
import { rcauchy } from './rcauchy';

import { IRNG, rng } from '../rng';

const { SuperDuper } = rng;

export interface ICauchy {
  rcauchy: (n: number, location: number, scale: number) => number | number[];
  dcauchy: (
    x: number | number,
    location: number,
    scale: number,
    giveLog: boolean
  ) => number | number[];
  pcauchy: (
    x: number | number[],
    location: number,
    scale: number,
    lowerTail: boolean,
    logP: boolean
  ) => number | number[];
  qcauchy: (
    p: number | number[],
    location: number,
    scale: number,
    lowerTail: boolean,
    logP: boolean
  ) => number | number[];
}

export function cauchy(rng: IRNG = new SuperDuper(0)): ICauchy {
  return {
    rcauchy: (n: number = 1, location: number, scale: number) =>
      rcauchy(n, location, scale, rng),
    dcauchy: (
      x: number | number,
      location: number,
      scale: number,
      giveLog: boolean
    ) => dcauchy(x, location, scale, giveLog),
    pcauchy: (
      x: number | number[],
      location: number,
      scale: number,
      lowerTail: boolean,
      logP: boolean
    ) => pcauchy(x, location, scale, lowerTail, logP),
    qcauchy: (
      p: number | number[],
      location: number,
      scale: number,
      lowerTail: boolean,
      logP: boolean
    ) => qcauchy(p, location, scale, lowerTail, logP)
  };
}
