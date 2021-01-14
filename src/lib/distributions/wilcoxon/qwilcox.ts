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
import { R_DT_0, R_DT_1 } from '$constants';

import { R_DT_qIv } from '@distributions/exp/expm1';
import { cwilcox } from './cwilcox';
import { WilcoxonCache } from './WilcoxonCache';

import { choose } from '@special/choose';

const { round: R_forceint, trunc } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, EPSILON: DBL_EPSILON } = Number;

const printer_qwilcox = debug('qwilcox');

export function qwilcox(x: number, m: number, n: number, lowerTail = true, logP = false): number {
    m = R_forceint(m);
    n = R_forceint(n);
    const w = new WilcoxonCache();

    if (ISNAN(x) || ISNAN(m) || ISNAN(n)) return x + m + n;
    if (!R_FINITE(x) || !R_FINITE(m) || !R_FINITE(n)) return ML_ERR_return_NAN(printer_qwilcox);
    R_Q_P01_check(logP, x);

    if (m <= 0 || n <= 0) return ML_ERR_return_NAN(printer_qwilcox);

    if (x === R_DT_0(lowerTail, logP)) return 0;
    if (x === R_DT_1(lowerTail, logP)) return m * n;

    if (logP || !lowerTail) x = R_DT_qIv(lowerTail, logP, x); /* lower_tail,non-log "p" */

    const c = choose(m + n, n);
    let p = 0;
    let q = 0;
    if (x <= 0.5) {
        x = x - 10 * DBL_EPSILON;
        while (true) {
            p += cwilcox(q, m, n, w) / c;
            if (p >= x) break;
            q++;
        }
    } else {
        x = 1 - x + 10 * DBL_EPSILON;
        while (true) {
            p += cwilcox(q, m, n, w) / c;
            if (p > x) {
                q = trunc(m * n - q);
                break;
            }
            q++;
        }
    }
    return q;
}
