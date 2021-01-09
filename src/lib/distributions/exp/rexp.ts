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

import { ML_ERR_return_NAN } from '../common/_general';

import { debug } from 'debug';
import { randomGenHelper } from '../r-func';
import { IRNG } from '../rng/irng';
import { exp_rand } from './sexp';

const { isFinite: R_FINITE } = Number;
const printer = debug('rexp');

export function rexp(n: number | number[], scale: number, rng: IRNG): number[] {
    return randomGenHelper(n, rexpOne, scale, rng);
}

export function rexpOne(scale = 1, rng: IRNG): number | number[] {
    if (!R_FINITE(scale) || scale <= 0.0) {
        if (scale === 0) return 0;
        /* else */
        return ML_ERR_return_NAN(printer);
    }
    return scale * exp_rand(rng.internal_unif_rand); // --> in ./sexp.c
}
