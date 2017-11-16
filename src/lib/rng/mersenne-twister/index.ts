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

 /* ===================  Mersenne Twister ========================== */
/* From http://www.math.keio.ac.jp/~matumoto/emt.html */

/* A C-program for MT19937: Real number version([0,1)-interval)
   (1999/10/28)
     genrand() generates one pseudorandom real number (double)
   which is uniformly distributed on [0,1)-interval, for each
   call. sgenrand(seed) sets initial values to the working area
   of 624 words. Before genrand(), sgenrand(seed) must be
   called once. (seed is any 32-bit integer.)
   Integer generator is obtained by modifying two lines.
     Coded by Takuji Nishimura, considering the suggestions by
   Topher Cooper and Marc Rieffel in July-Aug. 1997.

   Copyright (C) 1997, 1999 Makoto Matsumoto and Takuji Nishimura.
   When you use this, send an email to: matumoto@math.keio.ac.jp
   with an appropriate reference to your work.

   REFERENCE
   M. Matsumoto and T. Nishimura,
   "Mersenne Twister: A 623-Dimensionally Equidistributed Uniform
   Pseudo-Random Number Generator",
   ACM Transactions on Modeling and Computer Simulation,
   Vol. 8, No. 1, January 1998, pp 3--30.
*/

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { warning, error } from '../../_logging';
import { IRNGType } from '../IRNGType';
import { timeseed } from '../timeseed';

const SEED_LEN = 625;
const buf = new ArrayBuffer(SEED_LEN * 4);

const MERSENNE_TWISTER = {
  kind: IRNGType.MERSENNE_TWISTER,
  name: 'Mersenne-Twister',
  seed: new Int32Array(buf).fill(0)
};

/* helpers */
/* helpers */
/* helpers */
const N = 624;
const M = 397;
const mt = new Int32Array(buf, 4);
let mti = N + 1;
const MATRIX_A = 0x9908b0df; /* constant vector a */
const UPPER_MASK = 0x80000000; /* most significant w-r bits */
const LOWER_MASK = 0x7fffffff; /* least significant r bits */

/* Tempering parameters */
const TEMPERING_MASK_B = 0x9d2c5680;
const TEMPERING_MASK_C = 0xefc60000;
const TEMPERING_SHIFT_U = (y: number) => y >>> 11;
const TEMPERING_SHIFT_S = (y: number) => y << 7;
const TEMPERING_SHIFT_T = (y: number) => y << 15;
const TEMPERING_SHIFT_L = (y: number) => y >>> 18;


function fixup(x: number) {
  const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */
  /* ensure 0 and 1 are never returned */
  if (x <= 0.0) return 0.5 * i2_32m1;
  if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
  return x;
}

function MT_sgenrand(seed: number) {
    let i;
  
    for (let i = 0; i < N; i++) {
      mt[i] = seed & 0xffff0000;
      seed = 69069 * seed + 1;
      mt[i] |= (seed & 0xffff0000) >>> 16;
      seed = 69069 * seed + 1;
    }
    mti = N;
  }

function MT_genrand() {
    let y = new Int32Array(1);
    let mag01 = new Int32Array([0x0, MATRIX_A]);
    /* mag01[x] = x * MATRIX_A  for x=0,1 */
    // ran_x points to the common buffer
    const dummy = MERSENNE_TWISTER.seed;
  
    mti = dummy[0];
  
    if (mti >= N) {
      /* generate N words at one time */
      let kk;
  
      if (mti === N + 1)
        /* if sgenrand() has not been called, */
        MT_sgenrand(4357); /* a default initial seed is used   */
  
      for (kk = 0; kk < N - M; kk++) {
        y[0] = (mt[kk] & UPPER_MASK) | (mt[kk + 1] & LOWER_MASK);
        mt[kk] = mt[kk + M] ^ (y[0] >>> 1) ^ mag01[y[0] & 0x1];
      }
      for (; kk < N - 1; kk++) {
        y[0] = (mt[kk] & UPPER_MASK) | (mt[kk + 1] & LOWER_MASK);
        mt[kk] = mt[kk + (M - N)] ^ (y[0] >>> 1) ^ mag01[y[0] & 0x1];
      }
      y[0] = (mt[N - 1] & UPPER_MASK) | (mt[0] & LOWER_MASK);
      mt[N - 1] = mt[M - 1] ^ (y[0] >>> 1) ^ mag01[y[0] & 0x1];
  
      mti = 0;
    }
  
    y[0] = mt[mti++];
    y[0] ^=  y[0] >>> 11;
    y[0] ^=  y[0] << 7 & TEMPERING_MASK_B;
    y[0] ^=  y[0] << 15 & TEMPERING_MASK_C;
    y[0] ^=  y[0] >>> 18;
    dummy[0] = mti;
  
    return new Uint32Array(y.buffer)[0] * 2.3283064365386963e-10; /* reals: [0,1)-interval */
  }

export function unif_rand(): number {
  return fixup( MT_genrand() );
}

function FixupSeeds(): void {
  const s = MERSENNE_TWISTER.seed;
  s[0] = 624;
  /* No action unless user has corrupted .Random.seed */
  if (s[0] <= 0) s[0] = 624;
  /* check for all zeroes */
  // note mt is equal to s.slice(1)
  if (mt.find(v => !v) !== undefined) {
      init(timeseed());
  }
  return;
}

export function init(seed: number) {
  const seeds = MERSENNE_TWISTER.seed;
  /* Initial scrambling */
  const s = new Uint32Array([0]);
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

  if (seed.length > MERSENNE_TWISTER.seed.length || seed.length === 0) {
    init(timeseed());
    return;
  }
  MERSENNE_TWISTER.seed.set(seed);
}

export function getSeed() {
  return Array.from(MERSENNE_TWISTER.seed);
}


//kickOff
FixupSeeds();
