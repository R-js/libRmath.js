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
//3rd party
import { debug } from 'debug';

//tooling
import { ME, ML_ERROR } from '@common/logger';
import { isArray, isEmptyArray, emptyFloat64Array } from '$constants';

import { cospi } from '@trig/cospi';
import { sinpi } from '@trig/sinpi';
import { bessel_y_scalar } from '../besselY';
import { J_bessel } from './Jbessel';
import type { NumArray } from '$constants';


const { isNaN: ISNAN } = Number;
const { floor, trunc } = Math;

const printer = debug('bessel_j');

 function bessel_j_scalar(x: number, alpha: number): number {
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
    if (x < 0) {
        ML_ERROR(ME.ME_RANGE, 'bessel_j_scalar', printer);
        return NaN;
    }
    // double
    const na = floor(alpha);
    if (alpha < 0) {
        /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
        return (
            (alpha - na === 0.5 ? 0 : bessel_j_scalar(x, -alpha) * cospi(alpha)) +
            (alpha === na ? 0 : bessel_y_scalar(x, -alpha) * sinpi(alpha))
        );
    } else if (alpha > 1e7) {
        printer('besselJ(x, nu): nu=%d too large for bessel_j() algorithm', alpha);
        return NaN;
    }
    //int
    const nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
    alpha -= nb - 1; // ==> alpha' in [0, 1)
    const rc = J_bessel(x, alpha, nb);

    if (rc.ncalc !== nb) {
        /* error input */
        if (rc.ncalc < 0){
            printer('bessel_j(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?', x, rc.ncalc, rc.nb, alpha);
        }
        else {
            printer('bessel_j(%d,nu=%d): precision lost in result', x, alpha + nb - 1);
        }
    }
    return rc.x; // bj[nb - 1];
}

export default function besselJn(x: NumArray, nu: number): Float32Array | Float64Array  {
    // in case no ts is used
    if (typeof nu !== 'number'){
        throw new TypeError(`argument "nu" is missing/not a number, Execution halted`);
    }
    if (typeof x === 'number') {
        x = new Float64Array([x]);
    }
    if (isEmptyArray(x)) {
        return emptyFloat64Array;
    }
    if (!isArray(x)) {
        throw new TypeError(`argument not of number, number[], Float64Array, Float32Array`);
    }
    const rc =
        x instanceof Float64Array
            ? new Float64Array(x.length)
            : x instanceof Float32Array
            ? new Float32Array(x.length)
            : new Float64Array(x);

    for (let i = 0; i < x.length; i++) {
        rc[i]= bessel_j_scalar(x[i], nu);
    }
    return rc;
}

export { bessel_j_scalar, besselJn };