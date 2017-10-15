/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  MArch 5, 2017
 * 
 *  ORIGINAL AUHTOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-11 The R Core Team
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
 *    #include <Rmath.h>
 *    double fround(double x, double digits);
 *
 *  DESCRIPTION
 *
 *    Rounds "x" to "digits" decimal digits.
 *
 */

import {

    nearbyint as R_rint,
    LONG_MAX,
    DBL_EPSILON,
    fabs,
    floor,
    ML_POSINF,
    MAX_DIGITS,
    ISNAN,
    R_FINITE,
    ML_NEGINF,
    R_pow_di

} from './_general';

/* also used potentially in fprec.c and main/format.c */
export function private_rint(x: number) {
    let tmp: number;
    let sgn = 1.0;
    let ltmp: number;

    if (x !== x) {
        return x;   /* NaN */
    }

    if (x < 0.0) {
        x = -x;
        sgn = -1.0;
    }

    if (x < LONG_MAX) { /* in <limits.h> is architecture dependent */
        ltmp = x + 0.5;
        /* implement round to even */
        if (fabs(x + 0.5 - ltmp) < 10 * DBL_EPSILON
            && (ltmp % 2 === 1)) ltmp--;
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
    let dig: number;

    if (ISNAN(x) || ISNAN(digits))
        return x + digits;
    if (!R_FINITE(x)) return x;

    if (digits === ML_POSINF) return x;
    else if (digits === ML_NEGINF) return 0.0;

    if (digits > MAX_DIGITS) digits = MAX_DIGITS;
    dig = floor(digits + 0.5);
    if (x < 0.) {
        sgn = -1.;
        x = -x;
    } else
        sgn = 1.;
    if (dig === 0) {
        return (sgn * R_rint(x));
    } else if (dig > 0) {
        pow10 = R_pow_di(10., dig);
        intx = floor(x);
        return (sgn * (intx + R_rint(((x - intx) * pow10)) / pow10));
    } else {
        pow10 = R_pow_di(10., -dig);
        return (sgn * R_rint((x / pow10)) * pow10);
    }
}
