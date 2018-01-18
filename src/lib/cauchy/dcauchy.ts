/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 25, 2017
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
 *    The density of the Cauchy distribution.
 */
import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';

import { map } from '../r-func';

const { isNaN: ISNAN } = Number;
const { PI: M_PI, log } = Math;
const printer = debug('dcauchy');

export function dcauchy<T>(
  xx: T,
  location = 0,
  scale = 1,
  giveLog = false
): T {
  return map(xx)(x => {
    let y: number;
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(location) || ISNAN(scale)) {
      return x + location + scale;
    }

    if (scale <= 0) {
      return ML_ERR_return_NAN(printer);
    }

    y = (x - location) / scale;
    return giveLog
      ? -log(M_PI * scale * (1 + y * y))
      : 1 / (M_PI * scale * (1 + y * y));
  }) as any;
}
