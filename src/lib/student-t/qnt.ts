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
import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';
import { R_DT_qIv } from '../exp/expm1';
import { qnorm } from '../normal/qnorm';
import { pnt } from './pnt';
import { qt } from './qt';

const { abs: fabs, max: fmax2, min: fmin2 } = Math;
const {
    MAX_VALUE: DBL_MAX,
    EPSILON: DBL_EPSILON,
    isFinite: R_FINITE,
    POSITIVE_INFINITY: ML_POSINF,
    NEGATIVE_INFINITY: ML_NEGINF,
    isNaN: ISNAN,
} = Number;
const printer = debug('qnt');

export function qnt(p: number, df: number, ncp: number, lower_tail: boolean, log_p: boolean) {
    const accu = 1e-13;
    const Eps = 1e-11; /* must be > accu */

    let ux;
    let lx;
    let nx;
    let pp;

    if (ISNAN(p) || ISNAN(df) || ISNAN(ncp)) return p + df + ncp;

    /* Was
     * df = floor(df + 0.5);
     * if (df < 1 || ncp < 0) ML_ERR_return_NAN;
     */
    if (df <= 0.0) return ML_ERR_return_NAN(printer);

    if (ncp === 0.0 && df >= 1.0) return qt(p, df, lower_tail, log_p);

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, ML_NEGINF, ML_POSINF);
    if (rc !== undefined) {
        return rc;
    }
    if (!R_FINITE(df))
        // df = Inf ==> limit N(ncp,1)
        return qnorm(p, ncp, 1, lower_tail, log_p);

    p = R_DT_qIv(lower_tail, log_p, p);

    /* Invert pnt(.) :
     * 1. finding an upper and lower bound */
    if (p > 1 - DBL_EPSILON) return ML_POSINF;
    pp = fmin2(1 - DBL_EPSILON, p * (1 + Eps));
    for (ux = fmax2(1, ncp); ux < DBL_MAX && pnt(ux, df, ncp, true, false) < pp; ux *= 2);
    pp = p * (1 - Eps);
    for (lx = fmin2(-1, -ncp); lx > -DBL_MAX && pnt(lx, df, ncp, true, false) > pp; lx *= 2);

    /* 2. interval (lx,ux)  halving : */
    do {
        nx = 0.5 * (lx + ux); // could be zero
        if (pnt(nx, df, ncp, true, false) > p) ux = nx;
        else lx = nx;
    } while (ux - lx > accu * fmax2(fabs(lx), fabs(ux)));

    return 0.5 * (lx + ux);
}
