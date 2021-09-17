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

import debug from 'debug';
import { ML_ERR_return_NAN, R_Q_P01_check } from '@common/logger';

import { tanpi } from '@trig/tanpi';

const printer = debug('qcauchy');

export function qcauchy(p: number, location = 0, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(location) || isNaN(scale)) return NaN;
    let lower_tail = lowerTail;

    const rc = R_Q_P01_check(logP, p);
    if (rc !== undefined) {
        return rc;
    }

    if (scale <= 0 || !isFinite(scale)) {
        if (scale === 0) return location;
        /* else */ return ML_ERR_return_NAN(printer);
    }

    //const my_INF = location + (lower_tail ? scale : -scale) * +Infinity;
    const my_INF = lower_tail ? Infinity : -Infinity;
    if (logP) {
        if (p > -1) {
            /* when ep := exp(p),
             * tan(pi*ep)= -tan(pi*(-ep))= -tan(pi*(-ep)+pi) = -tan(pi*(1-ep)) =
             *		 = -tan(pi*(-Math.expm1(p))
             * for p ~ 0, exp(p) ~ 1, tan(~0) may be better than tan(~pi).
             */
            if (p === 0) {
                /* needed, since 1/tan(-0) = -Inf  for some arch. */
                return my_INF;
            }
            lower_tail = !lower_tail;
            p = -Math.expm1(p);
        } 
        else {
            p = Math.exp(p);
        }
    } else {
        if (p > 0.5) {
            if (p === 1) return my_INF;
            p = 1 - p;
            lower_tail = !lower_tail;
        }
    }

    if (p === 0.5) return location; // avoid 1/Inf below
    //if (p === 0) return location + (lower_tail ? scale : -scale) * -Infinity; // p = 1. is handled above
    if (p === 0) return lower_tail ? -Infinity : Infinity;
    return location + (lower_tail ? -scale : scale) / tanpi(p);
    /*	-1/tan(pi * p) = -cot(pi * p) = tan(pi * (p - 1/2))  */
}
