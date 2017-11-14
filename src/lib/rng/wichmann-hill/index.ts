'use strict';

/*
 *  Javascript conversion by Jacob Bogers Nov 2017
 *  jkfbogers@gmail.com
 * 
 *  The Wichmann–Hill generator has a cycle length of 6.9536e12
 *  (= prod(p-1)/4, see Applied Statistics (1984) 33,
 *  123 which corrects the original article).
 * 
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 1995, 1996  Robert Gentleman and Ross Ihaka
 *  Copyright (C) 1997--2016  The R Core Team
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 *  https://www.R-project.org/Licenses/
 */

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { warning, error } from '../../_logging';
import { IRNGType } from '../IRNGType';
import { timeseed } from '../timeseed';

const SEED_LEN = 3;
const buf = new ArrayBuffer(SEED_LEN * 4);

const WICHMANN_HILL = {
  kind: IRNGType.WICHMANN_HILL,
  name: 'Wichmann-Hill',
  seed: new Uint32Array(buf).fill(0)
};

function fixup(x: number) {
  const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */
  /* ensure 0 and 1 are never returned */
  if (x <= 0.0) return 0.5 * i2_32m1;
  if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
  return x;
}

export function unif_rand(): number {
  const seeds = WICHMANN_HILL.seed;
  seeds[0] *= 171 % 30269;
  seeds[1] *= 172 % 30307;
  seeds[2] *= 170 % 30323;

  let value = [30269.0, 30307.0, 30323.0].reduce((p, v, i) => {
    p = p + seeds[i] / v;
    return p;
  }, 0);

  return fixup(frac(value)); /* in [0,1) */
}

function FixupSeeds(): void {
  const seeds = WICHMANN_HILL.seed;
  seeds[0] = seeds[0] % 30269;
  seeds[1] = seeds[1] % 30307;
  seeds[2] = seeds[2] % 30323;

  if (seeds[0] === 0) seeds[0] = 1;
  if (seeds[1] === 0) seeds[1] = 1;
  if (seeds[2] === 0) seeds[2] = 1;
  return;
}

export function init(seed: number) {
  const seeds = WICHMANN_HILL.seed;
  /* Initial scrambling */

  for (let j = 0; j < 50; j++) {
    seed = 69069 * seed + 1;
  }
  for (let j = 0; j < seeds.length; j++) {
    seed = 69069 * seed + 1;
    seeds[j] = seed;
  }
  FixupSeeds();
}

export function setSeed(seed: number[]) {
  let errors = 0;

  if (seed.length > WICHMANN_HILL.seed.length || seed.length === 0) {
    init(timeseed());
    return;
  }
  WICHMANN_HILL.seed.set(seed);
}

export function getSeed() {
  return Array.from(WICHMANN_HILL.seed);
}
