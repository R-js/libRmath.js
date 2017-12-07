/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 20, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000 The R Core Team
 *  Copyright (C) 2005 The R Foundation
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
 *    The quantile function of the Weibull distribution.
 */


import {
    ISNAN,
    ML_ERR_return_NAN,
    ML_POSINF,
    R_Q_P01_boundaries,
    pow
} from '~common';

import { R_DT_Clog } from '~exp-tools';

export function qweibull(p: number, shape: number, scale: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(p) || ISNAN(shape) || ISNAN(scale))
        return p + shape + scale;

    if (shape <= 0 || scale <= 0) return ML_ERR_return_NAN();

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
    if (rc !== undefined) {
        return rc;
    }
    return scale * pow(- R_DT_Clog(lower_tail, log_p, p), 1. / shape);
}
