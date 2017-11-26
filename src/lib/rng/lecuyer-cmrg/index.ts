'use strict';

const { trunc } = Math;
const frac = (x: number) => x - trunc(x);

import { warning, error } from '../../_logging';
import { IRNGType } from '../IRNGType';
import { timeseed } from '../timeseed';

const SEED_LEN = 6;

const LECUYER_CMRG = {
  kind: IRNGType.LECUYER_CMRG,
  name: 'L\'Ecuyer-CMRG',
  seed: new Int32Array(SEED_LEN).fill(0),
};

const a12 = 1403580; //least 64 bits
const II =  LECUYER_CMRG.seed;
const a13n = 810728;
const m2 = 4294944443;
const m1 = 4294967087;
const normc = 2.328306549295727688e-10;
const a21 = 527612;
const a23n = 1370589;

function randomize() {
  init(timeseed());
}

function fixup(x: number) {
  /* ensure 0 and 1 are never returned */
  const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */
  if (x <= 0.0) return 0.5 * i2_32m1;
  if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1;
  return x;
}
/*
#define II(i) (RNG_Table[RNG_kind].i_seed[i])
#define m1    4294967087
*/

/*
#define normc  2.328306549295727688e-10
#define a12     (int_least64_t)1403580
#define a13n    (int_least64_t)810728;
#define a21     (int_least64_t)527612
#define a23n    (int_least64_t)1370589
*/

export function unif_rand(): number {



  const { trunc } = Math;

  let k;
  let p1; // least 64 bits
  let p2; // least 64 bits
  
  p1 = a12 * II[1] - a13n * II[0];
  /* p1 % m1 would surely do */
  k =  trunc (p1 / m1);
  p1 -= k * m1;
  if (p1 < 0.0) p1 += m1;

  II[0] = II[1]; 
  II[1] = II[2];
  II[2] = p1;

  p2 = a21 * II[5] - a23n * II[3];
  k = trunc(p2 / m2);
  p2 -= k * m2;
  if (p2 < 0.0) p2 += m2;
  II[3] = II[4]; 
  II[4] = II[5];
  II[5] = trunc (p2);

  return ( (p1 > p2) ? (p1 - p2) : (p1 - p2 + m1)) * normc;
}

function FixupSeeds(): void {
  let tmp: number;
  const seed = LECUYER_CMRG.seed;
  let  allOK: boolean = true;
  
  
  const nonZeroOrLargerM2found = seed.find( f => f !== 0 || f >= m2 );
  if (nonZeroOrLargerM2found){
     randomize(); 
  }
}

export function init(se: number) {
  /* Initial scrambling */
  const s = new Int32Array([0]);

  s[0] = se;
  for (let j = 0; j < 50; j++) {
    s[0] = 69069 * s[0] + 1;
  }
  console.log('after scrambling', s);
  const seed = LECUYER_CMRG.seed;

  for (let j = 0; j < LECUYER_CMRG.seed.length; j++) {
    s[0] = (69069 * s[0] + 1);
    while (s[0] >= m2) {
      console.log('looping,', s);
      s[0] = (69069 * s[0] + 1);
    }
    console.log('setting,', s);
    seed[j] = s[0];
  }
}


export function setSeed(seed: number[]) {
  let errors = 0;

  if (seed.length > LECUYER_CMRG.seed.length || seed.length === 0) {
    randomize();
    return;
  }
  LECUYER_CMRG.seed.set(seed);
}

export function getSeed() {
  return Array.from(LECUYER_CMRG.seed);
}
