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

/*-----------------------------------------------------------*/

import { IRNG } from '../';
import { qnorm } from '../../normal/qnorm';
import { MersenneTwister } from '../mersenne-twister';
import { IRNGNormal } from './inormal-rng';

const BIG = 134217728; /* 2^27 */

const { isArray } = Array;
export class Inversion extends IRNGNormal {
  constructor(_rng: IRNG  = new MersenneTwister(0) ) {
    super(_rng);
  }

  public norm_rand(): number {
    let u1;
    /* unif_rand() alone is not of high enough precision */
    u1 = this.rng.unif_rand();
    u1 = new Int32Array([BIG * u1])[0] + this.rng.unif_rand();
    const result = qnorm(u1 / BIG, 0.0, 1.0, !!1, !!0);
    return isArray(result) ? result[0] : result;
  }
}
