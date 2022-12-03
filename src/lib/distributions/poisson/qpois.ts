'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4, R_Q_P01_boundaries } from '@common/logger';

import { NumberW } from '@common/toms708/NumberW';

import { ppois } from './ppois';

import { qnorm } from '@dist/normal/qnorm';

import { R_DT_qIv } from '@dist/exp/expm1';

import { max, sqrt, floor, round as nearbyint, isNaN, DBL_EPSILON, isFinite } from '@lib/r-func';

function do_search(y: number, z: NumberW, p: number, lambda: number, incr: number): number {
    if (z.val >= p) {
        // search to the left
        while (true) {
            if (y === 0 || (z.val = ppois(y - incr, lambda, true, false)) < p) return y;
            y = max(0, y - incr);
        }
    } else {
        // search to the right

        while (true) {
            y = y + incr;
            if ((z.val = ppois(y, lambda, true, false)) >= p) return y;
        }
    }
}

const printer = debug('qpois');

export function qpois(
    p: number,
    lambda: number,
    lower_tail = true,
    log_p = false
): number {
    let y;
    const z = new NumberW(0);

    if (isNaN(p) || isNaN(lambda)) return p + lambda;

    if (!isFinite(lambda)) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (lambda < 0) return ML_ERR_return_NAN2(printer, lineInfo4);
    if (lambda === 0) return 0;

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
    // normalize
    if (!lower_tail || log_p) {
        p = R_DT_qIv(lower_tail, log_p, p); /* need check again (cancellation!): */
        // for example exp(p=-10_000) is 0 or 1 if it is flipped with lower_tail = false
        if (p === 0) return 0;
        if (p === 1) return Infinity;
    }

     /* temporary hack --- FIXME --- */
    if (p + 1.01 * DBL_EPSILON >= 1) return Infinity;

    const mu = lambda;
    const sigma = sqrt(lambda);
    /* gamma = sigma; PR#8058 should be kurtosis which is mu^-0.5 */
    const gamma = 1.0 / sigma;
    
    /* y := approx.value (Cornish-Fisher expansion) :  */
    z.val = qnorm(p, 0, 1, /*lower_tail*/ true, /*log_p*/ false);

    y = nearbyint(mu + sigma * (z.val + (gamma * (z.val * z.val - 1)) / 6));

    z.val = ppois(y, lambda, /*lower_tail*/ true, /*log_p*/ false);

    /* fuzz to ensure left continuity; 1 - 1e-7 may lose too much : */
    p *= 1 - 64 * DBL_EPSILON;

    /* If the mean is not too large a simple search is OK */
    if (lambda < 1e5) return do_search(y, z, p, lambda, 1);
    /* Otherwise be a bit cleverer in the search */
    {
        let incr = floor(y * 0.001);
        let oldincr;
        do {
            oldincr = incr;
            y = do_search(y, z, p, lambda, incr);
            incr = max(1, floor(incr / 100));
        } while (oldincr > 1 && incr > lambda * 1e-15);
        return y;
    }
}
