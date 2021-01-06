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

import { ML_ERR_return_NAN, R_D__0, R_D_exp, R_D_val } from '../common/_general';

import { dbinom_raw } from '../binomial/dbinom';

import { lbeta } from './lbeta';

const { log, log1p } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, POSITIVE_INFINITY: ML_POSINF } = Number;

const printer = debug('dbeta');

export function dbeta(x: number, a: number, b: number, asLog: boolean): number {
    if (ISNAN(x) || ISNAN(a) || ISNAN(b)) return x + a + b;

    if (a < 0 || b < 0) return ML_ERR_return_NAN(printer);
    if (x < 0 || x > 1) return R_D__0(asLog);

    // limit cases for (a,b), leading to point masses

    if (a === 0 || b === 0 || !R_FINITE(a) || !R_FINITE(b)) {
        if (a === 0 && b === 0) {
            // point mass 1/2 at each of {0,1} :
            if (x === 0 || x === 1) return ML_POSINF;
            else return R_D__0(asLog);
        }
        if (a === 0 || a / b === 0) {
            // point mass 1 at 0
            if (x === 0) return ML_POSINF;
            else return R_D__0(asLog);
        }
        if (b === 0 || b / a === 0) {
            // point mass 1 at 1
            if (x === 1) return ML_POSINF;
            else return R_D__0(asLog);
        }
        // else, remaining case:  a = b = Inf : point mass 1 at 1/2
        if (x === 0.5) return ML_POSINF;
        else return R_D__0(asLog);
    }

    if (x === 0) {
        if (a > 1) return R_D__0(asLog);
        if (a < 1) return ML_POSINF;
        /* a == 1 : */ return R_D_val(asLog, b);
    }
    if (x === 1) {
        if (b > 1) return R_D__0(asLog);
        if (b < 1) return ML_POSINF;
        /* b == 1 : */ return R_D_val(asLog, a);
    }

    let lval: number;
    if (a <= 2 || b <= 2) lval = (a - 1) * log(x) + (b - 1) * log1p(-x) - lbeta(a, b);
    else {
        lval = log(a + b - 1) + dbinom_raw(a - 1, a + b - 2, x, 1 - x, true);
    }
    return R_D_exp(asLog, lval);
}
