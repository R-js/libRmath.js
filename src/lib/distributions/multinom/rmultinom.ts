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

import { rbinomOne } from '@dist/binomial/rbinom';
import { IRNG } from '@rng/irng';
import { globalUni } from '@lib/rng/global-rng';
import { emptyFloat32Array } from '@lib/r-func';
import { checks } from './helper';

const printer_rmultinom = debug('rmultinom');


export function rmultinom(n: number, size: number, prob: Float32Array, rng = globalUni()): Float32Array {
    // returns matrix n x prob
    const sum = checks(prob, size, n, printer_rmultinom);
    if (!sum) {
        return emptyFloat32Array;
    }
    const data = new Float32Array(n * prob.length);
    for (let i = 0; i < n; i++) {
        const offset = i * prob.length;
        rmultinomOne(data, offset, size, prob, sum, rng);
    }
    return data;
}

//workhorse
export function rmultinomOne(
    data: Float32Array,
    offset: number,
    size: number,
    prob: Float32Array,
    sum: number,
    rng: IRNG
): void {
    /* `Return' vector  rN[1:K] {K := length(prob)}
     *  where rN[j] ~ Bin(n, prob[j]) ,  sum_j rN[j] == n,  sum_j prob[j] == 1,
     */
    const K = prob.length;
    /* Generate the first K-1 obs. via binomials */
    // context vars for the next loop
    let _size = size;
    let p_tot = sum;
    printer_rmultinom('%o', { prob, p_tot, _size, K });
    for (let k = 0; k < K - 1; k++) {
        //can happen, protect against devide by zero
        if (Math.abs(p_tot) < Number.EPSILON) {
            data[offset + k] = _size;
            _size = 0;
            p_tot = 0;
            continue;
        }
        const pp = prob[k] / p_tot;

        if (pp === 0) {
            data[offset + k] = 0;
            continue;
        }
        // nothing left, rest will be zero
        if (_size === 0) {
            data[offset + k] = 0;
            continue;
        }
        if (pp === 1) {
            data[offset + k] = _size;
        }
        else {
            data[offset + k] = rbinomOne(_size, pp, rng);
        }
        _size -= data[offset + k];
        //adjust probabilities
        p_tot -= prob[k];
        printer_rmultinom('%o', { p_tot, _size, k });
    }
    data[offset + K - 1] = _size; //left over
}
