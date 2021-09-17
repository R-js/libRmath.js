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

import { ML_ERR_return_NAN, } from '@common/logger';
import { R_DT_0, R_DT_1 } from 'lib/common/constants';
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const { floor, max: fmax2 } = Math;

import debug from 'debug';
import { NumberW } from '$toms708';
import { pgamma } from '@dist/gamma/pgamma';

const printer = debug('ppois');

export function ppois(
    x: number,
    lambda: number,
    lowerTail = true,
    logP = false,
    //normal: INormal //pass it on to "pgamma"->"pgamma_raw"->"ppois_asymp"->(dpnorm??)->("normal.pnorm")
): number {
    if (ISNAN(x) || ISNAN(lambda)) return x + lambda;

    if (lambda < 0) {
        return ML_ERR_return_NAN(printer);
    }
    if (x < 0) return R_DT_0(lowerTail, logP);
    if (lambda === 0) return R_DT_1(lowerTail, logP);
    if (!R_FINITE(x)) return R_DT_1(lowerTail, logP);
    x = floor(x + 1e-7);

    return pgamma(lambda, x + 1, 1, !lowerTail, logP);
}

export function do_search(
    y: number,
    z: NumberW,
    p: number,
    lambda: number,
    incr: number,
    // normal: INormal
): number {
    if (z.val >= p) {
        /* search to the left */
        while (true) {
            if (
                y === 0 ||
                (z.val = ppois(
                    y - incr,
                    lambda,
                    /*l._t.*/ true,
                    /*log_p*/ false,
                    // normal
                )) < p
            )
                return y;
            y = fmax2(0, y - incr);
        }
    } else {
        /* search to the right */

        while (true) {
            y = y + incr;
            if ((z.val = ppois(y, lambda, /*l._t.*/ true, /*log_p*/ false /*, normal*/)) >= p) return y;
        }
    }
}
