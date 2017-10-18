/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 18, 2017
 *
 * ORIGNAL AUTHORS
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
 *    The distribution function of the Weibull distribution.
 */

import {
    ISNAN,
    ML_ERR_return_NAN,
    R_DT_0,
    R_D_exp,
    pow
} from '~common';

import {
    expm1,
    R_Log1_Exp
} from '~exp';

export function pweibull(x: number, shape: number, scale: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(x) || ISNAN(shape) || ISNAN(scale))
        return x + shape + scale;

    if (shape <= 0 || scale <= 0) ML_ERR_return_NAN;

    if (x <= 0) {
        return R_DT_0(lower_tail, log_p);
    }
    x = -pow(x / scale, shape);
    return lower_tail
        ? (log_p ? R_Log1_Exp(x) : -expm1(x))
        : R_D_exp(log_p, x);
}
