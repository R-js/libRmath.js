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

import {
    ISNAN,
    ML_ERR_return_NAN,
    R_DT_0,
    R_DT_1,
    R_FINITE,
    floor,
    log,
    exp
} from '~common';

import { log1p } from '~log';
import { R_DT_Clog } from '~exp-utils';

const { expm1 } = Math;

export function pgeom(x: number, p: number, lower_tail: boolean, log_p: boolean) {

    if (ISNAN(x) || ISNAN(p))
        return x + p;

    if (p <= 0 || p > 1) {
        return ML_ERR_return_NAN();
    }

    if (x < 0.) return R_DT_0(lower_tail, log_p);
    if (!R_FINITE(x)) return R_DT_1(lower_tail, log_p);
    x = floor(x + 1e-7);

    if (p === 1.) { /* we cannot assume IEEE */
        x = lower_tail ? 1 : 0;
        return log_p ? log(x) : x;
    }
    x = log1p(-p) * (x + 1);
    if (log_p)
        return R_DT_Clog(lower_tail, log_p, x);
    else
        return lower_tail ? -expm1(x) : exp(x);
}
