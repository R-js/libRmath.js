/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 20, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000--2008 The R Core Team
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
 *    double rexp(double scale)
 *
 *  DESCRIPTION
 *
 *    Random variates from the exponential distribution.
 *
 */

import { R_FINITE, ML_ERR_return_NAN } from '~common';

import { exp_rand } from './sexp';
import { IRNG } from '../rng/IRNG';
import * as debug from 'debug';

const printer = debug('rexp');

export function rexp(n: number = 1, scale: number = 1, rng: IRNG): number|number[] {
  const result = new Array(n).fill(0).map(m => {
    if (!R_FINITE(scale) || scale <= 0.0) {
      if (scale === 0) return 0;
      /* else */
      return ML_ERR_return_NAN(printer);
    }
    return scale * exp_rand(rng.unif_rand); // --> in ./sexp.c
  });
  
  return result.length === 1 ? result[0] : result;
}
