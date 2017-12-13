'use strict';

/* Port to Javascript from R by Jacob Bogers  2017*/
/* ===================  Mersenne Twister ========================== */
/* From http://www.math.keio.ac.jp/~matumoto/emt.html */

/* A C-program for MT19937: Real number version([0,1)-interval)
   (1999/10/28) genrand() generates one pseudorandom real number (double)
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

/* helpers */
/* helpers */
/* helpers */
const N = 624;
const M = 397;

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

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { IRNGType } from '../irng-type';
import { timeseed } from '../timeseed';
import { IRNG } from '../irng';
import { fixup } from '../fixup';

const SEED_LEN = 625;

export class MersenneTwister extends IRNG {
  private kind: IRNGType;
  private name: string;
  private m_seed: Int32Array;
  private mt: Int32Array;
  private mti: number;

  private MT_sgenrand(seed: number) {
    let i;

    for (let i = 0; i < N; i++) {
      this.mt[i] = seed & 0xffff0000;
      seed = 69069 * seed + 1;
      this.mt[i] |= (seed & 0xffff0000) >>> 16;
      seed = 69069 * seed + 1;
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
    s[0] = 624;
    /* No action unless user has corrupted .Random.seed */
    if (s[0] <= 0) s[0] = 624;
    /* check for all zeroes */
    // note mt is equal to s.slice(1)
    if (this.mt.find(v => !!v) === undefined) {
      this.init(timeseed());
    }
    return;
  }

  constructor(_seed: number = timeseed()) {
    super(_seed);
  }

  public _setup() {
    const buf = new ArrayBuffer(SEED_LEN * 4);
    this.kind = IRNGType.MERSENNE_TWISTER;
    this.name = 'Mersenne-Twister';
    this.m_seed = new Int32Array(buf).fill(0);
    this.mt = new Int32Array(buf, 4);
    this.mti = N + 1;
  }

  public init(_seed: number) {
    /* Initial scrambling */
    const s = new Uint32Array([0]);
    s[0] = _seed;
    for (let j = 0; j < 50; j++) {
      s[0] = 69069 * s[0] + 1;
    }
    for (let j = 0; j < this.m_seed.length; j++) {
      s[0] = 69069 * s[0] + 1;
      this.m_seed[j] = s[0];
    }
    this.fixupSeeds();
    super.init(_seed);
  }

  public unif_rand(): number {
    let rc = this.MT_genrand();
    return fixup(rc);
  }

  public set seed(_seed: number[]) {
    let errors = 0;

    if (_seed.length > this.m_seed.length || _seed.length === 0) {
      this.init(timeseed());
      return;
    }
    this.m_seed.set(_seed);
  }

  public get seed() {
    return Array.from(this.m_seed);
  }
}
