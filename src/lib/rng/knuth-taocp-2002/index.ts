'use strict';

/* ===================  Knuth TAOCP  2002 ========================== */

/*    This program by D E Knuth is in the public domain and freely copyable.
 *    It is explained in Seminumerical Algorithms, 3rd edition, Section 3.6
 *    (or in the errata to the 2nd edition --- see
 *        http://www-cs-faculty.stanford.edu/~knuth/taocp.html
 *    in the changes to Volume 2 on pages 171 and following).              */

/*    N.B. The MODIFICATIONS introduced in the 9th printing (2002) are
      included here; there's no backwards compatibility with the original. */

import * as debug from 'debug';      


import { IRNGType } from '../irng-type';
import { timeseed } from '../timeseed';
import { IRNG } from '../irng';

import { fixup } from '../fixup';

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

const QUALITY = 1009; /* recommended quality level for high-res use */
const SEED_LEN = 101;
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
  private kind = IRNGType.KNUTH_TAOCP2002;
  private name = 'Knuth-TAOCP-2002';
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

  constructor(_seed: number = timeseed()) {
    super(_seed);
  }

  public _setup() {
    this.qualityBuffer = new ArrayBuffer(QUALITY * 4);
    this.ran_arr_buf = new Uint32Array(this.qualityBuffer);
    const buf = new ArrayBuffer(SEED_LEN * 4);
    this.m_seed = new Uint32Array(buf).fill(0);
    this.ran_x = this.m_seed;
  }

  public unif_rand(): number {
    const KT = 9.31322574615479e-10;
    return fixup(this.KT_next() * KT);
  }

  public init(_seed: number) {
    /* Initial scrambling */
    const s = new Uint32Array([0]);
    s[0] = _seed;
    for (let j = 0; j < 50; j++) {
      s[0] = 69069 * s[0] + 1;
    }

    this.RNG_Init_KT2(s[0]);
    super.init(_seed);
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
