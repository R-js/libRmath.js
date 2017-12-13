/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2014 The R Core Team
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
 *  SYNOPSIS
 *
 *	#include <Rmath.h>
 *	double qnbinom(double p, double size, double prob,
 *                     int lower_tail, int log_p)
 *
 *  DESCRIPTION
 *
 *	The quantile function of the negative binomial distribution.
 *
 *  NOTES
 *
 *	x = the number of failures before the n-th success
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
    ISNAN,
    fmax2,
    ML_ERR_return_NAN,
    R_Q_P01_boundaries,
    ML_POSINF,
    sqrt,
    R_DT_0,
    R_DT_1,
    DBL_EPSILON,
    R_forceint,
    floor
} from '~common';

import {
    NumberW
} from '~common';

import {
    pnbinom
} from './pnbinom';

import { 
    R_DT_qIv
} from '~exp-utils';

import { INormal } from '~normal';


 function do_search(y: number, z: NumberW, p: number, n: number, pr: number, incr: number): number {
    if (z.val >= p) {
        //* search to the left 
        while (true) {
            if (y === 0 ||
                (z.val = pnbinom(
                    y - incr, 
                    n, 
                    pr, 
                    true, ///log_p,
                    false)) < p)
                return y;
            y = fmax2(0, y - incr);
        }
    }
    else {		// search to the right 

        while (true) {
            y = y + incr;
            if ((z.val = pnbinom(
                y, 
                n, 
                pr, //l._t.
                true, 
                false)) >= p)
                return y;
        }
    }
}


export function qnbinom(
    p: number, 
    size: number, 
    prob: number, 
    lower_tail: boolean, 
    log_p: boolean,
    normal: INormal
): number {
    let P;
    let Q;
    let mu;
    let sigma;
    let gamma;
    let y;

    let z: NumberW = new NumberW(0);


    if (ISNAN(p) || ISNAN(size) || ISNAN(prob))
        return p + size + prob;


    /* this happens if specified via mu, size, since
       prob == size/(size+mu)
    */
    if (prob === 0 && size === 0) return 0;

    if (prob <= 0 || prob > 1 || size < 0) return ML_ERR_return_NAN();

    if (prob === 1 || size === 0) return 0;

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
    if (rc !== undefined) {
        return rc;
    }
    Q = 1.0 / prob;
    P = (1.0 - prob) * Q;
    mu = size * P;
    sigma = sqrt(size * P * Q);
    gamma = (Q + P) / sigma;

    /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
    if (!lower_tail || log_p) {
        p = R_DT_qIv(lower_tail, log_p, p); /* need check again (cancellation!): */
        if (p === R_DT_0(lower_tail, log_p)) return 0;
        if (p === R_DT_1(lower_tail, log_p)) return ML_POSINF;
    }
    /* temporary hack --- FIXME --- */
    if (p + 1.01 * DBL_EPSILON >= 1.) return ML_POSINF;

    /* y := approx.value (Cornish-Fisher expansion) :  */
    z.val = normal.qnorm(p, 0., 1., /*lower_tail*/true, /*log_p*/true);
    y = R_forceint(mu + sigma * (z.val + gamma * (z.val * z.val - 1) / 6));

    z.val = pnbinom(y, size, prob, /*lower_tail*/true, /*log_p*/false);

    /* fuzz to ensure left continuity: */
    p *= 1 - 64 * DBL_EPSILON;

    /* If the C-F value is not too large a simple search is OK */
    if (y < 1e5) return do_search(y, z, p, size, prob, 1);
    /* Otherwise be a bit cleverer in the search */
    {
        let incr = floor(y * 0.001);
        let oldincr;
        do {
            oldincr = incr;
            y = do_search(y, z, p, size, prob, incr);
            incr = fmax2(1, floor(incr / 100));
        } while (oldincr > 1 && incr > y * 1e-15);
        return y;
    }
}

export function qnbinom_mu(p: number, size: number, mu: number, lower_tail: boolean, log_p: boolean, normal: INormal){
    /* FIXME!  Implement properly!! (not losing accuracy for very large size (prob ~= 1)*/
    return qnbinom(p, size, /* prob = */ size / (size + mu), lower_tail, log_p, normal);
}
