/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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

import { debug } from 'debug';
import { ML_ERR_return_NAN, R_Q_P01_check } from '../common/_general';

import { tanpi } from '../trigonometry/tanpi';

const { expm1, exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const { ML_POSINF, ML_NEGINF } = {
    ML_POSINF: Infinity,
    ML_NEGINF: -Infinity,
};

const printer = debug('qcauchy');

export function qcauchy(p: number, location = 0, scale = 1, lowerTail = true, logP = false): number {
    if (ISNAN(p) || ISNAN(location) || ISNAN(scale)) return NaN;
    let lower_tail = lowerTail;

    const rc = R_Q_P01_check(logP, p);
    if (rc !== undefined) {
        return rc;
    }

    if (scale <= 0 || !R_FINITE(scale)) {
        if (scale === 0) return location;
        /* else */ return ML_ERR_return_NAN(printer);
    }

    const my_INF = location + (lower_tail ? scale : -scale) * ML_POSINF;
    if (logP) {
        if (p > -1) {
            /* when ep := exp(p),
             * tan(pi*ep)= -tan(pi*(-ep))= -tan(pi*(-ep)+pi) = -tan(pi*(1-ep)) =
             *		 = -tan(pi*(-expm1(p))
             * for p ~ 0, exp(p) ~ 1, tan(~0) may be better than tan(~pi).
             */
            if (p === 0)
                /* needed, since 1/tan(-0) = -Inf  for some arch. */
                return my_INF;
            lower_tail = !lower_tail;
            p = -expm1(p);
        } else p = exp(p);
    } else {
        if (p > 0.5) {
            if (p === 1) return my_INF;
            p = 1 - p;
            lower_tail = !lower_tail;
        }
    }

    if (p === 0.5) return location; // avoid 1/Inf below
    if (p === 0) return location + (lower_tail ? scale : -scale) * ML_NEGINF; // p = 1. is handled above
    return location + (lower_tail ? -scale : scale) / tanpi(p);
    /*	-1/tan(pi * p) = -cot(pi * p) = tan(pi * (p - 1/2))  */
}
