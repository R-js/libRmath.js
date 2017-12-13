/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2013 The R Core Team
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
 *	The distribution function of the negative binomial distribution.
 *
 *  NOTES
 *
 *	x = the number of failures before the n-th success
 */

import {
    ISNAN,
    R_FINITE,
    ML_ERR_return_NAN,
    R_DT_1,
    R_DT_0,
    floor,
    MATHLIB_WARNING
} from '~common';


import { pbeta } from '../beta/pbeta';

import { Toms708, NumberW } from '~common';

export function pnbinom(x: number, size: number, prob: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(x) || ISNAN(size) || ISNAN(prob))
        return x + size + prob;
    if (!R_FINITE(size) || !R_FINITE(prob)) {
        return ML_ERR_return_NAN();
    }

    if (size < 0 || prob <= 0 || prob > 1) {
        return ML_ERR_return_NAN();
    }

    /* limiting case: point mass at zero */
    if (size === 0)
        return (x >= 0) ? R_DT_1(lower_tail, log_p) : R_DT_0(lower_tail, log_p);

    if (x < 0) return R_DT_0(lower_tail, log_p);
    if (!R_FINITE(x)) return R_DT_1(lower_tail, log_p);
    x = floor(x + 1e-7);
    return pbeta(prob, size, x + 1, lower_tail, log_p);
}

export function pnbinom_mu(x: number, size: number, mu: number, lower_tail: boolean, log_p: boolean): number {

    if (ISNAN(x) || ISNAN(size) || ISNAN(mu))
        return x + size + mu;
    if (!R_FINITE(size) || !R_FINITE(mu)) ML_ERR_return_NAN;

    if (size < 0 || mu < 0) ML_ERR_return_NAN;

    /* limiting case: point mass at zero */
    if (size === 0)
        return (x >= 0) ? R_DT_1(lower_tail, log_p) : R_DT_0(lower_tail, log_p);

    if (x < 0) return R_DT_0(lower_tail, log_p);
    if (!R_FINITE(x)) return R_DT_1(lower_tail, log_p);
    x = floor(x + 1e-7);
    /* return
     * pbeta(pr, size, x + 1, lower_tail, log_p);  pr = size/(size + mu), 1-pr = mu/(size+mu)
     *
     *= pbeta_raw(pr, size, x + 1, lower_tail, log_p)
     *            x.  pin   qin
     *=  bratio (pin,  qin, x., 1-x., &w, &wc, &ierr, log_p),  and return w or wc ..
     *=  bratio (size, x+1, pr, 1-pr, &w, &wc, &ierr, log_p) */
    {
        let ierr = new NumberW(0);
        let w = new NumberW(0);
        let wc = new NumberW(0);
        Toms708.bratio(size, x + 1, size / (size + mu), mu / (size + mu), w, wc, ierr, log_p);
        if (ierr)
            MATHLIB_WARNING('pnbinom_mu() -> bratio() gave error code %d', ierr.val);
        return lower_tail ? w.val : wc.val;
    }
}
