/*
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 2006 The R Core Team
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
 */

import {
    ISNAN,
    R_FINITE,
    ML_ERR_return_NAN,
    R_Q_P01_boundaries,
    DBL_EPSILON,
    fmin2,
    DBL_MIN
} from './_general';

import { R_DT_qIv } from './expm1';

import { pnbeta } from './pnbeta';

export function qnbeta(p: number, a: number, b: number, ncp: number,
    lower_tail: boolean, log_p: boolean): number {
    const accu = 1e-15;
    const Eps = 1e-14; /* must be > accu */

    let ux, lx, nx, pp;

    if (ISNAN(p) || ISNAN(a) || ISNAN(b) || ISNAN(ncp))
        return p + a + b + ncp;

    if (!R_FINITE(a)) return ML_ERR_return_NAN();

    if (ncp < 0. || a <= 0. || b <= 0.) ML_ERR_return_NAN;

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, 1);
    if (rc !== undefined) {
        return rc;
    }
    p = R_DT_qIv(lower_tail, log_p, p);

    /* Invert pnbeta(.) :
     * 1. finding an upper and lower bound */
    if (p > 1 - DBL_EPSILON) return 1.0;
    pp = fmin2(1 - DBL_EPSILON, p * (1 + Eps));
    for (ux = 0.5;
        ux < 1 - DBL_EPSILON && pnbeta(ux, a, b, ncp, true, false) < pp;
        ux = 0.5 * (1 + ux));
    pp = p * (1 - Eps);
    for (lx = 0.5;
        lx > DBL_MIN && pnbeta(lx, a, b, ncp, true, false) > pp;
        lx *= 0.5);

    /* 2. interval (lx,ux)  halving : */
    do {
        nx = 0.5 * (lx + ux);
        if (pnbeta(nx, a, b, ncp, true, false) > p) ux = nx; else lx = nx;
    }
    while ((ux - lx) / nx > accu);

    return 0.5 * (ux + lx);
}
