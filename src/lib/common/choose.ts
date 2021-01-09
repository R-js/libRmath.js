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
import { debug } from 'debug';
import { isOdd } from '../common/_general';

const { abs: fabs, log, exp, round } = Math;
const { isInteger, NEGATIVE_INFINITY: ML_NEGINF, isNaN: ISNAN } = Number;

import { lbeta as internal_lbeta } from '../beta/lbeta';
import { lgammafn_sign as lgammafn } from '../distributions/gamma/lgammafn_sign';
import { lgammafn_sign } from '../distributions/gamma/lgammafn_sign';

// used by "qhyper"
export function lfastchoose(n: number, k: number) {
    return -log(n + 1) - internal_lbeta(n - k + 1, k + 1);
}
/* mathematically the same:
   less stable typically, but useful if n-k+1 < 0 : */

export function lfastchoose2(n: number, k: number, sChoose?: number[]) {
    let r: number;
    r = lgammafn_sign(n - k + 1, sChoose);
    return lgammafn(n + 1) - lgammafn(k + 1) - r;
}

const printer_lchoose = debug('lchoose');

export function internal_lchoose(n: number, k: number): number {
    const k0 = k;
    k = Math.round(k);
    /* NaNs propagated correctly */
    if (ISNAN(n) || ISNAN(k)) return n + k;
    if (fabs(k - k0) > 1e-7) printer_lchoose('"k" (%d) must be integer, rounded to %d', k0, k);
    if (k < 2) {
        if (k < 0) return ML_NEGINF;
        if (k === 0) return 0;
        /* else: k == 1 */
        return log(fabs(n));
    }
    /* else: k >= 2 */
    if (n < 0) {
        return internal_lchoose(-n + k - 1, k);
    } else if (isInteger(n)) {
        n = round(n);
        if (n < k) return ML_NEGINF;
        /* k <= n :*/
        if (n - k < 2) return internal_lchoose(n, n - k); /* <- Symmetry */
        /* else: n >= k+2 */
        return lfastchoose(n, k);
    }
    /* else non-integer n >= 0 : */
    if (n < k - 1) {
        return lfastchoose2(n, k);
    }
    return lfastchoose(n, k);
}

const k_small_max = 30;

/* 30 is somewhat arbitrary: it is on the *safe* side:
 * both speed and precision are clearly improved for k < 30.
 */
const printer_choose = debug('choose');

export function internal_choose(n: number, k: number): number {
    let r: number;
    const k0 = k;
    k = round(k);
    /* NaNs propagated correctly */
    if (ISNAN(n) || ISNAN(k)) return n + k;
    if (fabs(k - k0) > 1e-7) printer_choose('k (%d) must be integer, rounded to %d', k0, k);
    if (k < k_small_max) {
        let j: number;
        if (n - k < k && n >= 0 && isInteger(n)) k = n - k; /* <- Symmetry */
        if (k < 0) return 0;
        if (k === 0) return 1;
        /* else: k >= 1 */
        r = n;
        for (j = 2; j <= k; j++) r *= (n - j + 1) / j;
        return isInteger(n) ? round(r) : r;
        /* might have got rounding errors */
    }
    /* else: k >= k_small_max */
    if (n < 0) {
        r = internal_choose(-n + k - 1, k);
        if (isOdd(k)) r = -r;
        return r;
    } else if (isInteger(n)) {
        n = round(n);
        if (n < k) return 0;
        if (n - k < k_small_max) return internal_choose(n, n - k); /* <- Symmetry */
        return round(exp(lfastchoose(n, k)));
    }
    /* else non-integer n >= 0 : */
    if (n < k - 1) {
        const schoose: number[] = [0];
        r = lfastchoose2(n, k, /* -> */ schoose);
        return schoose[0] * exp(r);
    }
    return exp(lfastchoose(n, k));
}
