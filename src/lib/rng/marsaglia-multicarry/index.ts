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

const SEED_LEN = 2;
const buf = new ArrayBuffer(SEED_LEN * 4);

const MARSAGLIA_MULTICARRY = {
  kind: IRNGType.MARSAGLIA_MULTICARRY,
  name: 'Marsaglia-MultiCarry',
  seed: new Int32Array(buf).fill(0)
};
const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */

function fixup(x: number) {
  /* ensure 0 and 1 are never returned */
  if (x <= 0.0) return 0.5 * i2_32m1;
  if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
  return x;
}

export function unif_rand(): number {
  const s = MARSAGLIA_MULTICARRY.seed;
  s[0] = 36969 * (s[0] & 65535) + (s[0] >>> 16);
  s[1] = 18000 * (s[1] & 65535) + (s[1] >>> 16);

  const un = new Uint32Array(SEED_LEN);
  un[0] = s[0] << 16;
  un[1] = s[1] & 0xFFFF;
  un[0] = un[0] ^ un[1];
  return fixup(
    un[0] * i2_32m1
  ); /* in [0,1) */
}


function FixupSeeds(): void {
  const s = MARSAGLIA_MULTICARRY.seed;
  if (s[0] === 0) s[0] = 1;
  if (s[1] === 0) s[1] = 1;
  return;
}

export function init(seed: number) {
  const seeds = MARSAGLIA_MULTICARRY.seed;
  /* Initial scrambling */
  const s = new Int32Array([0]);
  s[0] = seed;
  for (let j = 0; j < 50; j++) {
    s[0] = (69069 * s[0] + 1);
  }
  for (let j = 0; j < seeds.length; j++) {
    s[0] = (69069 * s[0] + 1);
    seeds[j] = s[0];
  }
  FixupSeeds();
}

export function setSeed(seed: number[]) {
  let errors = 0;

  if (seed.length > MARSAGLIA_MULTICARRY.seed.length || seed.length === 0) {
    init(timeseed());
    return;
  }
  MARSAGLIA_MULTICARRY.seed.set(seed);
}

export function getSeed() {
  return Array.from(MARSAGLIA_MULTICARRY.seed);
}
