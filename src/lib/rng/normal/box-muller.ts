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
import { IRNGNormal } from './inormal-rng';

const { log, sqrt, min: fmin2, max: fmax2, abs: fabs, exp, cos, sin } = Math;

const DBL_MIN = 2.22507e-308;
const M_PI = 3.14159265358979323846264338327950288;

export class BoxMuller extends IRNGNormal {
  private BM_norm_keep: number;

  private reset() {
    this.BM_norm_keep = 0;
  }

  constructor(_rng: IRNG) {
    super(_rng);
    this.BM_norm_keep = 0;
    _rng.register('INIT', this.reset.bind(this));
  }

  public norm_rand() {
    let s = 0.0;
    let theta = 0;

    if (this.BM_norm_keep !== 0.0) {
      /* An exact test is intentional */
      s = this.BM_norm_keep;
      this.BM_norm_keep = 0.0;
      return s;
    } else {
      theta = 2 * M_PI * this.rng.unif_rand();
      let R =
        sqrt(-2 * log(this.rng.unif_rand())) +
        10 * DBL_MIN; /* ensure non-zero */
      this.BM_norm_keep = R * sin(theta);
      return R * cos(theta);
    }
  }
}
