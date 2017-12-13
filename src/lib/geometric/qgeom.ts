/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 	     Ross Ihaka
 *  Copyright (C) 2000-12    The R Core Team
 *  Copyright (C) 2004--2005 The R Foundation
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
 *    The quantile function of the geometric distribution.
 */

import {
    ML_ERR_return_NAN,
    ML_POSINF,
    R_Q_P01_boundaries,
    ISNAN,
    fmax2,
    ceil,

} from '~common';

import { R_DT_Clog } from '~exp-utils';

import { log1p } from '~log';

export function qgeom(p: number, prob: number, lower_tail: boolean, log_p: boolean): number {
    if (prob <= 0 || prob > 1) {
        return ML_ERR_return_NAN();
    }

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
    if (rc !== undefined) {
        return rc;
    }


    if (ISNAN(p) || ISNAN(prob))
        return p + prob;


    if (prob === 1) return (0);
    /* add a fuzz to ensure left continuity, but value must be >= 0 */
    return fmax2(0, ceil(R_DT_Clog(lower_tail, log_p, p) / log1p(- prob) - 1 - 1e-12));
}
