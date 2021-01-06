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

import { imin2, ML_ERR_return_NAN, R_D__0, R_D_exp, R_DT_0, R_DT_1, R_DT_val, R_Q_P01_check } from '../common/_general';

import { R_DT_qIv } from '../exp/expm1';

import { IRNG } from '../rng';

import { randomGenHelper } from '../r-func';

const { isFinite: R_FINITE, EPSILON: DBL_EPSILON, isNaN: ISNAN } = Number;
const { LN2: M_LN2, abs: fabs, trunc, log, exp, floor, round } = Math;

const printer_dsignrank = debug('dsignrank');
const printer_psignrank = debug('psignrank');
const printer_qsignrank = debug('qsignrank');
const printer_rsignrank = debug('rsignrank');

export function csignrank(k: number, n: number, u: number, c: number, w: number[]): number {
    if (k < 0 || k > u) return 0;
    if (k > c) k = u - k;

    if (n === 1) return 1;
    if (w[0] === 1) return w[k];
    w[0] = w[1] = 1;
    for (let j = 2; j < n + 1; ++j) {
        let i;
        const end = imin2((j * (j + 1)) / 2, c);
        for (i = end; i >= j; --i) w[i] += w[i - j];
    }
    return w[k];
}

export function dsignrank(x: number, n: number, logX = false): number {
    const rn = round(n);
    const u = (rn * (rn + 1)) / 2;
    const c = trunc(u / 2);
    const w = Array.from<number>({ length: c + 1 }).fill(0);

    if (ISNAN(x) || ISNAN(n)) return x + n;

    if (n <= 0) {
        return ML_ERR_return_NAN(printer_dsignrank);
    }
    if (fabs(x - round(x)) > 1e-7) {
        return R_D__0(logX);
    }
    x = round(x);
    if (x < 0 || x > (n * (n + 1)) / 2) {
        return R_D__0(logX);
    }
    const d = R_D_exp(logX, log(csignrank(trunc(x), n, u, c, w)) - n * M_LN2);
    return d;
}

export function psignrank(x: number, n: number, lowerTail = true, logP = false): number {
    const roundN = round(n);
    const u = (roundN * (roundN + 1)) / 2;
    const c = trunc(u / 2);
    const w = Array.from<number>({ length: c + 1 }).fill(0);

    (x) => round(x + 1e-7);
    if (ISNAN(x) || ISNAN(n)) return x + n;
    if (!R_FINITE(n)) return ML_ERR_return_NAN(printer_psignrank);
    if (n <= 0) return ML_ERR_return_NAN(printer_psignrank);

    if (x < 0.0) {
        return R_DT_0(lowerTail, logP);
    }

    if (x >= u) {
        return R_DT_1(lowerTail, logP); //returns 1 on the edge case or 0 (because log(1)= 0)
    }
    const f = exp(-roundN * M_LN2);
    let p = 0;
    if (x <= u / 2) {
        //smaller then mean
        for (let i = 0; i <= x; i++) {
            p += csignrank(i, roundN, u, c, w) * f;
        }
    } else {
        x = (n * (n + 1)) / 2 - x;
        for (let i = 0; i < x; i++) {
            p += csignrank(i, roundN, u, c, w) * f;
        }
        lowerTail = !lowerTail; /* p = 1 - p; */
    }
    return R_DT_val(lowerTail, logP, p);
} /* psignrank() */

export function qsignrank(x: number, n: number, lowerTail = true, logP = false): number {
    const roundN = round(n);
    const u = (roundN * (roundN + 1)) / 2;
    const c = trunc(u / 2);
    const w = Array.from<number>({ length: c + 1 }).fill(0);

    if (ISNAN(x) || ISNAN(n)) {
        return x + n;
    }

    if (!R_FINITE(x) || !R_FINITE(n)) {
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

    if (logP || !lowerTail) x = R_DT_qIv(lowerTail, logP, x); // lower_tail, non-log "p"

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

export function rsignrankOne(n: number, rng: IRNG): number {
    /* NaNs propagated correctly */
    if (ISNAN(n)) return n;
    const nRound = round(n);
    if (nRound < 0) return ML_ERR_return_NAN(printer_rsignrank);

    if (nRound === 0) return 0;
    let r = 0.0;
    const k = floor(nRound);
    for (let i = 0; i < k /**/; ) {
        r += ++i * floor(rng.internal_unif_rand() + 0.5);
    }
    return r;
}
export function rsignrank(N: number, n: number, rng: IRNG): number[] {
    return randomGenHelper(N, rsignrankOne, n, rng);
}
