/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 23, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000 The R Core Team
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
 *    #include "Rnorm.h"
 *    double rnorm(double mu, double sigma);
 *
 *  DESCRIPTION
 *
 *    Random variates from the normal distribution.
 *
 */

import * as debug from 'debug';

import { ML_ERR_return_NAN } from '../common/_general';
import { multiplexer, seq as crSeq } from '../r-func';
import { IRNGNormal } from '../rng/normal';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('rnorm');
const seq = crSeq()();

export function rnorm(
  n: number = 1,
  mu: number = 0,
  sigma: number = 1,
  rng: IRNGNormal
): number | number[] {

  let result = multiplexer(seq(n))(() => {
    if (ISNAN(mu) || !R_FINITE(sigma) || sigma < 0) {
      return ML_ERR_return_NAN(printer);
    }
    if (sigma === 0 || !R_FINITE(mu)) {
      return mu; /* includes mu = +/- Inf with finite sigma */
    }
    return mu + sigma * (rng.norm_rand() as number);
  });

  return result.length === 1 ? result[0] : result;
}
