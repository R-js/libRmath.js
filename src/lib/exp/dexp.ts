/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 27, 2017
 *
 *  ORIGINAL AUTHOR
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
 * 
 *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 *
 *  DESCRIPTION
 *
 *	The density of the exponential distribution.
 */

import { ML_ERR_return_NAN, R_D__0 } from '../common/_general';

import * as debug from 'debug';

import { forEach } from '../r-func';

const { log, exp } = Math;
const { isNaN: ISNAN } = Number;
const printer = debug('dexp');

export function dexp<T>(x: T, scale: number, give_log: boolean = false): T {
  /* NaNs propagated correctly */
  return forEach(x)(fx => {
    if (ISNAN(fx) || ISNAN(scale)) {
      return NaN;
    }

    if (scale <= 0.0) {
      return ML_ERR_return_NAN(printer);
    }

    if (fx < 0) {
      return R_D__0(give_log);
    }
    return give_log ? -fx / scale - log(scale) : exp(-fx / scale) / scale;
  }) as any;
}
