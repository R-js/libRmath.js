/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 1995, 1996  Robert Gentleman and Ross Ihaka
 *  Copyright (C) 2000        The R Core Team
 *  Copyright (C) 2005        The R Foundation
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
 * 
 * The Logistic Distribution  quantile function.
 */

import {
    ISNAN,
    R_Q_P01_boundaries,
    ML_NEGINF,
    ML_POSINF,
    ML_ERR_return_NAN,
    log
} from './_general';

import { R_Log1_Exp } from './expm1';

export function qlogis(p: number, location: number, scale: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(p) || ISNAN(location) || ISNAN(scale))
        return p + location + scale;

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, ML_NEGINF, ML_POSINF);
    if (rc !== undefined) {
        return rc;
    }

    if (scale < 0.) {
        return ML_ERR_return_NAN();
    }
    if (scale == 0.) return location;

    /* p := logit(p) = log( p / (1-p) )	 : */
    if (log_p) {
        if (lower_tail)
            p = p - R_Log1_Exp(p);
        else
            p = R_Log1_Exp(p) - p;
    }
    else
        p = log(lower_tail ? (p / (1. - p)) : ((1. - p) / p));

    return location + scale * p;
}
