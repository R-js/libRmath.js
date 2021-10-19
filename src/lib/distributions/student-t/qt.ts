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

import { debug } from 'debug';

import {
    ME,
    ML_ERROR,
    R_Q_P01_boundaries,
    ML_ERR_return_NAN
} from '@common/logger';

import {
    DBL_MANT_DIG,
    M_1_PI,
    M_PI_2,
    R_D_Cval,
    R_D_log,
    R_D_Lval,
    R_D_qIv,
    DBL_EPSILON,
    min,
    abs,
    expm1,
    sqrt,
    exp,
    LN2,
    SQRT2,
    pow,
    PI,
    log,
    DBL_MAX,
    DBL_MIN
} from '@lib/r-func';

import { R_D_LExp, R_DT_qIv } from '@dist/exp/expm1';
import { qnorm } from '@dist/normal/qnorm';
import { tanpi } from '@trig/tanpi';
import { _dt } from './dt';
import { pt } from './pt';

const printer = debug('qt');

const accu = 1e-13;
const Eps = 1e-11; /* must be > accur */
const eps = 1e-12;

export function qt(p: number, ndf: number, lower_tail: boolean, log_p: boolean): number {

    let P;
    let q;

    if (isNaN(p) || isNaN(ndf)) {
        return p + ndf;
    }

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, -Infinity, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    if (ndf <= 0.0)
    {
        return ML_ERR_return_NAN(printer);
    }

    if (ndf < 1)
    {
        /* based on qnt */

        // double
        let ux;
        let lx;
        let nx;
        let pp;

        // int
        let iter = 0;

        p = R_DT_qIv(lower_tail, log_p, p);

        /* Invert pt(.) :
         * 1. finding an upper and lower bound */
        if (p > 1 - DBL_EPSILON)
        {
             return Infinity;
        }

        pp = min(1 - DBL_EPSILON, p * (1 + Eps));

        for (
            ux = 1;
            ux < DBL_MAX && pt(ux, ndf, true, false) < pp;
            ux *= 2
        );
        
        pp = p * (1 - Eps);
        
        for (
            lx = -1;
            lx > -DBL_MAX && pt(lx, ndf, true, false) > pp;
            lx *= 2
        );

        /* 2. interval (lx,ux)  halving
       regula falsi failed on qt(0.1, 0.1)
     */
        do 
        {
            nx = 0.5 * (lx + ux);
            if (pt(nx, ndf, true, false) > p)
            {
                 ux = nx;
            }
            else
            {
                 lx = nx;
            }
        } while ((ux - lx) / abs(nx) > accu && ++iter < 1000);

        if (iter >= 1000)
        {
            ML_ERROR(ME.ME_PRECISION, 'qt', printer);
        }
        return 0.5 * (lx + ux);
    }

    /* Old comment:
     * FIXME: "This test should depend on  ndf  AND p  !!
     * -----  and in fact should be replaced by
     * something like Abramowitz & Stegun 26.7.5 (p.949)"
     *
     * That would say that if the qnorm value is x then
     * the result is about x + (x^3+x)/4df + (5x^5+16x^3+3x)/96df^2
     * The differences are tiny even if x ~ 1e5, and qnorm is not
     * that accurate in the extreme tails.
     */
    if (ndf > 1e20)
    {
        return qnorm(p, 0, 1, lower_tail, log_p);
    }

    P = R_D_qIv(log_p, p); /* if exp(p) underflows, we fix below */

    const neg = (!lower_tail || P < 0.5) && (lower_tail || P > 0.5);
    const is_neg_lower = lower_tail === neg; /* both TRUE or FALSE == !xor */
    if (neg)
    {
        if (log_p)
        {
            if (lower_tail)
            {
                P=2*P;
            }
            else
            {
                P=2*-expm1(p)
            }
        }
        else
        {
            P=2*R_D_Lval(lower_tail,p)

        }
    }
    else 
    {
        if (log_p)
        {
            if(lower_tail)
            {
                P=2*-expm1(p);
            }
            else
            {
                P=2*P;
            }
        }
        else
        {
            P=2*R_D_Cval(lower_tail, p);
        }
    }
    /* 0 <= P <= 1 ; P = 2*min(P', 1 - P')  in all cases */
    if (abs(ndf - 2) < eps)
    {
        /* df ~= 2 */
        if (P > DBL_MIN)
        {
            if (3 * P < DBL_EPSILON)
            {
                /* P ~= 0 */
                q = 1 / sqrt(P);
            }
            else if (P > 0.9)
            {
                /* P ~= 1 */
                q = (1 - P) * sqrt(2 / (P * (2 - P)));
            }
            /* eps/3 <= P <= 0.9 */ 
            else 
            {
                q = sqrt(2 / (P * (2 - P)) - 2);
            }
        } 
        else 
        {
            /* P << 1, q = 1/sqrt(P) = ... */
            if (log_p)
            {
                q = is_neg_lower ? exp(-p / 2) / SQRT2 : 1 / sqrt(-expm1(p));
            }
            else
            {
                q = Infinity;
            }
        }
    } 
    else if (ndf < 1 + eps)
    {
        /* df ~= 1  (df < 1 excluded above): Cauchy */
        if (P === 1)
        {
            q = 0;
        }
        else if (P > DBL_EPSILON/2)
        {
            // some versions of tanpi give Inf, some NaN
            q = 1 / tanpi(P / 2);
        }
        else
        {
            // == - tan((P+1) * M_PI_2) -- suffers for P ~= 0 

            //P = 0, but maybe = 2*exp(p) !
            if (log_p)
            {
                // 1/tan(e) ~ 1/e
                q = is_neg_lower ? M_1_PI * exp(-p) : -1 / (PI * expm1(p));
            }
            else
            {
                q = Infinity;
            }
        }
    } 
    else
    {
        /*-- usual case;  including, e.g.,  df = 1.1 */
        // double
        let x = 0;
        let y = 0;
        let log_P2 = 0; /* -Wall */
        const a = 1 / (ndf - 0.5);
        const b = 48 / (a * a);
        let c = (((20700 * a) / b - 98) * a - 16) * a + 96.36;
        const d = ((94.5 / (b + c) - 3) / b + 1) * sqrt(a * M_PI_2) * ndf;

        // boolean
        const P_ok1 = P > DBL_MIN || !log_p;
        let P_ok = P_ok1;

        if (P_ok1)
        {
            y = pow(d * P, 2.0 / ndf);
            P_ok = y >= DBL_EPSILON;
        }
        if (!P_ok)
        {
            // log.p && P very.small  ||  (d*P)^(2/df) =: y < eps_c
            /* == log(P / 2) */
            if (is_neg_lower){
                log_P2 =  R_D_log(log_p, p);
            }
            else {
                log_P2 = R_D_LExp(log_p, p);
            }
            x = (log(d) + LN2 + log_P2) / ndf;
            y = exp(2 * x);
        }

        if ((ndf < 2.1 && P > 0.5) || y > 0.05 + a)
        {
            /* P > P0(df) */
            /* Asymptotic inverse expansion about normal */
            if (P_ok)
            {
                x = qnorm(0.5 * P, 0, 1, /*lower_tail*/ false, /*log_p*/ false);
            }
            /* log_p && P underflowed */
            else 
            {
                x = qnorm(log_P2, 0, 1, lower_tail, /*log_p*/ true);
            }

            y = x * x;
            if (ndf < 5)
            {
                c += 0.3 * (ndf - 4.5) * (x + 0.6);
            }
            c = (((0.05 * d * x - 5) * x - 7) * x - 2) * x + b + c;
            y = (((((0.4 * y + 6.3) * y + 36) * y + 94.5) / c - y - 3) / b + 1) * x;
            y = expm1(a * y * y);
            q = sqrt(ndf * y);
        } 
        else if (!P_ok && x < -LN2 * DBL_MANT_DIG)
        {
            /* 0.5* log(EPSILON) */
            /* y above might have underflown */
            q = sqrt(ndf) * exp(-x);
        } 
        else
        {
            /* re-use 'y' from above */
            y =
                (((1 / (((ndf + 6) / (ndf * y) - 0.089 * d - 0.822) * (ndf + 2) * 3) + 0.5 / (ndf + 4)) * y - 1) *
                    (ndf + 1)) /
                (ndf + 2) +
                1 / y;
            q = sqrt(ndf * y);
        }

        /* Now apply 2-term Taylor expansion improvement (1-term = Newton):
         * as by Hill (1981) [ref.above] */

        /* FIXME: This can be far from optimal when log_p = TRUE
         *      but is still needed, e.g. for qt(-2, df=1.01, log=TRUE).
         *	Probably also improvable when  lower_tail = FALSE */

        if (P_ok1)
        {
            let it = 0;
            while (
                it++ < 10 &&
                (y = _dt(q, ndf, false)) > 0 &&
                isFinite((x = (pt(q, ndf, false, false) - P / 2) / y)) &&
                abs(x) > 1e-14 * abs(q)
            )
            {
                /* Newton (=Taylor 1 term):
                 *  q += x;
                 * Taylor 2-term : */
                q += x * (1 + (x * q * (ndf + 1)) / (2 * (q * q + ndf)));
            }
        }
    }
    if (neg)
    {
        q = -q;
    }
    return q;
}
