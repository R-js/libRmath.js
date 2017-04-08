/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 18, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000 The R Core Team
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
 *    The quantile function of the exponential distribution.
 *
 */

import { ISNAN, R_DT_0, ML_ERR_return_NAN, R_Q_P01_check } from './_general';

import { R_DT_Clog } from './expm1';

export function qexp(p: number, scale: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(p) || ISNAN(scale))
        return p + scale;

    if (scale < 0) return ML_ERR_return_NAN();

    let rc = R_Q_P01_check(log_p, p);
    if (rc !== undefined) {
        return rc;
    }
    if (p === R_DT_0(lower_tail, log_p))
        return 0;

    return - scale * R_DT_Clog(lower_tail, log_p, p);
}
