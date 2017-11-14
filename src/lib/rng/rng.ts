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

import { EnumValues } from 'enum-values';
import includes = require('lodash.includes');
import cloneDeep = require('lodash.clonedeep');

import { IN01Type } from './IN01Type';
import { IRNGType } from './IRNGType';
import { IRNGTab } from './IRNGTab';
import { frac, trunc } from '~common';

import { warning, error } from '~logging';
import { timeseed } from './timeseed';
import { TAOCP1997init } from './knuth_taocp';

const commonBuffer = new ArrayBuffer(625 * 4); //uint32
const ran_x = new Uint32Array(commonBuffer);
let BM_norm_keep: number = 0; //Box Muller

const RNGTable: IRNGTab[] = [
  {
    kind: IRNGType.WICHMANN_HILL,
    Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
    name: 'Wichmann-Hill',
    n_seed: 3,
    i_seed: new Uint32Array(commonBuffer, 0, 3 * 4).fill(0)
  },
  {
    kind: IRNGType.MARSAGLIA_MULTICARRY,
    Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
    name: 'Marsaglia-MultiCarry',
    n_seed: 2,
    i_seed: new Uint32Array(commonBuffer, 0, 2 * 4).fill(0)
  },
  {
    kind: IRNGType.SUPER_DUPER,
    Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
    name: 'Super-Duper',
    n_seed: 2,
    i_seed: new Uint32Array(commonBuffer, 0, 2 * 4).fill(0)
  },
  {
    kind: IRNGType.MERSENNE_TWISTER,
    Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
    name: 'Mersenne-Twister',
    n_seed: 1 + 624, // literal copy from R-source, I will keep it like this
    i_seed: new Uint32Array(commonBuffer, 0, 625 * 4).fill(0)
  },
  {
    kind: IRNGType.KNUTH_TAOCP,
    Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
    name: 'Knuth-TAOCP',
    n_seed: 1 + 100, // literal copy from R-source, I will keep it like this
    i_seed: new Uint32Array(commonBuffer, 0, 101 * 4).fill(0)
  },
  /* {
    kind: IRNGType.USER_UNIF,
    Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
    name: 'User-supplied',
    n_seed: 0,
    i_seed: new Uint32Array(commonBuffer, 0, 0 * 4).fill(0)
  },*/
  {
    kind: IRNGType.KNUTH_TAOCP2,
    Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
    name: 'Knuth-TAOCP-2002',
    n_seed: 1 + 100, // literal copy from R-source, I will keep it like this
    i_seed: new Uint32Array(commonBuffer, 0, 101 * 4).fill(0)
  },
  {
    kind: IRNGType.LECUYER_CMRG,
    Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
    name: "L'Ecuyer-CMRG",
    n_seed: 6,
    i_seed: new Uint32Array(commonBuffer, 0, 6 * 4).fill(0)
  }
];

const d2_32 = 4294967296; /* = (double) */
const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */
const KT = 9.31322574615479e-10; /* = 2^-30 */
const m1 = 4294967087;
const m2 = 4294944443;
const normc = 2.328306549295727688e-10;
const a12 = 1403580;
const a13n = 810728;
const a21 = 527612;
const a23n = 1370589;

const KK = 100; /* the long lag */
const LL = 37; /* the short lag */
const MM = 1 << 30; /* the modulus */
const TT = 70; /* guaranteed separation between streams */

//Mersenne Twister
//Mersenne Twister
//Mersenne Twister

/* From http://www.math.keio.ac.jp/~matumoto/emt.html */
/* Period parameters */

const N = 624;
const M = 397;
const MATRIX_A = 0x9908b0df; /* constant vector a */
const UPPER_MASK = 0x80000000; /* most significant w-r bits */
const LOWER_MASK = 0x7fffffff; /* least significant r bits */

/* Tempering parameters */
const TEMPERING_MASK_B = 0x9d2c5680;
const TEMPERING_MASK_C = 0xefc60000;
const TEMPERING_SHIFT_U = (y: number) => y >> 11;
const TEMPERING_SHIFT_S = (y: number) => y << 7;
const TEMPERING_SHIFT_T = (y: number) => y << 15;
const TEMPERING_SHIFT_L = (y: number) => y >> 18;

// Mersenne Twister  Ends
// Mersenne Twister  Ends
// Mersenne Twister  Ends
let RNG_kind: IRNGType = IRNGType.MERSENNE_TWISTER;
let N01_kind: IN01Type;

const KT_pos = (s?: number) => {
  if (s === undefined) {
    return RNGTable[IRNGType.KNUTH_TAOCP].i_seed[100];
  }
  return (RNGTable[IRNGType.KNUTH_TAOCP].i_seed[100] = 0);
};

const mod_diff = (x: number, y: number) => (x - y) & (MM - 1);
const is_odd = (x: number) => x & 1; /* units bit of x */

const QUALITY = 1009; /* recommended quality level for high-res use */
const ran_arr_sentinel = -1;

const qualityBuffer = new ArrayBuffer(QUALITY);
const ran_arr_buf = new Uint32Array(qualityBuffer); //uint32
let ran_arr_ptr: Uint32Array | undefined; /* the next random number, or -1 */

function ran_array(
  aa: Uint32Array,
  n: number /* put n new random numbers in aa */
) {
  let i;
  let j;
  for (j = 0; j < KK; j++) aa[j] = ran_x[j];
  for (; j < n; j++) aa[j] = mod_diff(aa[j - KK], aa[j - LL]);
  for (i = 0; i < LL; i++, j++) ran_x[i] = mod_diff(aa[j - KK], aa[j - LL]);
  for (; i < KK; i++, j++) ran_x[i] = mod_diff(aa[j - KK], ran_x[i - LL]);
}

function ran_arr_cycle(): number {
  ran_array(ran_arr_buf, QUALITY);
  ran_arr_buf[KK] = -1;
  ran_arr_ptr = new Uint32Array(qualityBuffer);

  return ran_arr_buf[0];
}

/* ===================  Knuth TAOCP  2002 ========================== */

/*    This program by D E Knuth is in the public domain and freely copyable.
 *    It is explained in Seminumerical Algorithms, 3rd edition, Section 3.6
 *    (or in the errata to the 2nd edition --- see
 *        http://www-cs-faculty.stanford.edu/~knuth/taocp.html
 *    in the changes to Volume 2 on pages 171 and following).              */

/*    N.B. The MODIFICATIONS introduced in the 9th printing (2002) are
      included here; there's no backwards compatibility with the original. */

function ran_start(seed: number) {
  let t;
  let j;
  let x = new Uint32Array(KK + KK - 1);
  /* the preparation buffer */
  let ss = (seed + 2) & (MM - 2);
  for (let j = 0; j < KK; j++) {
    x[j] = ss; /* bootstrap the buffer */
    ss <<= 1;
    if (ss >= MM) ss -= MM - 2; /* cyclic shift 29 bits */
  }
  x[1]++; /* make x[1] (and only x[1]) odd */
  for (ss = seed & (MM - 1), t = TT - 1; t; ) {
    for (j = KK - 1; j > 0; j--)
      (x[j + j] = x[j]), (x[j + j - 1] = 0); /* "square" */
    for (j = KK + KK - 2; j >= KK; j--) {
      x[j - (KK - LL)] = mod_diff(x[j - (KK - LL)], x[j]);
      x[j - KK] = mod_diff(x[j - KK], x[j]);
    }
    if (is_odd(ss)) {
      /* "multiply by z" */
      for (j = KK; j > 0; j--) x[j] = x[j - 1];
      x[0] = x[KK]; /* shift the buffer cyclically */
      x[LL] = mod_diff(x[LL], x[KK]);
    }
    if (ss) ss >>= 1;
    else t--;
  }
  for (j = 0; j < LL; j++) ran_x[j + KK - LL] = x[j];
  for (; j < KK; j++) ran_x[j - LL] = x[j];
  for (j = 0; j < 10; j++) ran_array(x, KK + KK - 1); /* warm things up */

  ran_arr_ptr = undefined;
}
/* ===================== end of Knuth's code ====================== */

function Randomize(kind: IRNGType) {
  /* Only called by  GetRNGstate() when there is no .Random.seed */
  RNG_Init(kind, timeseed());
}

function fixup(x: number) {
  /* ensure 0 and 1 are never returned */
  if (x <= 0.0) return 0.5 * i2_32m1;
  if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
  return x;
}

function RNG_Init_KT2(seed: number) {
  ran_start(seed % 1073741821);
  KT_pos(100);
}

function unif_rand(): number {
  const seeds = RNGTable[RNG_kind].i_seed;

  switch (RNG_kind) {
    default:
      throw error(`unif_rand: unimplemented RNG kind ${IRNGType[RNG_kind]}`);
    case IRNGType.WICHMANN_HILL:
      seeds[0] *= 171 % 30269;
      seeds[1] *= 172 % 30307;
      seeds[2] *= 170 % 30323;

      let value = [30269.0, 30307.0, 30323.0].reduce((p, v, i) => {
        p = p + seeds[i] / v;
        return p;
      }, 0);

      return fixup(frac(value)); /* in [0,1) */

    case IRNGType.MARSAGLIA_MULTICARRY /* 0177777(octal) == 65535(decimal)*/: {
      seeds[0] = 36969 * (seeds[0] & 65535) + (seeds[0] >> 16);
      seeds[1] = 18000 * (seeds[1] & 65535) + (seeds[1] >> 16);

      return fixup(
        ((seeds[0] << 16) ^ (seeds[1] & 65535)) * i2_32m1
      ); /* in [0,1) */
    }
    case IRNGType.SUPER_DUPER: {
      /* This is Reeds et al (1984) implementation;
             * modified using __unsigned__	seeds instead of signed ones
             */

      seeds[0] ^=
        (seeds[0] >> 15) & 0x1ffff; /* ) 0377777 = 0x1FFFF Tausworthe */
      seeds[0] ^= seeds[0] << 17;
      seeds[1] *= 69069; /* Congruential */
      return fixup(
        (seeds[0] ^ seeds[1]) * i2_32m1
      ); /* in [0,1) ,  ^ means XOR */
    }
    case IRNGType.MERSENNE_TWISTER:
      return fixup( MT_genrand() );
    case IRNGType.KNUTH_TAOCP:
    case IRNGType.KNUTH_TAOCP2:
       return fixup( KT_next() * KT );
    //case IRNGType.USER_UNIF:
    // TODO: return UserUnif();
    case IRNGType.LECUYER_CMRG: {
      /* Based loosely on the GPL-ed version of
                   http://www.iro.umontreal.ca/~lecuyer/myftp/streams00/c2010/RngStream.c
                   but using int_least64_t, which C99 guarantees.
                */
      let k: number;
      let p1: number;
      let p2: number;

      const seeds = RNGTable[RNG_kind].i_seed;

      p1 = a12 * trunc(seeds[1]) - a13n * trunc(seeds[1]);
      /* p1 % m1 would surely do */
      k = trunc(p1 / m1);
      p1 -= k * m1;
      if (p1 < 0.0) p1 += m1;
      seeds[0] = seeds[1];
      seeds[1] = seeds[2];
      seeds[2] = trunc(p1);

      p2 = a21 * trunc(seeds[5]) - a23n * trunc(seeds[2]);
      k = trunc(p2 / m2);
      p2 -= k * m2;
      if (p2 < 0.0) p2 += m2;
      seeds[2] = seeds[3];
      seeds[3] = seeds[4];
      seeds[4] = p2;

      return (p1 > p2 ? p1 - p2 : p1 - p2 + m1) * normc;
    }
  }
}

/* we must mask global variable here, as I1-I3 hide RNG_kind
   and we want the argument */
function FixupSeeds(kind: IRNGType, initial: number): void {
  /* Depending on RNG, set 0 values to non-0, etc. */

  let j: number;
  let notallzero = 0;
  const seeds = RNGTable[kind].i_seed;

  /* Set 0 to 1 :
          for(j = 0; j <= RNG_Table[RNG_kind].n_seed - 1; j++)
          if(!RNG_Table[RNG_kind].i_seed[j]) RNG_Table[RNG_kind].i_seed[j]++; */

  switch (RNG_kind) {
    case IRNGType.WICHMANN_HILL:
      seeds[0] = seeds[0] % 30269;
      seeds[1] = seeds[1] % 30307;
      seeds[2] = seeds[2] % 30323;

      /* map values equal to 0 mod modulus to 1. */
      if (seeds[0] === 0) seeds[0] = 1;
      if (seeds[1] === 0) seeds[1] = 1;
      if (seeds[2] === 0) seeds[2] = 1;
      return;

    case IRNGType.SUPER_DUPER:
      if (seeds[0] === 0) seeds[0] = 1;
      /* I2 = Congruential: must be ODD */
      seeds[1] |= 1;
      break;

    case IRNGType.MARSAGLIA_MULTICARRY:
      if (seeds[0] === 0) seeds[0] = 1;
      if (seeds[1] === 0) seeds[1] = 1;
      break;

    case IRNGType.MERSENNE_TWISTER:
      if (initial) seeds[0] = 624;
      /* No action unless user has corrupted .Random.seed */
      if (seeds[0] <= 0) seeds[0] = 624;
      /* check for all zeroes */
      if (seeds.slice(1).find(v => !!v)) Randomize(kind);
      break;
    case IRNGType.KNUTH_TAOCP:
    case IRNGType.KNUTH_TAOCP2:
      if (seeds[100] <= 0) seeds[100] = 100;
      /* check for all zeroes */
      if (seeds.find(v => !!v)) Randomize(kind);
      break;
    // case IRNGType.USER_UNIF:
    // break;
    case IRNGType.LECUYER_CMRG:
      /* first set: not all zero, in [0, m1)
          second set: not all zero, in [0, m2) */
      {
        let tmp: number;
        let allOK = 1;
        for (j = 0; j < 3; j++) {
          tmp = seeds[j];
          if (tmp !== 0) notallzero = 1;
          if (tmp >= m1) allOK = 0;
        }
        if (!notallzero || !allOK) Randomize(kind);
        for (j = 3; j < 6; j++) {
          tmp = seeds[j];
          if (tmp !== 0) notallzero = 1;
          if (tmp >= m2) allOK = 0;
        }
        if (!notallzero || !allOK) Randomize(kind);
      }
      break;
    default:
      throw error(`FixupSeeds: unimplemented RNG kind (ordinal): ${kind}`);
  }
}

function RNG_Init(kind: IRNGType, seed: number) {
  BM_norm_keep = 0.0; /* zap Box-Muller history */
  const seeds = RNGTable[kind].i_seed;

  /* Initial scrambling */
  for (let j = 0; j < 50; j++) {
    seed = 69069 * seed + 1;
  }
  switch (kind) {
    case IRNGType.WICHMANN_HILL:
    case IRNGType.MARSAGLIA_MULTICARRY:
    case IRNGType.SUPER_DUPER:
    case IRNGType.MERSENNE_TWISTER:
      /* i_seed[0] is mti, *but* this is needed for historical consistency */
      for (let j = 0; j < RNGTable[kind].n_seed; j++) {
        seed = 69069 * seed + 1;
        seeds[j] = seed;
      }
      FixupSeeds(kind, 1);
      break;
    case IRNGType.KNUTH_TAOCP:
      RNG_Init_R_KT(seed);
      break;
    case IRNGType.KNUTH_TAOCP2:
      RNG_Init_KT2(seed);
      break;
    case IRNGType.LECUYER_CMRG:
      for (let j = 0; j < RNGTable[kind].n_seed; j++) {
        seed = 69069 * seed + 1;
        while (seed >= m2) seed = 69069 * seed + 1;
        seeds[j] = seed;
      }
      break;
      // case IRNGType.USER_UNIF:
      //TODO:
      break;
    default:
      error(`RNG_Init: unimplemented RNG (ordinal):${kind}`);
  }
}

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
const mt = new Uint32Array(commonBuffer, 4);
let mti = N + 1;

function MT_sgenrand(seed: number) {
  let i;

  for (let i = 0; i < N; i++) {
    mt[i] = seed & 0xffff0000;
    seed = 69069 * seed + 1;
    mt[i] |= (seed & 0xffff0000) >> 16;
    seed = 69069 * seed + 1;
  }
  mti = N;
}

/* Initialization by "sgenrand()" is an example. Theoretically,
   there are 2^19937-1 possible states as an intial state.
   Essential bits in "seed_array[]" is following 19937 bits:
    (seed_array[0]&UPPER_MASK), seed_array[1], ..., seed_array[N-1].
   (seed_array[0]&LOWER_MASK) is discarded.
   Theoretically,
    (seed_array[0]&UPPER_MASK), seed_array[1], ..., seed_array[N-1]
   can take any values except all zeros. 
*/

function MT_genrand() {
  let y: number;
  let mag01: number[] = [0x0, MATRIX_A];
  /* mag01[x] = x * MATRIX_A  for x=0,1 */
  // ran_x points to the common buffer
  const dummy = ran_x;

  mti = dummy[0];

  if (mti >= N) {
    /* generate N words at one time */
    let kk;

    if (mti === N + 1)
      /* if sgenrand() has not been called, */
      MT_sgenrand(4357); /* a default initial seed is used   */

    for (kk = 0; kk < N - M; kk++) {
      y = (mt[kk] & UPPER_MASK) | (mt[kk + 1] & LOWER_MASK);
      mt[kk] = mt[kk + M] ^ (y >> 1) ^ mag01[y & 0x1];
    }
    for (; kk < N - 1; kk++) {
      y = (mt[kk] & UPPER_MASK) | (mt[kk + 1] & LOWER_MASK);
      mt[kk] = mt[kk + (M - N)] ^ (y >> 1) ^ mag01[y & 0x1];
    }
    y = (mt[N - 1] & UPPER_MASK) | (mt[0] & LOWER_MASK);
    mt[N - 1] = mt[M - 1] ^ (y >> 1) ^ mag01[y & 0x1];

    mti = 0;
  }

  y = mt[mti++];
  y ^= TEMPERING_SHIFT_U(y);
  y ^= TEMPERING_SHIFT_S(y) & TEMPERING_MASK_B;
  y ^= TEMPERING_SHIFT_T(y) & TEMPERING_MASK_C;
  y ^= TEMPERING_SHIFT_L(y);
  dummy[0] = mti;

  return y * 2.3283064365386963e-10; /* reals: [0,1)-interval */
}


function KT_next() {
  if (KT_pos() >= 100) {
    ran_arr_cycle();
    KT_pos(0);
  }
  KT_pos(KT_pos() + 1);
  return ran_x[KT_pos()];
}

export function RNG_Init_R_KT(seed: number): number[] {
  return TAOCP1997init(seed % 1073741821).slice(0, 100);
  KT_pos(100);
}


function findPartial(target: string) {
  return (str: string) => str.toLocaleUpperCase().startsWith(target);
}

interface IPutRNGStateArgs {
  pUnifKind?: IRNGType;
  seed?: number[];
}

function PutRNGstate({ pUnifKind, seed }: IPutRNGStateArgs) {
  let errors = 0;

  seed = seed || [];

  let select = RNGTable.find((rec: IRNGTab) => rec.kind === pUnifKind);

  if (select && (seed.length > select.n_seed || seed.length === 0)) {
    seed.length &&
      warning(`${select.kind}:Incorrect seedlength, re - initialize`);
    Randomize(select.kind);
    return;
  }

  if (select) {
    select.i_seed.set(seed);
    return;
  }

  error(`Internal Error, cannot find record; for RNG[${pUnifKind}`);
}

function RNGkind(newUniformKind?: string) {
  let uniform = EnumValues.getNames(IRNGType);

  if (newUniformKind) {
    const unifKind = newUniformKind.toLocaleUpperCase();
    const found = uniform.find(findPartial(unifKind));

    if (!found) {
      return error(`Uniform random Generator is Unknown:[${unifKind}`);
    }

    let su: IRNGType = IRNGType[found as any] as any;

    PutRNGstate({ pUnifKind: su }); // set seeds, but give user to adjust after
    RNG_kind = su; //set new global value
  }

  return (seed?: number[]) => {
    if (seed) {
      PutRNGstate({ pUnifKind: RNG_kind, seed });
    }
    return cloneDeep(RNGTable[RNG_kind]);
  };
}

function N01kind(newNormKind?: string) {
  let norm = EnumValues.getNames(IN01Type);

  if (newNormKind) {
    const normKind = newNormKind.toLocaleUpperCase();
    const found = norm.find(findPartial(normKind));

    if (!found) {
      return error(`Normal random Generator, Unknown:[${normKind}`);
    }

    let sn: IN01Type = IN01Type[found as any] as any;

    N01_kind = sn; //set new global value
    RNGTable[RNG_kind].Nkind = sn;
    if (sn === IN01Type.BOX_MULLER){
        BM_norm_keep = 0;
    }
    PutRNGstate({ pUnifKind: RNG_kind }); // set seeds, but give user to adjust after
  }
  return (seed?: number[]) => {
    if (seed) {
      PutRNGstate({ pUnifKind: RNG_kind, seed });
    }
    return cloneDeep(RNGTable[RNG_kind]);
  };
}
