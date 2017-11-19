'use strict';

/*
 *  Javascript conversion by Jacob Bogers Nov 2017
 *  jkfbogers@gmail.com
 * 


   The following code was taken from earlier versions of
   http://www-cs-faculty.stanford.edu/~knuth/programs/rng.c-old
   http://www-cs-faculty.stanford.edu/~knuth/programs/rng.c
*/

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { warning, error } from '../../_logging';
import { IRNGType } from '../IRNGType';
import { timeseed } from '../timeseed';
import { TAOCP1997init } from './taocp-1997-init';

const SEED_LEN = 101;
const buf = new ArrayBuffer(SEED_LEN * 4);

const KNUTH_TAOCP = {
  kind: IRNGType.KNUTH_TAOCP,
  name: 'Knuth-TAOCP',
  seed: new Int32Array(buf).fill(0),
  get KT_pos() {
    return this.seed[100];
  },
  set KT_pos(v: number) {
    this.seed[100] = v;
  }
};

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
const is_odd = (x: number) => x & 1; /* units bit of x */

function ran_array(
  aa: Uint32Array,
  n: number /* put n new random numbers in aa */
) {
  let i;
  let j;
  const ran_x = KNUTH_TAOCP.seed;
  for (j = 0; j < KK; j++) aa[j] = ran_x[j];
  for (; j < n; j++) aa[j] = mod_diff(aa[j - KK], aa[j - LL]);
  for (i = 0; i < LL; i++, j++) ran_x[i] = mod_diff(aa[j - KK], aa[j - LL]);
  for (; i < KK; i++, j++) ran_x[i] = mod_diff(aa[j - KK], ran_x[i - LL]);
}

function ran_arr_cycle(): number {
  ran_array(ran_arr_buf, QUALITY);
  ran_arr_buf[KK] = -1;
  return ran_arr_buf[0];
}

function KT_next() {
  const s = KNUTH_TAOCP.seed;
  if (KNUTH_TAOCP.KT_pos >= 100) {
    ran_arr_cycle();
    KNUTH_TAOCP.KT_pos = 0;
  }
  return s[KNUTH_TAOCP.KT_pos++];
}

function RNG_Init_R_KT(seed: number) {
  KNUTH_TAOCP.seed.set(TAOCP1997init(seed % 1073741821));
  KNUTH_TAOCP.KT_pos = 100;
  FixupSeeds();
}

function fixup(x: number) {
  const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */
  /* ensure 0 and 1 are never returned */
  if (x <= 0.0) return 0.5 * i2_32m1;
  if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
  return x;
}

export function unif_rand(): number {
  return fixup(KT_next() * KT);
}

function FixupSeeds(): void {
  if (KNUTH_TAOCP.KT_pos <= 0) KNUTH_TAOCP.KT_pos = 100;
  /* check for all zeroes */
  const s = KNUTH_TAOCP.seed;
  if (s.find(v => !!v) === undefined) init(timeseed());
  return;
}

export function init(seed: number) {

  /* Initial scrambling */
  const s = new Uint32Array([0]);
  s[0] = seed;
  for (let j = 0; j < 50; j++) {
    s[0] = (69069 * s[0] + 1);
  }
  RNG_Init_R_KT(s[0]);
}

export function setSeed(seed: number[]) {
  let errors = 0;

  if (seed.length > KNUTH_TAOCP.seed.length || seed.length === 0) {
    init(timeseed());
    return;
  }
  KNUTH_TAOCP.seed.set(seed);
}

export function getSeed() {
  return Array.from(KNUTH_TAOCP.seed);
}
