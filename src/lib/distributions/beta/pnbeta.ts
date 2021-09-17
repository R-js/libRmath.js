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
import debug from 'debug';
import { ML_ERR_return_NAN, ME, ML_ERROR } from '@common/logger.js';
import { R_P_bounds_01 } from '@lib/r-func.js';

import { lgammafn_sign } from '@special/gamma/lgammafn_sign.js';

import { NumberW, Toms708 } from '@common/toms708/index.js';

const printer = debug('pnbeta_raw');
const printer_pnbeta2 = debug('pnbeta2');

/* change errmax and itrmax if desired;
   * original (AS 226, R84) had  (errmax; itrmax) = (1e-6; 100) */
const errmax = 1.0e-9;
const itrmax = 10000; /* 100 is not enough for pf(ncp=200)
                   see PR#11277 */

function pnbeta_raw(x: number, o_x: number, a: number, b: number, ncp: number): number {
    /* o_x  == 1 - x  but maybe more accurate */
    // double
    let errbd;

    const temp = new NumberW(0);
    const tmp_c = new NumberW(0);
    // int
    const ierr = new NumberW(0);

    // long double
    let ans;
    let ax;
    let gx;
    let q;
    let sumq;

    if (ncp < 0 || a <= 0 || b <= 0) {
        return ML_ERR_return_NAN(printer);
    }

    const c = ncp / 2;

    /* initialize the series */

    const x0 = Math.floor(Math.max(c - 7 * Math.sqrt(c), 0));
    const a0 = a + x0;
    const lbeta = lgammafn_sign(a0) + lgammafn_sign(b) - lgammafn_sign(a0 + b);
    /* temp = pbeta_raw(x, a0, b, TRUE, FALSE), but using (x, o_x): */
    Toms708.bratio(a0, b, x, o_x, temp, tmp_c, ierr);

    gx = Math.exp(a0 * Math.log(x) + b * (x < 0.5 ? Math.log1p(-x) : Math.log(o_x)) - lbeta - Math.log(a0));
    if (a0 > a) q = Math.exp(-c + x0 * Math.log(c) - lgammafn_sign(x0 + 1));
    else q = Math.exp(-c);

    sumq = 1 - q;
    ans = ax = q * temp.val;

    /* recurse over subsequent terms until convergence is achieved */
    let j = Math.floor(x0); // x0 could be billions, and is in package EnvStats
    do {
        j++;
        temp.val -= gx;
        gx *= (x * (a + b + j - 1)) / (a + j);
        q *= c / j;
        sumq -= q;
        ax = temp.val * q;
        ans += ax;
        errbd = (temp.val - gx) * sumq;
    } while (errbd > errmax && j < itrmax + x0);

    if (errbd > errmax) ML_ERROR(ME.ME_PRECISION, 'pnbeta', printer);
    if (j >= itrmax + x0) ML_ERROR(ME.ME_NOCONV, 'pnbeta', printer);

    return ans;
}



export function pnbeta2(
    x: number,
    o_x: number,
    a: number,
    b: number,
    ncp: number /* o_x  == 1 - x  but maybe more accurate */,
    lower_tail: boolean,
    log_p: boolean,
): number {
    let ans = pnbeta_raw(x, o_x, a, b, ncp);
    if (isNaN(ans)) return NaN;
    /* return R_DT_val(ans), but we want to warn about cancellation here */
    if (lower_tail) {
        return log_p ? Math.log(ans) : ans;
    } else {
        if (ans > 1 - 1e-10) ML_ERROR(ME.ME_PRECISION, 'pnbeta', printer_pnbeta2);
        if (ans > 1.0) ans = 1.0; /* Precaution */
        /* include standalone case */
        return log_p ? Math.log1p(-ans) : 1 - ans;
    }
}

export function pnbeta(x: number, a: number, b: number, ncp: number, lower_tail: boolean, log_p: boolean): number {
    if (isNaN(x) || isNaN(a) || isNaN(b) || isNaN(ncp)) return x + a + b + ncp;

    const rc = R_P_bounds_01(lower_tail, log_p, x, 0, 1);
    if (rc !== undefined) {
        return rc;
    }
    return pnbeta2(x, 1 - x, a, b, ncp, lower_tail, log_p);
}
