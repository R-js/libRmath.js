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
import { ML_ERR_return_NAN, R_DT_0, R_DT_1, R_Q_P01_check } from '@common/logger';
import { R_DT_qIv } from '../../exp/expm1';
import { csignrank } from './signrank';

const { round, trunc, LN2: M_LN2, exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, EPSILON: DBL_EPSILON } = Number;
const printer_qsignrank = debug('qsignrank');

export function qsignrank(x: number, n: number, lowerTail = true, logP = false): number {
    const roundN = round(n);
    const u = (roundN * (roundN + 1)) / 2;
    const c = trunc(u / 2);
    const w = Array.from<number>({ length: c + 1 }).fill(0);

    if (ISNAN(x) || ISNAN(n)) {
        return NaN;
    }

    if (/*!R_FINITE(x) ||*/ !R_FINITE(n)) {
        return ML_ERR_return_NAN(printer_qsignrank);
    }

    const rc = R_Q_P01_check(logP, x);
    if (rc !== undefined) {
        return rc;
    }

    if (roundN <= 0) {
        return ML_ERR_return_NAN(printer_qsignrank);
    }

    if (x === R_DT_0(lowerTail, logP)) {
        return 0;
    }

    if (x === R_DT_1(lowerTail, logP)) {
        return u;
    }

    if (logP || !lowerTail) {
        x = R_DT_qIv(lowerTail, logP, x); // lower_tail, non-log "p"
    }

    //this.w_init_maybe(n);
    const f = exp(-n * M_LN2);
    let p = 0;
    let q = 0;
    if (x <= 0.5) {
        x = x - 10 * DBL_EPSILON;
        while (true) {
            p += csignrank(q, roundN, u, c, w) * f;
            if (p >= x) break;
            q++;
        }
    } else {
        x = 1 - x + 10 * DBL_EPSILON;
        while (true) {
            p += csignrank(q, roundN, u, c, w) * f;
            if (p > x) {
                q = trunc(u - q);
                break;
            }
            q++;
        }
    }
    return q;
}
