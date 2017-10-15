/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 25, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998   Ross Ihaka
 *  Copyright (C) 2000-9 The R Core Team
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
 *
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double norm_rand(void);
 *
 *  DESCRIPTION
 *
 *    Random variates from the STANDARD normal distribution  N(0,1).
 *
 * Is called from  rnorm(..), but also rt(), rf(), rgamma(), ...
 */

import {
  exp,
  log,
  sqrt,
  fmax2,
  fabs,
  fmin2,
  sin,
  cos,
  DBL_MIN,
  MATHLIB_ERROR,
  M_PI,
  trunc
} from './_general';


import { unif_rand } from './_unif_random';

import { qnorm as qnorm5 } from './qnorm';

let BM_norm_keep = 0.0;
const A = 2.216035867166471;

/* Different kinds of "N(0,1)" generators :*/

export enum N01type {
  BUGGY_KINDERMAN_RAMAGE = 0,
  AHRENS_DIETER,
  BOX_MULLER,
  USER_NORM,
  INVERSION,
  KINDERMAN_RAMAGE
};


export let N01_kind: N01type = N01type.INVERSION;
export const User_norm_fun = user_norm_fun_default;


/*
 *  REFERENCE
 *
 *    Ahrens, J.H. and Dieter, U.
 *    Extensions of Forsythe's method for random sampling from
 *    the normal distribution.
 *    Math. Comput. 27, 927-937.
 *
 *    The definitions of the constants a[k], d[k], t[k] and
 *    h[k] are according to the abovementioned article
 */
export function norm_rand(): number {

  const a = [

    0.0000000, 0.03917609, 0.07841241, 0.1177699,
    0.1573107, 0.19709910, 0.23720210, 0.2776904,
    0.3186394, 0.36012990, 0.40225010, 0.4450965,
    0.4887764, 0.53340970, 0.57913220, 0.6260990,
    0.6744898, 0.72451440, 0.77642180, 0.8305109,
    0.8871466, 0.94678180, 1.00999000, 1.0775160,
    1.1503490, 1.22985900, 1.31801100, 1.4177970,
    1.5341210, 1.67594000, 1.86273200, 2.1538750
  ];

  const d = [

    0.0000000, 0.0000000, 0.0000000, 0.0000000,
    0.0000000, 0.2636843, 0.2425085, 0.2255674,
    0.2116342, 0.1999243, 0.1899108, 0.1812252,
    0.1736014, 0.1668419, 0.1607967, 0.1553497,
    0.1504094, 0.1459026, 0.1417700, 0.1379632,
    0.1344418, 0.1311722, 0.1281260, 0.1252791,
    0.1226109, 0.1201036, 0.1177417, 0.1155119,
    0.1134023, 0.1114027, 0.1095039
  ];

  const t =
    [
      7.673828e-4, 0.002306870, 0.003860618, 0.005438454,
      0.007050699, 0.008708396, 0.010423570, 0.012209530,
      0.014081250, 0.016055790, 0.018152900, 0.020395730,
      0.022811770, 0.025434070, 0.028302960, 0.031468220,
      0.034992330, 0.038954830, 0.043458780, 0.048640350,
      0.054683340, 0.061842220, 0.070479830, 0.081131950,
      0.094624440, 0.112300100, 0.136498000, 0.171688600,
      0.227624100, 0.330498000, 0.584703100
    ];

  const h =
    [
      0.03920617, 0.03932705, 0.03950999, 0.03975703,
      0.04007093, 0.04045533, 0.04091481, 0.04145507,
      0.04208311, 0.04280748, 0.04363863, 0.04458932,
      0.04567523, 0.04691571, 0.04833487, 0.04996298,
      0.05183859, 0.05401138, 0.05654656, 0.05953130,
      0.06308489, 0.06737503, 0.07264544, 0.07926471,
      0.08781922, 0.09930398, 0.11555990, 0.14043440,
      0.18361420, 0.27900160, 0.70104740
    ];

  /*----------- Constants and definitions for  Kinderman - Ramage --- */
  /*
   *  REFERENCE
   *
   *    Kinderman A. J. and Ramage J. G. (1976).
   *    Computer generation of normal random variables.
   *    JASA 71, 893-896.
   */

  const C1 = 0.398942280401433;
  const C2 = 0.180025191068563;
  function g(x: number) {
    return (C1 * exp(-x * x / 2.0) - C2 * (A - x));
  }



  let s;
  let u1;
  let w = 0;
  let y;
  let u2;
  let u3;
  let aa;
  let tt;
  let theta;
  let R;
  let i;

  let gotoDeliver = false;

  switch (N01_kind) {

    case N01type.AHRENS_DIETER: /* see Reference above */

      u1 = unif_rand();
      s = 0.0;
      if (u1 > 0.5)
        s = 1.0;
      u1 = u1 + u1 - s;
      u1 *= 32.0;
      i = u1;
      if (i === 32)
        i = 31;
      if (i !== 0) {// if 1
        u2 = u1 - i;
        aa = a[i - 1];
        while (u2 <= t[i - 1]) {
          u1 = unif_rand();
          w = u1 * (a[i] - aa);
          tt = (w * 0.5 + aa) * w;




          while (true) {
            if (u2 > tt) {
              gotoDeliver = true;
              break;
              //goto deliver;
            }
            u1 = unif_rand();
            if (u2 < u1) {
              break;
            }
            tt = u1;
            u2 = unif_rand();
          }
          if (gotoDeliver) {
            break;
          }
          u2 = unif_rand();
        }
        if (!gotoDeliver) {
          w = (u2 - t[i - 1]) * h[i - 1];
        }
      }//if 1
      else {//else 1
        i = 6;
        aa = a[31];
        while (true) {
          u1 = u1 + u1;
          if (u1 >= 1.0)
            break;
          aa = aa + d[i - 1];
          i = i + 1;
        }
        u1 = u1 - 1.0;
        let gotoJump = false;
        while (true) {
          w = u1 * d[i - 1];
          tt = (w * 0.5 + aa) * w;
          while (true) {
            u2 = unif_rand();
            if (u2 > tt) {
              gotoJump = true;
              break;
              //goto jump;
            }
            u1 = unif_rand();
            if (u2 < u1) {
              break;
            }
            tt = u1;
          }
          if (gotoJump) {
            break;
          }
          u1 = unif_rand();
        }
          //jump: ; mmm jump and deliver goto labels are basicly the same position in the code
      } //else 1

      //deliver:
      y = aa + w;
      return (s === 1.0) ? -y : y;

    /*-----------------------------------------------------------*/

    case N01type.BUGGY_KINDERMAN_RAMAGE: /* see Reference above */
      /* note: this has problems, but is retained for
       * reproducibility of older codes, with the same
       * numeric code */
      u1 = unif_rand();
      if (u1 < 0.884070402298758) {
        u2 = unif_rand();
        return A * (1.13113163544180 * u1 + u2 - 1);
      }

      if (u1 >= 0.973310954173898) { /* tail: */
        while (true) {
          u2 = unif_rand();
          u3 = unif_rand();
          tt = (A * A - 2 * log(u3));
          if (u2 * u2 < (A * A) / tt)
            return (u1 < 0.986655477086949) ? sqrt(tt) : -sqrt(tt);
        }
      }

      if (u1 >= 0.958720824790463) { /* region3: */
        while (true) {
          u2 = unif_rand();
          u3 = unif_rand();
          tt = A - 0.630834801921960 * fmin2(u2, u3);
          if (fmax2(u2, u3) <= 0.755591531667601)
            return (u2 < u3) ? tt : -tt;
          if (0.034240503750111 * fabs(u2 - u3) <= g(tt))
            return (u2 < u3) ? tt : -tt;
        }
      }

      if (u1 >= 0.911312780288703) { /* region2: */
        while (true) {
          u2 = unif_rand();
          u3 = unif_rand();
          tt = 0.479727404222441 + 1.105473661022070 * fmin2(u2, u3);
          if (fmax2(u2, u3) <= 0.872834976671790)
            return (u2 < u3) ? tt : -tt;
          if (0.049264496373128 * fabs(u2 - u3) <= g(tt))
            return (u2 < u3) ? tt : -tt;
        }
      }

      /* ELSE	 region1: */
      while (true) {
        u2 = unif_rand();
        u3 = unif_rand();
        tt = 0.479727404222441 - 0.595507138015940 * fmin2(u2, u3);
        if (fmax2(u2, u3) <= 0.805577924423817)
          return (u2 < u3) ? tt : -tt;
      }
    case N01type.BOX_MULLER:
      if (BM_norm_keep !== 0.0) { /* An exact test is intentional */
        s = BM_norm_keep;
        BM_norm_keep = 0.0;
        return s;
      } else {
        theta = 2 * M_PI * unif_rand();
        R = sqrt(-2 * log(unif_rand())) + 10 * DBL_MIN; /* ensure non-zero */
        BM_norm_keep = R * sin(theta);
        return R * cos(theta);
      }

    case N01type.USER_NORM:
      return User_norm_fun();

    case N01type.INVERSION:
      const BIG = 134217728; /* 2^27 */
      /* unif_rand() alone is not of high enough precision */
      u1 = unif_rand();
      u1 = trunc(BIG * u1) + unif_rand();
      return qnorm5(u1 / BIG, 0.0, 1.0, true, false);
    case N01type.KINDERMAN_RAMAGE: /* see Reference above */
      /* corrected version from Josef Leydold
       * */
      u1 = unif_rand();
      if (u1 < 0.884070402298758) {
        u2 = unif_rand();
        return A * (1.131131635444180 * u1 + u2 - 1);
      }

      if (u1 >= 0.973310954173898) { /* tail: */
        while (true) {
          u2 = unif_rand();
          u3 = unif_rand();
          tt = (A * A - 2 * log(u3));
          if (u2 * u2 < (A * A) / tt)
            return (u1 < 0.986655477086949) ? sqrt(tt) : -sqrt(tt);
        }
      }

      if (u1 >= 0.958720824790463) { /* region3: */
        while (true) {
          u2 = unif_rand();
          u3 = unif_rand();
          tt = A - 0.630834801921960 * fmin2(u2, u3);
          if (fmax2(u2, u3) <= 0.755591531667601)
            return (u2 < u3) ? tt : -tt;
          if (0.034240503750111 * fabs(u2 - u3) <= g(tt))
            return (u2 < u3) ? tt : -tt;
        }
      }

      if (u1 >= 0.911312780288703) { /* region2: */
        while (true) {
          u2 = unif_rand();
          u3 = unif_rand();
          tt = 0.479727404222441 + 1.105473661022070 * fmin2(u2, u3);
          if (fmax2(u2, u3) <= 0.872834976671790)
            return (u2 < u3) ? tt : -tt;
          if (0.049264496373128 * fabs(u2 - u3) <= g(tt))
            return (u2 < u3) ? tt : -tt;
        }
      }

      /* ELSE	 region1: */
      while (true) {
        u2 = unif_rand();
        u3 = unif_rand();
        tt = 0.479727404222441 - 0.595507138015940 * fmin2(u2, u3);
        if (tt < 0.) continue;
        if (fmax2(u2, u3) <= 0.805577924423817)
          return (u2 < u3) ? tt : -tt;
        if (0.053377549506886 * fabs(u2 - u3) <= g(tt))
          return (u2 < u3) ? tt : -tt;
      }
    default:
      MATHLIB_ERROR('norm_rand(): invalid N01_kind: %d\n', N01_kind);
      return 0.0; /*- -Wall */
  }/*switch*/
}




let seed: number;

export function user_norm_fun_default(): number {
  let u;
  let v;
  let z;
  do {
    u = unif_rand();
    v = 0.857764 * (2. * unif_rand() - 1);
    seed = v / u; z = 0.25 * seed * seed;
    if (z < 1. - u) break;
    if (z > 0.259 / u + 0.35) continue;
  } while (z > -log(u));
  return seed;
}
