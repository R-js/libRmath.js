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




import { fixup } from '../fixup';
import { IRNG } from '../irng';
import { IRNGTypeEnum } from '../irng-type';
import { seed } from '../timeseed';
import { seedCheck } from '../seedcheck'

const QUALITY = 1009; /* recommended quality level for high-res use */
export const SEED_LEN = 101;
const LL = 37; /* the short lag */
const KK = 100; /* the long lag */
const TT = 70; /* guaranteed separation between streams */
const MM = 1073741824; /* the modulus */

function mod_diff(x: number, y: number) {
  const d = new Uint32Array(3); // yes we need to do 32 bit all the way
  d[0] = x;
  d[1] = y;

  d[2] = (d[0] - d[1]) & (MM - 1);
  return d[2];
}

function is_odd(x: number): boolean {
  return x % 2 === 1;
}


export class KnuthTAOCP2002 extends IRNG {
  //
  //
  private qualityBuffer: ArrayBuffer;
  private ran_arr_buf: Uint32Array;
  //
  //

  private m_seed: Uint32Array;
  private ran_x: Uint32Array;

  private get KT_pos() {
    return this.m_seed[100];
  }

  private set KT_pos(v: number) {
    this.m_seed[100] = v;
  }

  private ran_array(
    aa: Uint32Array,
    n: number /* put n new random numbers in aa */
  ) {
    let i: number;
    let j: number;
    for (j = 0; j < KK; j++) {
      aa[j] = this.ran_x[j];
    }
    for (; j < n; j++) {
      aa[j] = mod_diff(aa[j - KK], aa[j - LL]);
    }
    for (i = 0; i < LL; i++, j++) {
      this.ran_x[i] = mod_diff(aa[j - KK], aa[j - LL]);
    }
    for (; i < KK; i++, j++) {
      this.ran_x[i] = mod_diff(aa[j - KK], this.ran_x[i - LL]);
    }
  }

  private ran_arr_cycle() {
    this.ran_array(this.ran_arr_buf, QUALITY);
    this.ran_arr_buf[KK] = -1;
  }

  private ran_start(_seed: number) {
    //
    let t: number;
    let j: number;
    //
    const x = new Uint32Array(KK + KK - 1);
    //
    const ss = new Uint32Array(1);
    const se = new Uint32Array([_seed]);
    //
    ss[0] = (se[0] + 2) & (MM - 2);
    //
    for (j = 0; j < KK; j++) {
      x[j] = ss[0]; /* bootstrap the buffer */
      ss[0] = ss[0] << 1;
      if (ss[0] >= MM) {
        ss[0] = ss[0] - (MM - 2); /* cyclic shift 29 bits */
      }
    }
    //
    //
    //
    x[1]++; /* make x[1] (and only x[1]) odd */
    for (ss[0] = se[0] & (MM - 1), t = TT - 1; t; ) {
      for (j = KK - 1; j > 0; j--) {
        x[j + j] = x[j];
        x[j + j - 1] = 0; /* "square" */
      }
      for (j = KK + KK - 2; j >= KK; j--) {
        x[j - (KK - LL)] = mod_diff(x[j - (KK - LL)], x[j]);
        x[j - KK] = mod_diff(x[j - KK], x[j]);
      }
      if (is_odd(ss[0])) {
        /* "multiply by z" */
        for (j = KK; j > 0; j--) {
          x[j] = x[j - 1];
        }
        x[0] = x[KK]; /* shift the buffer cyclically */
        x[LL] = mod_diff(x[LL], x[KK]);
      }
      if (ss[0]) {
        ss[0] = ss[0] >>> 1;
      } else {
        t--;
      }
    }
    for (j = 0; j < LL; j++) {
      this.ran_x[j + KK - LL] = x[j];
    }
    for (; j < KK; j++) {
      this.ran_x[j - LL] = x[j];
    }
    for (j = 0; j < 10; j++) {
      this.ran_array(x, KK + KK - 1); /* warm things up */
    }
  }

  private RNG_Init_KT2(_seed: number) {
    this.ran_start(_seed % 1073741821);
    this.KT_pos = 100;
  }

  private KT_next() {
    if (this.KT_pos >= 100) {
      this.ran_arr_cycle();
      this.KT_pos = 0;
    }
    return this.ran_x[this.KT_pos++];
  }

  constructor(_seed = seed()) {
    super('Knuth-TAOCP-2002', IRNGTypeEnum.KNUTH_TAOCP2002);
    this.qualityBuffer = new ArrayBuffer(QUALITY * 4);
    this.ran_arr_buf = new Uint32Array(this.qualityBuffer);
    this.m_seed = new Uint32Array(SEED_LEN);
    this.ran_x = this.m_seed;
    this.init(_seed);
  }

  internal_unif_rand(): number {
    const KT = 9.31322574615479e-10;
    return fixup(this.KT_next() * KT);
  }

  public init(_seed: number = seed()) {
    /* Initial scrambling */
    const s = new Uint32Array([0]);
    s[0] = _seed;
    for (let j = 0; j < 50; j++) {
      s[0] = 69069 * s[0] + 1;
    }

    this.RNG_Init_KT2(s[0]);
  }
  
  public set seed(_seed: Uint32Array) {
    seedCheck(this._kind,_seed, SEED_LEN)
    this.m_seed.set(_seed);
  }

  public get seed(): Uint32Array{
    return this.m_seed;
  }
}
