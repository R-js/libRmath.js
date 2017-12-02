'use strict';

/*
 *  Javascript conversion by Jacob Bogers Nov 2017
 *  jkfbogers@gmail.com
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

const SUPER_DUPER = {
  kind: IRNGType.SUPER_DUPER,
  name: 'Super-Duper',
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
  const s = SUPER_DUPER.seed;
  /* This is Reeds et al (1984) implementation;
             * modified using __unsigned__	seeds instead of signed ones
             */

  s[0] ^= (s[0] >>> 15) & 0x1ffff; /* ) 0377777 = 0x1FFFF Tausworthe */
  s[0] ^= s[0] << 17;
  s[1] *= 69069; /* Congruential */
  const un = new Uint32Array(SEED_LEN);
  un[0] = s[0];
  un[1] = s[1];
  un[0] = un[0] ^ un[1];
  return fixup(
    un[0] * i2_32m1
  ); /* in [0,1) */
}

function FixupSeeds(): void {
  const s = SUPER_DUPER.seed;
  if (s[0] === 0) s[0] = 1;
  /* I2 = Congruential: must be ODD */
  s[1] |= 1;
  return;
}

export function init(seed: number) {
  const seeds = SUPER_DUPER.seed;
  /* Initial scrambling */
  const s = new Uint32Array([0]);
  s[0] = seed;
  for (let j = 0; j < 50; j++) {
    s[0] = 69069 * s[0] + 1;
  }
  for (let j = 0; j < seeds.length; j++) {
    s[0] = 69069 * s[0] + 1;
    seeds[j] = s[0];
  }
  FixupSeeds();
}

export function setSeed(seed: number[]) {
  let errors = 0;

  if (seed.length > SUPER_DUPER.seed.length || seed.length === 0) {
    init(timeseed());
    return;
  }
  SUPER_DUPER.seed.set(seed);
}

export function getSeed() {
  return Array.from(SUPER_DUPER.seed);
}
