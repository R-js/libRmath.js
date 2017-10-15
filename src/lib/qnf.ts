/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 2006-8 The R Core Team
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
 *   	The quantile function of the non-central F distribution.
 * 
 * 
 */

import {
    ISNAN,
    ML_ERR_return_NAN,
    R_FINITE,
    ML_POSINF,
    R_Q_P01_boundaries
} from './_general';

import { qnchisq } from './qnchisq';
import { qnbeta } from './qnbeta';

export function qnf(p: number, df1: number, df2: number, ncp: number, lower_tail: boolean, log_p: boolean) {
    let y;

    if (ISNAN(p) || ISNAN(df1) || ISNAN(df2) || ISNAN(ncp))
        return p + df1 + df2 + ncp;

    if (df1 <= 0. || df2 <= 0. || ncp < 0) ML_ERR_return_NAN;
    if (!R_FINITE(ncp)) ML_ERR_return_NAN;
    if (!R_FINITE(df1) && !R_FINITE(df2)) ML_ERR_return_NAN;
    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
    if (rc !== undefined) {
        return rc;
    }

    if (df2 > 1e8) /* avoid problems with +Inf and loss of accuracy */
        return qnchisq(p, df1, ncp, lower_tail, log_p) / df1;

    y = qnbeta(p, df1 / 2., df2 / 2., ncp, lower_tail, log_p);
    return y / (1 - y) * (df2 / df1);
}
