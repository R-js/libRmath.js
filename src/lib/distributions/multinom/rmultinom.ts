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

import { rbinomOne } from '@dist/binomial/rbinom';
import { globalUni } from '@rng/global-rng';
import { emptyFloat64Array, sumfp64 } from '@lib/r-func';


export function rmultinom(n: number, size: number, prob: Float64Array, rng = globalUni()): Float64Array | never {
    // returns matrix n x prob
    if (n < 0) {
        throw new Error('invalid first argument "n"');
    }
    if (size < 0) {
        throw new Error('invalid second argument "size"');
    }
    if (prob.length === 0) {
        throw new Error('no positive probabilities');
    }
    if (prob.every(_p => _p >= 0) === false
    ) {
        throw new Error('negative probability');
    }

    const s = sumfp64(prob);
    if (s === 0) {
        throw new Error('no positive probabilities');
    }

    if (n === 0) {
        return emptyFloat64Array;
    }
    if (size === 0) {
        // fill it out with all zeros
        const rc = new Float64Array(n);
        rc.fill(0);
        return rc;
    }
    // allocate matrix
    const rc = new Float64Array(n * prob.length);
    let K = size;
    let pTotal = s;
    for (let i = 0; i < n*prob.length; i++) {
        const i2 = i % prob.length;
        if (i2 === 0) {
            K = size;
            pTotal = s;
        }
        if (prob[i2] === 0) {
            continue;
        }
        if (prob[i2] === pTotal){
            rc[i] = K;
        }
        else {
            const pp = prob[i2] / pTotal;
            rc[i] = rbinomOne(K, pp, rng);
        }
        // adjust, because it is sampling without replacement
        K -= rc[i];
        pTotal -= prob[i2];
    }
    return rc;
}
