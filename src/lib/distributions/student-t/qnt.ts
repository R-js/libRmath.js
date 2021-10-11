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
import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '@common/logger';
import { R_DT_qIv } from '@dist/exp/expm1';
import { EPSILON, min, max, abs, MAX_VALUE } from '@lib/r-func';
import { qnorm } from '@dist/normal/qnorm';
import { pnt } from './pnt';
import { qt } from './qt';

const printer = debug('qnt');

export function qnt(p: number, df: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    const accu = 1e-13;
    const Eps = 1e-11; /* must be > accu */

    let ux;
    let lx;
    let nx;
    let pp;

    if (isNaN(p) || isNaN(df) || isNaN(ncp)) return p + df + ncp;

    /* Was
     * df = floor(df + 0.5);
     * if (df < 1 || ncp < 0) ML_ERR_return_NAN;
     */
    if (df <= 0.0) return ML_ERR_return_NAN(printer);

    if (ncp === 0.0 && df >= 1.0) return qt(p, df, lower_tail, log_p);

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, -Infinity, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    if (!isFinite(df))
        // df = Inf ==> limit N(ncp,1)
        return qnorm(p, ncp, 1, lower_tail, log_p);

    p = R_DT_qIv(lower_tail, log_p, p);

    /* Invert pnt(.) :
     * 1. finding an upper and lower bound */
    if (p > 1 - EPSILON) return Infinity;
    pp = min(1 - EPSILON, p * (1 + Eps));
    for (ux = max(1, ncp); ux < MAX_VALUE && pnt(ux, df, ncp, true, false) < pp; ux *= 2);
    pp = p * (1 - Eps);
    for (lx = min(-1, -ncp); lx > -MAX_VALUE && pnt(lx, df, ncp, true, false) > pp; lx *= 2);

    /* 2. interval (lx,ux)  halving : */
    do {
        nx = 0.5 * (lx + ux); // could be zero
        if (pnt(nx, df, ncp, true, false) > p) ux = nx;
        else lx = nx;
    } while (ux - lx > accu * max(abs(lx), abs(ux)));

    return 0.5 * (lx + ux);
}
