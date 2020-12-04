'use strict';
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
import { TAOCP1997init } from './taocp-1997-init';
import { seedCheck } from '../seedcheck'
/* helpers */
/* helpers */
/* helpers */
const MM = 1 << 30; /* the modulus */
const KK = 100; /* the long lag */
const LL = 37; /* the short lag */
const QUALITY = 1009; /* recommended quality level for high-res use */
const qualityBuffer = new ArrayBuffer(QUALITY * 4);
const ran_arr_buf = new Uint32Array(qualityBuffer); //uint32
const KT = 9.31322574615479e-10; /* = 2^-30 */
const mod_diff = (x: number, y: number) => (x - y) & (MM - 1);
//const is_odd = (x: number) => x & 1; /* units bit of x */

const SEED_LEN = 101;

export class KnuthTAOCP extends IRNG {
  //private buf: ArrayBuffer;

  private m_seed: Uint32Array;

  private get KT_pos() {
    return this.m_seed[100];
  }

  private set KT_pos(v: number) {
    this.m_seed[100] = v;
  }

  private fixupSeeds(): void {
    if (this.KT_pos <= 0) this.KT_pos = 100;
    /* check for all zeroes */
    const s = this.m_seed.slice(0, 100);
    if (s.find(v => !!v) === undefined) this.init(seed());
    return;
  }

  private KT_next() {
    const s = this.m_seed;
    if (this.KT_pos >= 100) {
      this.ran_arr_cycle();
      this.KT_pos = 0;
    }
    return s[this.KT_pos++];
  }

  private RNG_Init_R_KT(_seed: number) {
    this.m_seed.set(TAOCP1997init(_seed % 1073741821));
    this.KT_pos = 100;
    this.fixupSeeds();
  }

  private ran_arr_cycle(): number {
    this.ran_array(ran_arr_buf, QUALITY);
    ran_arr_buf[KK] = -1;
    return ran_arr_buf[0];
  }

  private ran_array(aa: Uint32Array, n: number) {
    let i;
    let j;
    const ran_x = this.m_seed;
    for (j = 0; j < KK; j++) aa[j] = ran_x[j];
    for (; j < n; j++) aa[j] = mod_diff(aa[j - KK], aa[j - LL]);
    for (i = 0; i < LL; i++, j++) ran_x[i] = mod_diff(aa[j - KK], aa[j - LL]);
    for (; i < KK; i++, j++) ran_x[i] = mod_diff(aa[j - KK], ran_x[i - LL]);
  }

  public constructor(_seed = seed()) {
    super('Knuth-TAOCP', IRNGTypeEnum.KNUTH_TAOCP);
    this.m_seed = new Uint32Array(SEED_LEN);
    this.init(_seed);
  }

  public init(_seed: number  =  seed()) {
    /* Initial scrambling */
    const s = new Uint32Array([0]);
    s[0] = _seed;
    for (let j = 0; j < 50; j++) {
      s[0] = 69069 * s[0] + 1;
    }
    this.RNG_Init_R_KT(s[0]);
  }

  public set seed(_seed: Uint32Array) {

    seedCheck(this._kind,_seed, SEED_LEN)
    this.m_seed.set(_seed);
  }

  internal_unif_rand(): number {
     return fixup(this.KT_next() * KT);
  }

  public get seed() {
    return this.m_seed;
  }
}
