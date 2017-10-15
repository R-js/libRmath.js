/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  MArch 4, 2017
 * 
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2014 The R Core Team
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
 *    double fprec(double x, double digits);
 *
 *  DESCRIPTION
 *
 *    Returns the value of x rounded to "digits" significant
 *    decimal digits.
 *
 *  NOTES
 *
 *    This routine is a translation into C of a Fortran subroutine
 *    by W. Fullerton of Los Alamos Scientific Laboratory.
 *    Some modifications have been made so that the routines
 *    conform to the IEEE 754 standard.
 */



import {
    nearbyint as R_rint,
    ISNAN,
    R_FINITE,
    round,
    log10,
    floor,
    fabs,
    R_pow_di
} from './_general';


/* Improvements by Martin Maechler, May 1997;
   further ones, Feb.2000:
   Replace  pow(x, (double)i) by  R_pow_di(x, i) {and use  int dig} */

const MAX_DIGITS = 22;
/* was till R 0.99: DBL_DIG := digits of precision of a double, usually 15 */
/* FIXME: Hmm, have quite a host of these:

       1) ./fround.c   uses much more (sensibly!) ``instead''
       2) ../main/coerce.c   & ../main/deparse.c have  DBL_DIG	directly
       3) ../main/options.c has	  #define MAX_DIGITS 22	 for options(digits)

       Really should decide on a (config.h dependent?) global MAX_DIGITS.
       --MM--
     */


export function fprec(x: number, digits: number): number {

    let l10: number;
    let pow10: number;
    let sgn: number;
    let p10: number;
    let P10: number;

    let e10: number;
    let e2: number;
    let do_round: boolean;
    let dig: number;

    /* Max.expon. of 10 (=308.2547) */
    const max10e = Math.log10(Number.MAX_VALUE);

    if (ISNAN(x) || ISNAN(digits))
        return x + digits;
    if (!R_FINITE(x)) return x;
    if (!R_FINITE(digits)) {
        if (digits > 0.0) return x;
        else digits = 1.0;
    }
    if (x === 0) return x;
    dig = round(digits);
    if (dig > MAX_DIGITS) {
        return x;
    } else if (dig < 1)
        dig = 1;

    sgn = 1.0;
    if (x < 0.0) {
        sgn = -sgn;
        x = -x;
    }
    l10 = log10(x);
    e10 = (dig - 1 - floor(l10));
    if (fabs(l10) < max10e - 2) {
        p10 = 1.0;
        if (e10 > max10e) { /* numbers less than 10^(dig-1) * 1e-308 */
            p10 = R_pow_di(10., e10 - max10e);
            e10 = max10e;
        }
        if (e10 > 0) { /* Try always to have pow >= 1
             and so exactly representable */
            pow10 = R_pow_di(10., e10);
            return (sgn * (R_rint((x * pow10) * p10) / pow10) / p10);
        } else {
            pow10 = R_pow_di(10., -e10);
            return (sgn * (R_rint((x / pow10)) * pow10));
        }
    } else { /* -- LARGE or small -- */
        do_round = max10e - l10 >= R_pow_di(10., -dig);
        e2 = dig + ((e10 > 0) ? 1 : -1) * MAX_DIGITS;
        p10 = R_pow_di(10., e2); x *= p10;
        P10 = R_pow_di(10., e10 - e2); x *= P10;
        /*-- p10 * P10 = 10 ^ e10 */
        if (do_round) x += 0.5;
        x = floor(x) / p10;
        return (sgn * x / P10);
    }
}
