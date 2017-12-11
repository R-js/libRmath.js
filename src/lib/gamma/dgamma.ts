/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 27, 2017
 *
 *  ORIGINAL AUTHOR
 * 
 *    Catherine Loader, catherine@research.bell-labs.com.
 *    October 23, 2000.
 *
 *  Merge in to R:
 *	Copyright (C) 2000 The R Core Team
 *	Copyright (C) 2004 The R Foundation
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
 *
 * DESCRIPTION
 *
 *   Computes the density of the gamma distribution,
 *
 *                   1/s (x/s)^{a-1} exp(-x/s)
 *        p(x;a,s) = -----------------------
 *                            (a-1)!
 *
 *   where `s' is the scale (= 1/lambda in other parametrizations)
 *     and `a' is the shape parameter ( = alpha in other contexts).
 *
 * The old (R 1.1.1) version of the code is available via `#define D_non_pois'
 */

import { ML_ERR_return_NAN, R_D__0 } from '~common';

import { dpois_raw } from '~poisson';
import * as debug from 'debug';

const { log } = Math;
const { isNaN: ISNAN, POSITIVE_INFINITY: ML_POSINF } = Number;
const { isArray } = Array;

const printer = debug('dgamma');

export function dgamma<T>(
  x: T,
  shape: number,
  scale: number = 1,
  give_log: boolean = false
): T {

  const fa: number[] = isArray(x) ? x : [x] as any;
  const result = fa.map(x => {
    let pr: number;

    if (ISNAN(x) || ISNAN(shape) || ISNAN(scale)) return x + shape + scale;
    if (shape < 0 || scale <= 0) {
      return ML_ERR_return_NAN(printer);
    }
    if (x < 0) {
      return R_D__0(give_log);
    }
    if (shape === 0) {
      /* point mass at 0 */
      return x === 0 ? ML_POSINF : R_D__0(give_log);
    }
    if (x === 0) {
      if (shape < 1) return ML_POSINF;
      if (shape > 1) {
        return R_D__0(give_log);
      }
      /* else */
      return give_log ? -log(scale) : 1 / scale;
    }

    if (shape < 1) {
      pr = dpois_raw(shape, x / scale, give_log);
      return give_log ? pr + log(shape / x) : pr * shape / x;
    }
    /* else  shape >= 1 */
    pr = dpois_raw(shape - 1, x / scale, give_log);
    return give_log ? pr - log(scale) : pr / scale;
  });
  return result.length === 1 ? result[0] : result as any;
}
