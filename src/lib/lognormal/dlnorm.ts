/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 4, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2014 The R Core Team
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
 *    The density of the lognormal distribution.
 */

import * as debug from 'debug';
import {
  M_1_SQRT_2PI,
  M_LN_SQRT_2PI,
  ML_ERR_return_NAN,
  R_D__0
} from '../common/_general';
import { map } from '../r-func';

const { isNaN: ISNAN, POSITIVE_INFINITY: ML_POSINF } = Number;
const { log, exp } = Math;
const printer = debug('dlnorm');

export function dlnorm<T>(
  x: T,
  meanlog: number,
  sdlog: number,
  give_log: boolean
): T {
  return map(x)(fx => {
    if (ISNAN(fx) || ISNAN(meanlog) || ISNAN(sdlog)) {
      return fx + meanlog + sdlog;
    }
    if (sdlog <= 0) {
      if (sdlog < 0) {
        return ML_ERR_return_NAN(printer);
      }
      // sdlog == 0 :
      return log(fx) === meanlog ? ML_POSINF : R_D__0(give_log);
    }
    if (fx <= 0) {
      return R_D__0(give_log);
    }
    let y = (log(fx) - meanlog) / sdlog;
    return give_log
      ? -(M_LN_SQRT_2PI + 0.5 * y * y + log(fx * sdlog))
      : M_1_SQRT_2PI * exp(-0.5 * y * y) / (fx * sdlog);
    /* M_1_SQRT_2PI = 1 / sqrt(2 * pi) */
  }) as any;
}
