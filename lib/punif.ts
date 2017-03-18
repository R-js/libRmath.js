/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 18, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2006 The R Core Team
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
 *    The distribution function of the uniform distribution.
 */

import {
    ISNAN,
    R_FINITE,
    ML_ERR_return_NAN,
    R_DT_1,
    R_DT_0,
    R_D_val
} from './_general';



export function punif(x: number, a: number, b: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(x) || ISNAN(a) || ISNAN(b))
        return x + a + b;

    if (b < a) {
        return ML_ERR_return_NAN();
    }
    if (!R_FINITE(a) || !R_FINITE(b)) {
        return ML_ERR_return_NAN();
    }

    if (x >= b) {
        return R_DT_1(lower_tail, log_p);
    }
    if (x <= a){
        return R_DT_0(lower_tail, log_p);
    }
    if (lower_tail) {
        return R_D_val(log_p, (x - a) / (b - a));
    }
    else {
        return R_D_val(log_p, (b - x) / (b - a));
    }
}
