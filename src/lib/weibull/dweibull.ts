/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  MArch 4, 2017
 * 
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-6 The R Core Team
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
 *    The density function of the Weibull distribution.
 */

import * as debug from 'debug';

import {
    ML_ERR_return_NAN,
    R_D__0,
} from '~common';

const { pow, log, exp} = Math;
const { isNaN: ISNAN, isFinite:R_FINITE, POSITIVE_INFINITY: ML_POSINF } = Number;
const printer = debug('dweilbull');

export function dweibull(x: number, shape: number, scale: number, give_log: boolean): number {

    let tmp1;
    let tmp2;
    if (ISNAN(x) || ISNAN(shape) || ISNAN(scale))
        return x + shape + scale;
    if (shape <= 0 || scale <= 0) return ML_ERR_return_NAN(printer);

    if (x < 0) return R_D__0(give_log);
    if (!R_FINITE(x)) return R_D__0(give_log);
    /* need to handle x == 0 separately */
    if (x === 0 && shape < 1) return ML_POSINF;
    tmp1 = pow(x / scale, shape - 1);
    tmp2 = tmp1 * (x / scale);
    /* These are incorrect if tmp1 == 0 */
    return give_log ?
        -tmp2 + log(shape * tmp1 / scale) :
        shape * tmp1 * exp(-tmp2) / scale;
}
