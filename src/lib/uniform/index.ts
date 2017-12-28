'use strict';

import { dunif } from './dunif';
import { punif } from './punif';
import { qunif } from './qunif';
import { runif } from './runif';

import { IRNG, rng } from '../rng';
const { SuperDuper } = rng;

export interface IUniform {
  dunif: (
    x: number | number[],
    a: number,
    b: number,
    giveLog: boolean
  ) => number | number[];
  runif: ( n: number,
    a: number,
    b: number
  ) => number | number[];
  punif: (
    x: number | number[],
    a: number,
    b: number,
    lower_tail: boolean,
    log_p: boolean
  ) => number | number[];
}

export function Uniform(rng: IRNG = new SuperDuper(0)) {
  return {
    dunif,
    punif,
    qunif,
    rng, // class of the rng
    runif: (n: number = 1, a: number = 0, b: number = 1) =>
      runif(n, a, b, rng)
  };
}
