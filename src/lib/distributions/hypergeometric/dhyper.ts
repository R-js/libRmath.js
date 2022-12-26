/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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

import { ML_ERR_return_NAN2, lineInfo4, } from '@common/logger';
import { R_D__0, R_D__1, R_D_negInonint, R_D_nonint_check } from '@lib/r-func';
import { dbinom_raw } from '@dist/binomial/dbinom';

const printer = debug('dhyper');

export function dhyper(x: number, m: number, n: number, k: number, log = false): number {

    if (isNaN(x) || isNaN(m) || isNaN(n) || isNaN(k)) {
        return NaN;
    }

    if (R_D_negInonint(m) || R_D_negInonint(n) || R_D_negInonint(k) || k > m + n) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (x < 0) {
        return R_D__0(log);
    }
    const rc = R_D_nonint_check(log, x, printer); // incl warning
    if (rc !== undefined) {
        return rc;
    }
    x = Math.round(x);
    m = Math.round(m);
    n = Math.round(n);
    k = Math.round(k);

    if (k < x || m < x || k - x > n) return R_D__0(log);
    if (k === 0) { // implies x < k is false so x ===0
        return R_D__1(log);
    }

    const p = k / (m + n);
    const q = (m + n - k) / (m + n);

    const p1 = dbinom_raw(x, m, p, q, log);
    const p2 = dbinom_raw(k - x, n, p, q, log);
    const p3 = dbinom_raw(k, m + n, p, q, log);

    return log ? p1 + p2 - p3 : (p1 * p2) / p3;
}
