'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
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

import { debug } from '@mangos/debug';

import { ME, ML_ERR_return_NAN2, lineInfo4, ML_ERROR2, R_Q_P01_boundaries } from '@common/logger';
import { R_DT_qIv } from '@dist/exp/expm1';
import { ptukey } from './ptukey';

import {
    abs,
    max,
    sqrt,
    log

} from '@lib/r-func';

const p0 = 0.322232421088;
const q0 = 0.99348462606e-1;
const p1 = -1.0;
const q1 = 0.588581570495;
const p2 = -0.342242088547;
const q2 = 0.531103462366;
const p3 = -0.204231210125;
const q3 = 0.10353775285;
const p4 = -0.453642210148e-4;
const q4 = 0.38560700634e-2;
const c1 = 0.8832;
const c2 = 0.2368;
const c3 = 1.214;
const c4 = 1.208;
const c5 = 1.4142;
const vmax = 120.0;


const printer = debug('qtukey');



function qinv(p: number, c: number, v: number): number {
  
    //let ps;
    let q;
    let t;
    //let yi;

    const ps = 0.5 - 0.5 * p;
    const yi = sqrt(log(1.0 / (ps * ps)));
    t = yi + ((((yi * p4 + p3) * yi + p2) * yi + p1) * yi + p0) / ((((yi * q4 + q3) * yi + q2) * yi + q1) * yi + q0);
    if (v < vmax)
    {
        t += (t * t * t + t) / v / 4.0;
       
    }
    q = c1 - c2 * t;
    if (v < vmax)
    {
        q += -c3 / v + (c4 * t) / v;
    }
    return t * (q * log(c - 1.0) + c5);
}

/*
 *  Copenhaver, Margaret Diponzio & Holland, Burt S.
 *  Multiple comparisons of simple effects in
 *  the two-way analysis of variance with fixed effects.
 *  Journal of Statistical Computation and Simulation,
 *  Vol.30, pp.1-15, 1988.
 *
 *  Uses the secant method to find critical values.
 *
 *  p = confidence level (1 - alpha)
 *  nranges = no. of rows or groups
 *  nmeans = no. of columns or treatments
 *  df = degrees of freedom of error term
 *
 *  ir(1) = error flag = 1 if wprob probability > 1
 *  ir(2) = error flag = 1 if ptukey probability > 1
 *  ir(3) = error flag = 1 if convergence not reached in 50 iterations
 *		       = 2 if df < 2
 *
 *  qtukey = returned critical value
 *
 *  If the difference between successive iterates is less than eps,
 *  the search is terminated
 */



/**
> qtukey
function (p, nmeans, df, nranges = 1, lower.tail = TRUE, log.p = FALSE)
.Call(C_qtukey, p, nranges, nmeans, df, lower.tail, log.p)
<bytecode: 0x000000001cde4a80>
<environment: namespace:stats>

*/


export function qtukey(
    p: number, //p
    nmeans: number, //nmeans
    df: number, //df
    nranges = 1, //ranges
    lower_tail = true, //lower.tail
    log_p = false, //log.p
): number {
    const eps = 0.0001;
    const maxiter = 50;

    let ans = 0.0;
    let valx0;
    let valx1;
    let x0;
    let x1;
    let xabs;
    let iter;

    if (isNaN(p) || isNaN(nranges) || isNaN(nmeans) || isNaN(df))
    {
        ML_ERROR2(ME.ME_DOMAIN, 'qtukey', printer);
        return NaN;
    }

    /* df must be > 1 ; there must be at least two values */
    if (df < 2 || nranges < 1 || nmeans < 2)
    {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, Infinity);
    if (rc !== undefined)
    {
        return rc;
    }

    p = R_DT_qIv(lower_tail, log_p, p); /* lower_tail,non-log "p" */

    /* Initial value */

    x0 = qinv(p, nmeans, df);

    /* Find prob(value < x0) */

    valx0 = ptukey(x0, nmeans, df, nranges,  /*LOWER*/ true, /*LOG_P*/ false) - p;

    /* Find the second iterate and prob(value < x1). */
    /* If the first iterate has probability value */
    /* exceeding p then second iterate is 1 less than */
    /* first iterate; otherwise it is 1 greater. */

    if (valx0 > 0.0)
    {
        x1 = max(0.0, x0 - 1.0);
       
    }
    else
    {
         x1 = x0 + 1.0;
         
    }
    
    valx1 = ptukey(x1, nmeans, df, nranges, /*LOWER*/ true, /*LOG_P*/ false) - p;

    /* Find new iterate */

    for (iter = 1; iter < maxiter; iter++) {
        ans = x1 - (valx1 * (x1 - x0)) / (valx1 - valx0);
        valx0 = valx1;

        /* New iterate must be >= 0 */

        x0 = x1;
        if (ans < 0.0) {
            ans = 0.0;
            valx1 = -p;
        }
        /* Find prob(value < new iterate) */

        valx1 = ptukey(ans, nmeans, df, nranges, /*LOWER*/ true, /*LOG_P*/ false) - p;
        x1 = ans;

        /* If the difference between two successive */
        /* iterates is less than eps, stop */

        xabs = abs(x1 - x0);
        if (xabs < eps) 
        {   
            return ans;
        }
    }

    /* The process did not converge in 'maxiter' iterations */
    
    ML_ERROR2(ME.ME_NOCONV, 'qtukey', printer);
    return ans;   
}
