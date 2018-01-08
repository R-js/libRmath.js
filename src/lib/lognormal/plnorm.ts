/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-8 The R Core Team
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
 *    The lognormal distribution function.
 */

import * as debug from 'debug';
import { ML_ERR_return_NAN, R_DT_0 } from '../common/_general';
import { pnorm5 as pnorm } from '../normal/pnorm';
import { forEach } from '../r-func';

const { isNaN:ISNAN } = Number;
const { log } = Math;

const printer = debug('plnorm');

export function plnorm<T>(
  x: T,
  meanlog: number = 0,
  sdlog: number = 1,
  lower_tail: boolean = true,
  log_p: boolean = false
): T {
  
  return forEach(x)(fx => {
    if (ISNAN(fx) || ISNAN(meanlog) || ISNAN(sdlog))
      return fx + meanlog + sdlog;

    if (sdlog < 0) return ML_ERR_return_NAN(printer);

    if (fx > 0) return pnorm(log(fx), meanlog, sdlog, lower_tail, log_p);
    return R_DT_0(lower_tail, log_p);
  }) as any;

}
