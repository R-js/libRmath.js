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
 *    double rcauchy(double location, double scale);
 *
 *  DESCRIPTION
 *
 *    Random variates from the Cauchy distribution.
 */

import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';
import { IRNG } from '../rng';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const { PI: M_PI } = Math;
const printer = debug('rcauchy');

export function rcauchy(
  n: number,
  location= 0,
  scale= 1,
  rng: IRNG
): number | number[] {
  const result = new Array(n).fill(0).map(() => {
    if (ISNAN(location) || !R_FINITE(scale) || scale < 0) {
      return ML_ERR_return_NAN(printer);
    }
    if (scale === 0 || !R_FINITE(location)) return location;
    else return location + scale * Math.tan(M_PI * (rng.unif_rand() as number));
  });
  return result.length === 1 ? result[0] : result;
}
