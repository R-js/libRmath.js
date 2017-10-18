/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  MArch 5, 2017
 * 
 *  ORIGINAL AUHTOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 1999-2000  The R Core Team
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
 *    void gammalims(double *xmin, double *xmax);
 *
 *  DESCRIPTION
 *
 *    This function calculates the minimum and maximum legal bounds
 *    for x in gammafn(x).  These are not the only bounds, but they
 *    are the only non-trivial ones to calculate.
 *
 *  NOTES
 *
 *    This routine is a translation into C of a Fortran subroutine
 *    by W. Fullerton of Los Alamos Scientific Laboratory.
 */

import {
    Rf_d1mach as d1mach,
    log,
    fabs,
    ML_NAN,
    ML_ERROR,
    ME,
    fmax2
} from '~common';




export function gammalims(input: { xmin: number, xmax: number }, IEEE_754?: boolean): void {
    /* 
        FIXME: Even better: If IEEE, #define these in nmath.h
          and don't call gammalims() at all
    */
    if (IEEE_754) {
        input.xmin = -170.5674972726612;
        input.xmax = 171.61447887182298; /*(3 Intel/Sparc architectures)*/
        return;
    }

    let alnbig: number;
    let alnsml: number;
    let xln: number;
    let xold: number;
    let i: number;

    alnsml = log(d1mach(1));
    input.xmin = -alnsml;
    let find_xmax = false;
    for (i = 1; i <= 10; ++i) {
        xold = input.xmin;
        xln = log(input.xmin);
        input.xmin -= input.xmin * ((input.xmin + .5) * xln - input.xmin - .2258 + alnsml) /
            (input.xmin * xln + .5);
        if (fabs(input.xmin - xold) < .005) {
            input.xmin = -(input.xmin) + .01;
            find_xmax = true;
            break;
            // goto find_xmax;
        }
    }

    /* unable to find xmin */
    if (!find_xmax) {
        ML_ERROR(ME.ME_NOCONV, 'gammalims');
        input.xmin = input.xmax = ML_NAN;
    }
    //goto label
    //find_xmax:

    alnbig = log(d1mach(2));
    input.xmax = alnbig;
    let done = false;
    for (i = 1; i <= 10; ++i) {
        xold = input.xmax;
        xln = log(input.xmax);
        input.xmax -= input.xmax * ((input.xmax - .5) * xln - input.xmax + .9189 - alnbig) /
            (input.xmax * xln - .5);
        if (fabs(input.xmax - xold) < .005) {
            input.xmax += -.01;
            //goto done;
            done = true;
            break;
        }
    }

    /* unable to find xmax */
    if (!done) {
        ML_ERROR(ME.ME_NOCONV, 'gammalims');
        input.xmin = input.xmax = ML_NAN;
    }
    //goto label
    //done:
    input.xmin = fmax2(input.xmin, -(input.xmax) + 1);
}


