/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 4, 2017
 *
 *  ORIGINAL AUTHOR
 *  AUTHOR
 *    Catherine Loader, catherine@research.bell-labs.com.
 *    October 23, 2000.
 *
 *  Merge in to R:
 *	Copyright (C) 2000-2014 The R Core Team
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
 *
 *  DESCRIPTION
 *
 *    Computes the geometric probabilities, Pr(X=x) = p(1-p)^x.
 */

import {
    ISNAN,
    R_FINITE,
    R_forceint,
    ML_ERR_return_NAN,
    R_D__0,
    R_D_nonint_check,
    log
} from './_general';

import {
    dbinom_raw
} from './dbinom';


export function dgeom(x: number, p: number, give_log: boolean): number { 
    let prob: number;

    if (ISNAN(x) || ISNAN(p)) return x + p;

    if (p <= 0 || p > 1) {
      return  ML_ERR_return_NAN();
    }
    
    let rc = R_D_nonint_check(give_log,x);
    if (rc !== undefined){
        return rc;
    }
    if (x < 0 || !R_FINITE(x) || p == 0) {
        return R_D__0(give_log);
    }
    x = R_forceint(x);

    /* prob = (1-p)^x, stable for small p */
    prob = dbinom_raw(0.,x, p,1-p, give_log);

    return((give_log) ? log(p) + prob : p*prob);
}
