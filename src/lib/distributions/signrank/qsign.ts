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
import { ML_ERR_return_NAN, R_Q_P01_check } from '@common/logger';
import { R_DT_qIv } from '@dist/exp/expm1';
import { cpu_csignrank as csignrank } from './csignrank';

import { R_DT_0, R_DT_1, round, M_LN2, isNaN, isFinite, DBL_EPSILON, trunc, exp } from '@lib/r-func';
import { growMemory } from './csignrank_wasm';

const printer = debug('qsignrank');

export function qsignrank(x: number, n: number, lowerTail = true, logP = false): number {
    if (isNaN(x) || isNaN(n)) {
        return NaN;
    }
    if (!isFinite(x) || !isFinite(n)) {
        return ML_ERR_return_NAN(printer);
    }

    const rc = R_Q_P01_check(logP, x);
    if (rc !== undefined) {
        return rc;
    }

    if (n <= 0) {
        return ML_ERR_return_NAN(printer);
    }
   
    if (x === R_DT_0(lowerTail, logP)) {
        return 0;
    }

    
    n = round(n);
    const u = n * (n + 1) / 2;
    const c = trunc(u / 2);
    
    if (x === R_DT_1(lowerTail, logP)) {
        return u;
    }
   
    if (logP || !lowerTail) {
        x = R_DT_qIv(lowerTail, logP, x); // lower_tail, non-log "p"
    }

    growMemory(c+1);
    
    const f = exp(-n * M_LN2);
    let p = 0;
    let q = 0;
    if (x <= 0.5) {
        x = x - 10 * DBL_EPSILON;
        for (;;) {
            p += csignrank(q, n, u, c) * f;
            if (p >= x) break;
            q++;
        }
    } else {
        x = 1 - x + 10 * DBL_EPSILON;
        for (;;) {
            p += csignrank(q, n, u, c) * f;
            if (p > x) {
                q = trunc(u - q);
                break;
            }
            q++;
        }
    }
    return q;
}
