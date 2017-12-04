/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 20, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000 The R Core Team
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
 *    #include "mathlib.h"
 *    double rf(double dfn, double dfd);
 *
 *  DESCRIPTION
 *
 *    Pseudo-random variates from an F distribution.
 *
 *  NOTES
 *
 *    This function calls rchisq to do the real work
 */

import {
    ISNAN,
    ML_ERR_return_NAN,
    R_FINITE
} from '~common';

import { rchisq } from '~chi-2';
import { uniform } from 'src/lib/uniform';


export function rf(n1: number, n2: number, unif_rand: () => number): number {
    let v1;
    let v2;
    if (ISNAN(n1) || ISNAN(n2) || n1 <= 0. || n2 <= 0.){
        return ML_ERR_return_NAN();
    }

    v1 = R_FINITE(n1) ? (rchisq(n1, unif_rand) / n1) : 1;
    v2 = R_FINITE(n2) ? (rchisq(n2, unif_rand) / n2) : 1;
    return v1 / v2;
}

