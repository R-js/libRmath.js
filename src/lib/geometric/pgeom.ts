/*

 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2006 The R Core Team
 *  Copyright (C) 2004	    The R Foundation
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
 *    The distribution function of the geometric distribution.
 */
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_DT_0, R_DT_1 } from '../common/_general';

import { R_DT_Clog } from '../exp/expm1'; 

const { expm1, log1p, log, exp, floor } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('pgeom');

export function pgeom<T>(
  xx: T,
  p: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);

  const result = fx.map(x => {
    if (ISNAN(x) || ISNAN(p)) return x + p;

    if (p <= 0 || p > 1) {
      return ML_ERR_return_NAN(printer);
    }

    if (x < 0) return R_DT_0(lowerTail, logP);
    if (!R_FINITE(x)) return R_DT_1(lowerTail, logP);
    x = floor(x + 1e-7);

    if (p === 1) {
      /* we cannot assume IEEE */
      x = lowerTail ? 1 : 0;
      return logP ? log(x) : x;
    }
    x = log1p(-p) * (x + 1);
    if (logP) return R_DT_Clog(lowerTail, logP, x);
    else return lowerTail ? -expm1(x) : exp(x);
  });
  return result.length === 1 ? result[0] : (result as any);
}
