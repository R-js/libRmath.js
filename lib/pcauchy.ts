/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 * 
 *  ORIGNINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2014 The R Core Team
 *  Copyright (C) 2004 The R Foundation
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
 *	The distribution function of the Cauchy distribution.
 */

import {
    atanpi,
    ISNAN,
    ML_ERR_return_NAN,
    R_FINITE,
    R_DT_0,
    R_DT_1,
    fabs,
    R_D_val
} from './_general';

import { R_D_Clog } from './log1p';

export function pcauchy(x: number, location: number, scale: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(x) || ISNAN(location) || ISNAN(scale))
        return x + location + scale;

    if (scale <= 0) {
        return ML_ERR_return_NAN();
    }

    x = (x - location) / scale;
    if (ISNAN(x)) {
        return ML_ERR_return_NAN();
    }

    if (!R_FINITE(x)) {
        if (x < 0) return R_DT_0(lower_tail, log_p);
        else return R_DT_1(lower_tail, log_p);
    }

    if (!lower_tail)
        x = -x;
    /* for large x, the standard formula suffers from cancellation.
     * This is from Morten Welinder thanks to  Ian Smith's  atan(1/x) : */

    if (fabs(x) > 1) {
        let y = atanpi(1 / x);
        return (x > 0) ? R_D_Clog(log_p, y) : R_D_val(log_p, -y);
    } else {
        return R_D_val(log_p, 0.5 + atanpi(x));
    }

}
