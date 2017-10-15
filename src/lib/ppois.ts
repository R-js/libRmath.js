/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 16, 2017
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
 *    The distribution function of the Poisson distribution.
 */

import {
    ISNAN,
    R_FINITE,
    ML_ERR_return_NAN,
    R_DT_0,
    R_DT_1,
    floor,
    fmax2
} from './_general';

import {
    pgamma
} from './pgamma';

import { NumberW } from './toms708';

export function ppois(x: number, lambda: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(x) || ISNAN(lambda))
        return x + lambda;

    if (lambda < 0.) {
        return ML_ERR_return_NAN();
    }
    if (x < 0) return R_DT_0(lower_tail, log_p);
    if (lambda === 0.) return R_DT_1(lower_tail, log_p);
    if (!R_FINITE(x)) return R_DT_1(lower_tail, log_p);
    x = floor(x + 1e-7);

    return pgamma(lambda, x + 1, 1., !lower_tail, log_p);
}



export function do_search(y: number, z: NumberW, p: number, lambda: number, incr: number): number {
    if (z.val >= p) {
        /* search to the left */
        while (true) {
            if (y === 0 ||
                (z.val = ppois(y - incr, lambda, /*l._t.*/true, /*log_p*/false)) < p)
                return y;
            y = fmax2(0, y - incr);
        }
    }
    else {		/* search to the right */

        while (true) {
            y = y + incr;
            if ((z.val = ppois(y, lambda, /*l._t.*/true, /*log_p*/false)) >= p)
                return y;
        }
    }
}
