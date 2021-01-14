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

const { round: R_rint } = Math;

import { R_pow_di } from '../_general';

const {
    MAX_SAFE_INTEGER: LONG_MAX,
    EPSILON: DBL_EPSILON,
    POSITIVE_INFINITY: ML_POSINF,
    isNaN: ISNAN,
    NEGATIVE_INFINITY: ML_NEGINF,
    isFinite: R_FINITE,
} = Number;

const { abs: fabs, floor } = Math;

const MAX_DIGITS = Math.trunc(Math.log10(Number.MAX_VALUE));

/* also used potentially in fprec.c and main/format.c */
export function private_rint(x: number) {
    let tmp: number;
    let sgn = 1.0;
    let ltmp: number;

    if (x !== x) {
        return x; /* NaN */
    }

    if (x < 0.0) {
        x = -x;
        sgn = -1.0;
    }

    if (x < LONG_MAX) {
        /* in <limits.h> is architecture dependent */
        ltmp = x + 0.5;
        /* implement round to even */
        if (fabs(x + 0.5 - ltmp) < 10 * DBL_EPSILON && ltmp % 2 === 1) ltmp--;
        tmp = ltmp;
    } else {
        /* ignore round to even: too small a point to bother */
        tmp = floor(x + 0.5);
    }
    return sgn * tmp;
}

export function fround(x: number, digits: number) {
    /* = 308 (IEEE); was till R 0.99: (DBL_DIG - 1) */
    /* Note that large digits make sense for very small numbers */

    let pow10: number;
    let sgn: number;
    let intx: number;
    //let dig: number;

    if (ISNAN(x) || ISNAN(digits)) return x + digits;
    if (!R_FINITE(x)) return x;

    if (digits === ML_POSINF) return x;
    else if (digits === ML_NEGINF) return 0.0;

    if (digits > MAX_DIGITS) digits = MAX_DIGITS;
    const dig = floor(digits + 0.5);
    if (x < 0) {
        sgn = -1;
        x = -x;
    } else sgn = 1;
    if (dig === 0) {
        return sgn * R_rint(x);
    } else if (dig > 0) {
        pow10 = R_pow_di(10, dig);
        intx = floor(x);
        return sgn * (intx + R_rint((x - intx) * pow10) / pow10);
    } else {
        pow10 = R_pow_di(10, -dig);
        return sgn * R_rint(x / pow10) * pow10;
    }
}
