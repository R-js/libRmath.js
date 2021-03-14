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
import { ML_ERR_return_NAN } from '@common/logger'
import { R_D__0, R_D_exp } from '$constants';
import { dpois_raw } from '@dist/poisson/dpois';
import { dbeta_scalar } from './dbeta';

const printer = debug('dnbeta');


const eps = 1e-15;

//also used by f-distriution
export function dnbeta_scalar(x: number, a: number, b: number, ncp: number, give_log: boolean): number {

    //int
    let kMax;
    //double
    let k;
    let D;
    let term;
    //long double
    let sum;
    let p_k;
    let q;

    if (isNaN(x) || isNaN(a) || isNaN(b) || isNaN(ncp)) return x + a + b + ncp;
    if (ncp < 0 || a <= 0 || b <= 0) {
        return ML_ERR_return_NAN(printer);
    }

    if (!isFinite(a) || !isFinite(b) || !isFinite(ncp)) {
        return ML_ERR_return_NAN(printer);
    }

    if (x < 0 || x > 1) {
        return R_D__0(give_log);
    }
    if (ncp === 0) {
        return dbeta_scalar(x, a, b, give_log) as number;
    }
    /* New algorithm, starting with *largest* term : */
    const ncp2 = 0.5 * ncp;
    const dx2 = ncp2 * x;
    const d = (dx2 - a - 1) / 2;
    D = d * d + dx2 * (a + b) - a;
    if (D <= 0) {
        kMax = 0;
    } else {
        D = Math.ceil(d + Math.sqrt(D));
        kMax = D > 0 ? D : 0;
    }

    /* The starting "middle term" --- first look at it's log scale: */
    term = dbeta_scalar(x, a + kMax, b, /* log = */ true);
    p_k = dpois_raw(kMax, ncp2, true);
    if (x === 0 || !isFinite(term) || !isFinite(p_k)) {
        /* if term = +Inf */
        return R_D_exp(give_log, p_k + term);
    }

    /* Now if s_k := p_k * t_k  {here = exp(p_k + term)} would underflow,
     * we should rather scale everything and re-scale at the end:*/

    p_k += term; /* = log(p_k) + log(t_k) == log(s_k) -- used at end to rescale */
    /* mid = 1 = the rescaled value, instead of  mid = exp(p_k); */

    /* Now sum from the inside out */
    sum = term = 1 /* = mid term */;
    /* middle to the left */
    k = kMax;
    while (k > 0 && term > sum * eps) {
        k--;
        q = /* 1 / r_k = */ ((k + 1) * (k + a)) / (k + a + b) / dx2;
        term *= q;
        sum += term;
    }
    /* middle to the right */
    term = 1;
    k = kMax;
    do {
        q = /* r_{old k} = */ (dx2 * (k + a + b)) / (k + a) / (k + 1);
        k++;
        term *= q;
        sum += term;
    } while (term > sum * eps);

    return R_D_exp(give_log, p_k + Math.log(sum));
}
