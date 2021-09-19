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
import { lgammafn_sign } from '@special/gamma/lgammafn_sign';
import { sumfp } from '@lib/r-func';
import { checks } from './helper';

const printer_dmultinom = debug('dmultinom');

export function dmultinom(x: Float32Array, prob: Float32Array, asLog = false): number {
    const N = sumfp(x);
    const sum = checks(prob,N,1, printer_dmultinom);
    if (!sum){
        // all x is zero?
        if (x.every(v=>v===0)){
            return asLog ? 0 : 1;
        }
        return NaN;
    }
    // must be integers
    let xerr = 0;
    let rc= lgammafn_sign(N+1);
    for (let i = 0; i < x.length && xerr < 10; i++){
        if (x[i] < 0){
            printer_dmultinom('x is negative at index %i', i);
            xerr++;
        }
        if (!isFinite(x[i])){
            printer_dmultinom('x is negative at index %i', i);
            xerr++;
        }
        x[i] = Math.round(x[i]);
    }

    // loop over all probs
    for (let i = 0; i< prob.length; i++){
        const p = prob[i]/sum;
        if (p === 0){
            if (x[i] !== 0){
                return asLog ? -Infinity: 0;
            }
            continue; //skip
        }
        // R code snippet   r <- lgamma(size + 1) + sum(x * log(prob) - lgamma(x + 1))
        rc +=  x[i]*Math.log(p) - lgammafn_sign(x[i] + 1);
    }

    return asLog ? rc : Math.exp(rc);

}
