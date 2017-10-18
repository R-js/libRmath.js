/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Januari 23, 2017
 * 
 *  ORIGINAL C-CODE AUTHOR (R Project)
 *    Based on the Fortran routine dcsevl by W. Fullerton.
 *    Adapted from R. Broucke, Algorithm 446, CACM., 16, 254 (1973).
 *
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
 *  *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 * 
 *  License for R statistical package
 * https://www.r-project.org/Licenses/
 * 
 *  SYNOPSIS
 *
 *    int chebyshev_init(double *dos, int nos, double eta)
 *    double chebyshev_eval(double x, double *a, int n)
 *
 *  DESCRIPTION
 *
 *    "chebyshev_init" determines the number of terms for the
 *    double precision orthogonal series "dos" needed to insure
 *    the error is no larger than "eta".  Ordinarily eta will be
 *    chosen to be one-tenth machine precision.
 *
 *    "chebyshev_eval" evaluates the n-term Chebyshev series
 *    "a" at "x".
 *
 *  NOTES
 *
 *    These routines are translations into C of Fortran routines
 *    by W. Fullerton of Los Alamos Scientific Laboratory.
 *
 *    Based on the Fortran routine dcsevl by W. Fullerton.
 *    Adapted from R. Broucke, Algorithm 446, CACM., 16, 254 (1973).
 */



import { NaN, fabs } from '~common';

export function chebyshev_init(dos: number[], nos: number, eta: number): number {
    let i: number;
    let ii: number;
    let err: number;


    if (nos < 1)
        return 0;

    err = 0.0;
    i = 0;			// just to avoid compiler warnings 
    for (ii = 1; ii <= nos; ii++) {
        i = nos - ii;
        err += fabs(dos[i]);
        if (err > eta) {
            return i;
        }
    }
    return i;
}


export function chebyshev_eval(x: number, a: number[], n: number): number {

    let b0: number;
    let  b1: number;
    let  b2: number;
    let  twox: number;
    let i: number;

    if (n < 1 || n > 1000) {
        return NaN;
    }

    if (x < -1.1 || x > 1.1) {
        return NaN;
    }

    twox = x * 2;
    b2 = b1 = 0;
    b0 = 0;
    for (i = 1; i <= n; i++) {
        b2 = b1;
        b1 = b0;
        b0 = twox * b1 - b2 + a[n - i];
    }
    return (b0 - b2) * 0.5;
}

