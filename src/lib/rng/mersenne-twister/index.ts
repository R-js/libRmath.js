'use strict'
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const N = 624;
const M = 397;

const MATRIX_A = 0x9908b0df; /* constant vector a */
const UPPER_MASK = 0x80000000; /* most significant w-r bits */
const LOWER_MASK = 0x7fffffff; /* least significant r bits */

/* Tempering parameters */
const TEMPERING_MASK_B = 0x9d2c5680;
const TEMPERING_MASK_C = 0xefc60000;
//const TEMPERING_SHIFT_U = (y: number) => y >>> 11;
//const TEMPERING_SHIFT_S = (y: number) => y << 7;
//const TEMPERING_SHIFT_T = (y: number) => y << 15;
//const TEMPERING_SHIFT_L = (y: number) => y >>> 18;



import { fixup } from '../fixup';
import { IRNG } from '../irng';
import { IRNGType } from '../irng-type';
import { timeseed } from '../timeseed';
import { seedCheck } from '../seedcheck'

export const SEED_LEN = 625;

export class MersenneTwister extends IRNG {

  private m_seed: Int32Array;
  private mt: Int32Array;
  private mti: number;

  
  private MT_sgenrand(seed: number) {

    for (let i = 0; i < N; i++) {
      this.mt[i] = seed & 0xffff0000;
      seed = (69069 * seed + 1) << 0;
      this.mt[i] |= (seed & 0xffff0000) >>> 16;
      seed = (69069 * seed + 1) << 0;
    }
    this.mti = N;
  }

  private MT_genrand() {
    let y = new Int32Array(1);
    let mag01 = new Int32Array([0x0, MATRIX_A]);
    /* mag01[x] = x * MATRIX_A  for x=0,1 */
    // ran_x points to the common buffer
    const dummy = this.m_seed;

    this.mti = dummy[0];

    if (this.mti >= N) {
      /* generate N words at one time */
      let kk;

      if (this.mti === N + 1)
        /* if sgenrand() has not been called, */
        this.MT_sgenrand(4357); /* a default initial seed is used   */

      for (kk = 0; kk < N - M; kk++) {
        y[0] = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
        this.mt[kk] = this.mt[kk + M] ^ (y[0] >>> 1) ^ mag01[y[0] & 0x1];
      }
      for (; kk < N - 1; kk++) {
        y[0] = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
        this.mt[kk] = this.mt[kk + (M - N)] ^ (y[0] >>> 1) ^ mag01[y[0] & 0x1];
      }
      y[0] = (this.mt[N - 1] & UPPER_MASK) | (this.mt[0] & LOWER_MASK);
      this.mt[N - 1] = this.mt[M - 1] ^ (y[0] >>> 1) ^ mag01[y[0] & 0x1];

      this.mti = 0;
    }

    y[0] = this.mt[this.mti++];
    y[0] ^= y[0] >>> 11;
    y[0] ^= (y[0] << 7) & TEMPERING_MASK_B;
    y[0] ^= (y[0] << 15) & TEMPERING_MASK_C;
    y[0] ^= y[0] >>> 18;
    dummy[0] = this.mti;

    return (
      new Uint32Array(y.buffer)[0] * 2.3283064365386963e-10
    ); /* reals: [0,1)-interval */
  }

  private fixupSeeds(): void {
    const s = this.m_seed;
    /* No action unless user has corrupted .Random.seed */
    if (s[0] <= 0) s[0] = 624;
    /* check for all zeroes */
    // note mt is equal to s.slice(1)
    // all are zeros?
    if (this.mt.find(v => !!v) === undefined) {
      this.init(timeseed());
    }
    return;
  }

  constructor(seed: number = timeseed()) {
    super(seed);
  }

  public _setup() {
    const buf = new ArrayBuffer(SEED_LEN * 4);
    this._kind = IRNGType.MERSENNE_TWISTER;
    this._name = 'Mersenne-Twister';
    this.m_seed = new Int32Array(buf).fill(0);
    this.mt = new Int32Array(buf, 4);
    this.mti = N + 1;
  }

  public init(seed: number =  timeseed()) {
    /* Initial scrambling */
    const s = new Uint32Array([0]);
    s[0] = seed;
    for (let j = 0; j < 50; j++) {
      s[0] = 69069 * s[0] + 1;
    }
    for (let j = 0; j < this.m_seed.length; j++) {
      s[0] = 69069 * s[0] + 1;
      this.m_seed[j] = s[0];
    }
    this.m_seed[0] = 624;
    this.fixupSeeds();
    super.init(seed);
  }

  public internal_unif_rand(): number {
     
    let rc = this.MT_genrand();
    return fixup(rc);
    
  }

  public set seed(_seed: number[]) {
    seedCheck(this._kind,_seed, SEED_LEN)
    this.m_seed.set(_seed);
    this.fixupSeeds()
  }

  public get seed() {
    return Array.from(this.m_seed);
  }
}
