/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 * 
 *  ORIGNINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2015 The R Core Team
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
 *	The distribution function of the exponential distribution.
 */

import { ML_ERR_return_NAN, R_D_exp, R_DT_0 } from '../common/_general';
import { forEach } from '../r-func';

import * as debug from 'debug';
import { R_Log1_Exp } from './expm1';

const { expm1 } = Math;
const { isNaN: ISNAN } = Number;
const printer = debug('pexp');

export function pexp<T>(
  q: T,
  scale: number,
  lower_tail: boolean,
  log_p: boolean
): T {
  return forEach(q)(fx => {
    if (ISNAN(fx) || ISNAN(scale)) return fx + scale;
    if (scale < 0) {
      return ML_ERR_return_NAN(printer);
    }

    if (fx <= 0) return R_DT_0(lower_tail, log_p);
    /* same as weibull( shape = 1): */
    fx = -(fx / scale);
    return lower_tail
      ? log_p ? R_Log1_Exp(fx) : -expm1(fx)
      : R_D_exp(log_p, fx);
  }) as any;
}
