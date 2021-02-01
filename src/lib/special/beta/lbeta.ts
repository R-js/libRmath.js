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

import { ML_ERR_return_NAN } from '@common/logger';

import { M_LN_SQRT_2PI } from '$constants';

import { gamma_internal } from '@special/gamma';
import { lgammafn_sign } from '@special/gamma/lgammafn_sign';
import { lgammacor } from '@special/gamma/lgammacor';

import type { NumArray } from '$constants';
import { validateBetaArgs } from './helpers';

const { log, log1p } = Math;

const { isNaN: ISNAN, isFinite: R_FINITE, POSITIVE_INFINITY: ML_POSINF, NEGATIVE_INFINITY: ML_NEGINF } = Number;

const printer = debug('lbeta');

export function lbeta_scalar(a: number, b: number): number {
    let corr: number;
    let p: number;
    let q: number;

    if (ISNAN(a) || ISNAN(b)) return a + b;
    p = q = a;
    if (b < p) p = b; // := min(a,b)
    if (b > q) q = b; // := max(a,b)

    // both arguments must be >= 0
    if (p < 0) return ML_ERR_return_NAN(printer);
    else if (p === 0) {
        return ML_POSINF;
    } else if (!R_FINITE(q)) {
        // q == +Inf
        return ML_NEGINF;
    }

    if (p >= 10) {
        // p and q are big.
        corr = lgammacor(p) + lgammacor(q) - lgammacor(p + q);
        return log(q) * -0.5 + M_LN_SQRT_2PI + corr + (p - 0.5) * log(p / (p + q)) + q * log1p(-p / (p + q));
    } else if (q >= 10) {
        // p is small, but q is big.
        corr = lgammacor(q) - lgammacor(p + q);
        return lgammafn_sign(p) + corr + p - p * log(p + q) + (q - 0.5) * log1p(-p / (p + q));
    } else {
        // p and q are small: p <= q < 10.
        // R change for very small args
        // removed 
        if (p < 1e-306) return lgammafn_sign(p) + (lgammafn_sign(q) - lgammafn_sign(p+q))
        else return log(gamma_internal(p) * (gamma_internal(q) / gamma_internal(p + q)));
    }
}

export function lbeta(a: NumArray, b?: NumArray): Float64Array|Float32Array {
    // check "a" (must always be there)
    const { rc, onlyA } = validateBetaArgs('lbeta(a,b)', a, b);
    if (rc.length === 0) {
        return rc;
    }
    for (let i = 0, j = 0; i < a.length; i += onlyA ? 2 : 1, j += 1) {
        rc[j] = lbeta_scalar(a[i], onlyA ? a[i + 1] : (b as NumArray)[i]);
    }
    return rc;
}
