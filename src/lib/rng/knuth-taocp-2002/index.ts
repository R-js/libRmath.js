'use strict';

/* ===================  Knuth TAOCP  2002 ========================== */

/*    This program by D E Knuth is in the public domain and freely copyable.
 *    It is explained in Seminumerical Algorithms, 3rd edition, Section 3.6
 *    (or in the errata to the 2nd edition --- see
 *        http://www-cs-faculty.stanford.edu/~knuth/taocp.html
 *    in the changes to Volume 2 on pages 171 and following).              */

/*    N.B. The MODIFICATIONS introduced in the 9th printing (2002) are
      included here; there's no backwards compatibility with the original. */

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { warning, error } from '../../_logging';
import { IRNGType } from '../IRNGType';
import { timeseed } from '../timeseed';

const SEED_LEN = 101;
const buf = new ArrayBuffer(SEED_LEN * 4);
const LL = 37; /* the short lag */
const KK = 100; /* the long lag */
const TT = 70; /* guaranteed separation between streams */

const KNUTH_TAOCP2002 = {
  kind: IRNGType.KNUTH_TAOCP2002,
  name: 'Knuth-TAOCP-2002',
  seed: new Uint32Array(buf).fill(0),
  get KT_pos() {
    return this.seed[100];
  },
  set KT_pos(v: number) {
    this.seed[100] = v;
  }
};

const MM = 1073741824; /* the modulus */
const ran_x = new Uint32Array(buf);

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

const QUALITY = 1009; /* recommended quality level for high-res use */
const qualityBuffer = new ArrayBuffer(QUALITY * 4);
const ran_arr_buf = new Uint32Array(qualityBuffer); //uint32

function ran_array(
  aa: Uint32Array,
  n: number /* put n new random numbers in aa */
) {
  let i: number;
  let j: number;
  for (j = 0; j < KK; j++) {
    aa[j] = ran_x[j];
  }
  for (; j < n; j++) {
    aa[j] = mod_diff(aa[j - KK], aa[j - LL]);
  }
  for (i = 0; i < LL; i++, j++) {
    ran_x[i] = mod_diff(aa[j - KK], aa[j - LL]);
  }
  for (; i < KK; i++, j++) {
    ran_x[i] = mod_diff(aa[j - KK], ran_x[i - LL]);
  }
}

function ran_arr_cycle() {
  ran_array(ran_arr_buf, QUALITY);
  ran_arr_buf[KK] = -1;
 
}

function ran_start(_seed: number) {
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
  console.log({ _seed, ss, se });
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
 // console.log(x);
  //return;
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
    ran_x[j + KK - LL] = x[j];
  }
  for (; j < KK; j++) {
    ran_x[j - LL] = x[j];
  }
  for (j = 0; j < 10; j++) {
    ran_array(x, KK + KK - 1); /* warm things up */
  }
}

function Randomize() {
  init(timeseed());
}

function fixup(x: number) {
  /* ensure 0 and 1 are never returned */
  const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */
  if (x <= 0.0) return 0.5 * i2_32m1;
  if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
  return x;
}

function RNG_Init_KT2(seed: number) {
  ran_start(seed % 1073741821);
  KNUTH_TAOCP2002.KT_pos = 100;
}

export function unif_rand(): number {
  const KT = 9.31322574615479e-10;
  return fixup(KT_next() * KT);
}

function FixupSeeds(): void {
  if (KNUTH_TAOCP2002.KT_pos <= 0) KNUTH_TAOCP2002.KT_pos = 100;
  /* check for all zeroes */
  const s = KNUTH_TAOCP2002.seed.slice(0, 100);
  if (s.find(v => !!v) === undefined) init(timeseed());
}

export function init(seed: number) {
  /* Initial scrambling */
  const s = new Uint32Array([0]);
  s[0] = seed;
  for (let j = 0; j < 50; j++) {
    s[0] = 69069 * s[0] + 1;
  }
  RNG_Init_KT2(s[0]);
}

function KT_next() {
  if (KNUTH_TAOCP2002.KT_pos >= 100) {
    ran_arr_cycle();
    KNUTH_TAOCP2002.KT_pos = 0;
  }
  return ran_x[KNUTH_TAOCP2002.KT_pos++];
}

export function setSeed(seed: number[]) {
  let errors = 0;

  if (seed.length > KNUTH_TAOCP2002.seed.length || seed.length === 0) {
    init(timeseed());
    return;
  }
  KNUTH_TAOCP2002.seed.set(seed);
}

export function getSeed() {
  return Array.from(KNUTH_TAOCP2002.seed);
}
