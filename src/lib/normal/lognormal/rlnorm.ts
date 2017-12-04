/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 23, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000--2001  The R Core Team
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
 *    double rlnorm(double logmean, double logsd);
 *
 *  DESCRIPTION
 *
 *    Random variates from the lognormal distribution.
 */

import {
    ISNAN,
    R_FINITE,
    ML_ERR_return_NAN,
    exp
} from '~common';

import { rnorm } from '../rnorm';

export function rlnorm(meanlog: number, sdlog: number, unif_rand: () => number): number {
    if (ISNAN(meanlog) || !R_FINITE(sdlog) || sdlog < 0.)
        return ML_ERR_return_NAN();

    return exp(rnorm(meanlog, sdlog, unif_rand));
}
