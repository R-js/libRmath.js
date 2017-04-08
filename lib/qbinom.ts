/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 18, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2009 The R Core Team
 *  Copyright (C) 2003-2009 The R Foundation
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
 *	The quantile function of the binomial distribution.
 *
 *  METHOD
 *
 *	Uses the Cornish-Fisher Expansion to include a skewness
 *	correction to a normal approximation.  This gives an
 *	initial value which never seems to be off by more than
 *	1 or 2.	 A search is then conducted of values close to
 *	this initial start point.
 */

import {
    fmax2,
    fmin2,
    REprintf,
    ISNAN,
    R_FINITE,
    ML_ERR_return_NAN,
    floor,
    sqrt,
    DBL_EPSILON,
    R_Q_P01_boundaries
} from './_general';

import { NumberW } from './Toms708';

import { pbinom } from './pbinom';

import { R_DT_qIv } from './expm1';

import { qnorm } from './qnorm';

function do_search(y: number, z: NumberW, p: number, n: number, pr: number, incr: number): number {
    if (z.val >= p) {
        /* search to the left */

        REprintf('\tnew z=%7g >= p = %7g  --> search to left (y--) ..\n', z.val, p);

        while (true) {
            let newz: number;
            if (y === 0 ||
                (newz = pbinom(y - incr, n, pr, /*l._t.*/true, /*log_p*/false)) < p)
                return y;
            y = fmax2(0, y - incr);
            z.val = newz;
        }
    }
    else {		/* search to the right */

        REprintf('\tnew z=%7g < p = %7g  --> search to right (y++) ..\n', z.val, p);

        while (true) {
            y = fmin2(y + incr, n);
            if (y === n ||
                (z.val = pbinom(y, n, pr, /*l._t.*/true, /*log_p*/false)) >= p)
                return y;
        }
    }
}


export function qbinom(p: number, n: number, pr: number, lower_tail: boolean, log_p: boolean): number {
    let q: number;
    let mu: number;
    let sigma: number;
    let gamma: number;
    let z = new NumberW(0);
    let y: number;


    if (ISNAN(p) || ISNAN(n) || ISNAN(pr))
        return p + n + pr;

    if (!R_FINITE(n) || !R_FINITE(pr)) {
        return ML_ERR_return_NAN();
    }
    /* if log_p is true, p = -Inf is a legitimate value */
    if (!R_FINITE(p) && !log_p) {
        return ML_ERR_return_NAN();
    }


    if (n !== floor(n + 0.5)) ML_ERR_return_NAN;
    if (pr < 0 || pr > 1 || n < 0)
        ML_ERR_return_NAN;

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, n);
    if (rc !== undefined) {
        return rc;
    }

    if (pr === 0. || n === 0) return 0.;

    q = 1 - pr;
    if (q === 0.) return n; /* covers the full range of the distribution */
    mu = n * pr;
    sigma = sqrt(n * pr * q);
    gamma = (q - pr) / sigma;


    REprintf('qbinom(p=%7g, n=%g, pr=%7g, l.t.=%d, log=%d): sigm=%g, gam=%g\n',
        p, n, pr, lower_tail, log_p, sigma, gamma);

    /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
    if (!lower_tail || log_p) {
        p = R_DT_qIv(lower_tail, log_p, p); /* need check again (cancellation!): */
        if (p === 0.) return 0.;
        if (p === 1.) return n;
    }
    /* temporary hack --- FIXME --- */
    if (p + 1.01 * DBL_EPSILON >= 1.) return n;

    /* y := approx.value (Cornish-Fisher expansion) :  */
    z.val = qnorm(p, 0., 1., /*lower_tail*/true, /*log_p*/false);
    y = floor(mu + sigma * (z.val + gamma * (z.val * z.val - 1) / 6) + 0.5);

    if (y > n) /* way off */ y = n;


    REprintf('  new (p,1-p)=(%7g,%7g), z=qnorm(..)=%7g, y=%5g\n', p, 1 - p, z.val, y);

    z.val = pbinom(y, n, pr, /*lower_tail*/true, /*log_p*/false);

    /* fuzz to ensure left continuity: */
    p *= 1 - 64 * DBL_EPSILON;

    if (n < 1e5) return do_search(y, z, p, n, pr, 1);
    /* Otherwise be a bit cleverer in the search */
    {
        let incr = floor(n * 0.001);
        let oldincr;
        do {
            oldincr = incr;
            y = do_search(y, z, p, n, pr, incr);
            incr = fmax2(1, floor(incr / 100));
        } while (oldincr > 1 && incr > n * 1e-15);
        return y;
    }
}
