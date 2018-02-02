/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 23, 2017
 * 
 *  ORGINAL AUTHOR
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 1995, 1996  Robert Gentleman and Ross Ihaka
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
 *  DESCRIPTION
 * 
 *  random variates of the logistic distribution
 */

import * as debug from 'debug';

import { ML_ERR_return_NAN } from '../common/_general';
import { map, seq } from '../r-func';
import { IRNG } from '../rng';

const { log } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const sequence = seq()();
const printer_rlogis = debug('rlogis');

export function rlogis(
  N: number,
  location: number = 0,
  scale: number = 1,
  rng: IRNG
): number | number[] {
  return map(sequence(N))(() => {
    if (ISNAN(location) || !R_FINITE(scale)) {
      return ML_ERR_return_NAN(printer_rlogis);
    }

    if (scale === 0 || !R_FINITE(location)) return location;
    else {
      let u: number = rng.unif_rand() as number;
      return location + scale * log(u / (1 - u));
    }
  }) as any;
}
