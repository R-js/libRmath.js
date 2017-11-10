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


import { IN01Type } from './IN01Type';
import { IRNGType } from './IRNGType';
import { IRNGTab } from './IRNGTab';
import { frac, trunc } from '~common';

const RNGTable: IRNGTab[] = [

    {
        kind: IRNGType.WICHMANN_HILL,
        Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
        name: 'Wichmann-Hill',
        n_seed: 3,
        i_seed: []
    },
    {
        kind: IRNGType.MARSAGLIA_MULTICARRY,
        Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
        name: 'Marsaglia-MultiCarry',
        n_seed: 2,
        i_seed: []
    },
    {
        kind: IRNGType.SUPER_DUPER,
        Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
        name: 'Super-Duper',
        n_seed: 2,
        i_seed: []
    },
    {
        kind: IRNGType.MERSENNE_TWISTER,
        Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
        name: 'Mersenne-Twister',
        n_seed: 1 + 624, // literal copy from R-source, I will keep it like this
        i_seed: []
    },
    {
        kind: IRNGType.KNUTH_TAOCP,
        Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
        name: "Knuth-TAOCP",
        n_seed: 1 + 100, // literal copy from R-source, I will keep it like this
        i_seed: []
    },
    {
        kind: IRNGType.USER_UNIF,
        Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
        name: "User-supplied",
        n_seed: 0,
        i_seed: []
    },
    {
        kind: IRNGType.KNUTH_TAOCP2,
        Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
        name: "Knuth-TAOCP-2002",
        n_seed: 1 + 100, // literal copy from R-source, I will keep it like this
        i_seed: []
    },
    {
        kind: IRNGType.LECUYER_CMRG,
        Nkind: IN01Type.BUGGY_KINDERMAN_RAMAGE,
        name: "L'Ecuyer-CMRG",
        n_seed: 6,
        i_seed: []
    },
];

const d2_32 = 4294967296.; /* = (double) */
const i2_32m1 = 2.328306437080797e-10; /* = 1/(2^32 - 1) */
const KT = 9.31322574615479e-10; /* = 2^-30 */
const m1 = 4294967087;
const m2 =   4294944443;
const normc = 2.328306549295727688e-10;
const a12 = 1403580;
const a13n = 810728;
const a21 = 527612;
const a23n = 1370589;

const RNG_kind: IRNGType = IRNGType.MERSENNE_TWISTER;

function fixup(x: number) {
    /* ensure 0 and 1 are never returned */
    if (x <= 0.0) return 0.5 * i2_32m1;
    if ((1.0 - x) <= 0.0) return 1.0 - 0.5 * i2_32m1;
    return x;
}

function unif_rand(): number {
    

    switch (RNG_kind) {

        case IRNGType.WICHMANN_HILL:
            RNGTable[RNG_kind].i_seed[0] *= 171 % 30269;
            RNGTable[RNG_kind].i_seed[1] *= 172 % 30307;
            RNGTable[RNG_kind].i_seed[2] *= 170 % 30323;

            let value = [30269.0, 30307.0, 30323.0].reduce((p, v, i) => {
                p = p + RNGTable[RNG_kind].i_seed[i] / v;
                return p;
            }, 0);

            return fixup(frac(value));/* in [0,1) */

        case IRNGType.MARSAGLIA_MULTICARRY:/* 0177777(octal) == 65535(decimal)*/
            {
                let seeds = RNGTable[RNG_kind].i_seed;

                seeds[0] = 36969 * (seeds[0] & 65535) + (seeds[0] >> 16);
                seeds[1] = 18000 * (seeds[1] & 65535) + (seeds[1] >> 16);

                return fixup(((seeds[0] << 16) ^ (seeds[1] & 65535)) * i2_32m1); /* in [0,1) */
            }
        case IRNGType.SUPER_DUPER:
        {
            /* This is Reeds et al (1984) implementation;
             * modified using __unsigned__	seeds instead of signed ones
             */
            let seeds = RNGTable[RNG_kind].i_seed;

            seeds[0] ^= ((seeds[0] >> 15) & 0x1FFFF); /* ) 0377777 = 0x1FFFF Tausworthe */
            seeds[0] ^= seeds[0] << 17;
            seeds[1] *= 69069;		/* Congruential */
            return fixup( (seeds[0] ^ seeds[1]) * i2_32m1); /* in [0,1) ,  ^ means XOR */
            }
        case IRNGType.MERSENNE_TWISTER:
            return fixup( MT_genrand() );
        case IRNGType.KNUTH_TAOCP:
        case IRNGType.KNUTH_TAOCP2:
            return fixup( KT_next() * KT );
        case IRNGType.USER_UNIF:
            return UserUnif();
        case IRNGType.LECUYER_CMRG:
            {
                /* Based loosely on the GPL-ed version of
                   http://www.iro.umontreal.ca/~lecuyer/myftp/streams00/c2010/RngStream.c
                   but using int_least64_t, which C99 guarantees.
                */
                let k: number;
                let p1: number;
                let p2: number;

                const seeds = RNGTable[RNG_kind].i_seed;

              
                p1 = a12 * trunc(  seeds[1] ) 
                    - a13n * trunc( seeds[1] )
                /* p1 % m1 would surely do */
                k = trunc( p1 / m1 );
                p1 -= k * m1;
                if (p1 < 0.0) p1 += m1;
                seeds[0] = seeds[1];
                seeds[1] = seeds[2];
                seeds[2] = trunc( p1 );
                
                p2 = a21 * trunc( seeds[ 5 ] ) - a23n * trunc( seeds[2] );
                k = trunc(p2 / m2);
                p2 -= k * m2;
                if (p2 < 0.0) p2 += m2;
                seeds[2] = seeds[3];
                seeds[3] = seeds[4];
                seeds[4] = p2;
               
                return ((p1 > p2) ? (p1 - p2) : (p1 - p2 + m1)) * normc;
            }
        default:
            throw Error (`unif_rand: unimplemented RNG kind ${IRNGType[RNG_kind]}` );
    }
}

/* we must mask global variable here, as I1-I3 hide RNG_kind
   and we want the argument */
   static void FixupSeeds(RNGtype RNG_kind, int initial)
   {
   /* Depending on RNG, set 0 values to non-0, etc. */
   
       int j, notallzero = 0;
   
       /* Set 0 to 1 :
          for(j = 0; j <= RNG_Table[RNG_kind].n_seed - 1; j++)
          if(!RNG_Table[RNG_kind].i_seed[j]) RNG_Table[RNG_kind].i_seed[j]++; */
   
       switch(RNG_kind) {
       case WICHMANN_HILL:
       I1 = I1 % 30269; I2 = I2 % 30307; I3 = I3 % 30323;
   
       /* map values equal to 0 mod modulus to 1. */
       if(I1 == 0) I1 = 1;
       if(I2 == 0) I2 = 1;
       if(I3 == 0) I3 = 1;
       return;
   
       case SUPER_DUPER:
       if(I1 == 0) I1 = 1;
       /* I2 = Congruential: must be ODD */
       I2 |= 1;
       break;
   
       case MARSAGLIA_MULTICARRY:
       if(I1 == 0) I1 = 1;
       if(I2 == 0) I2 = 1;
       break;
   
       case MERSENNE_TWISTER:
       if(initial) I1 = 624;
        /* No action unless user has corrupted .Random.seed */
       if(I1 <= 0) I1 = 624;
       /* check for all zeroes */
       for (j = 1; j <= 624; j++)
           if(RNG_Table[RNG_kind].i_seed[j] != 0) {
           notallzero = 1;
           break;
           }
       if(!notallzero) Randomize(RNG_kind);
       break;
   
       case KNUTH_TAOCP:
       case KNUTH_TAOCP2:
       if(KT_pos <= 0) KT_pos = 100;
       /* check for all zeroes */
       for (j = 0; j < 100; j++)
           if(RNG_Table[RNG_kind].i_seed[j] != 0) {
           notallzero = 1;
           break;
           }
       if(!notallzero) Randomize(RNG_kind);
       break;
       case USER_UNIF:
       break;
       case LECUYER_CMRG:
       /* first set: not all zero, in [0, m1)
          second set: not all zero, in [0, m2) */
       {
       unsigned int tmp;
       int allOK = 1;
       for (j = 0; j < 3; j++) {
           tmp = RNG_Table[RNG_kind].i_seed[j];
           if(tmp != 0) notallzero = 1;
           if (tmp >= m1) allOK = 0;
       }
       if(!notallzero || !allOK) Randomize(RNG_kind);
       for (j = 3; j < 6; j++) {
           tmp = RNG_Table[RNG_kind].i_seed[j];
           if(tmp != 0) notallzero = 1;
           if (tmp >= m2) allOK = 0;
       }
       if(!notallzero || !allOK) Randomize(RNG_kind);
       }
       break;
       default:
       error(_("FixupSeeds: unimplemented RNG kind %d"), RNG_kind);
       }
   }
   



function GetRNGstate(void);
void PutRNGstate(void);

double unif_rand(void);
double R_unif_index(double);
/* These are also defined in Rmath.h */
double norm_rand(void);
double exp_rand(void);

typedef unsigned int Int32;
double * user_unif_rand(void);
void user_unif_init(Int32);
int * user_unif_nseed(void);
int * user_unif_seedloc(void);

double * user_norm_rand(void);