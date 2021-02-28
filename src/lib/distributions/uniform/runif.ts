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
import { ML_ERR_return_NAN } from '../../common/_general';
import { randomGenHelper } from '../../r-func';
import { IRNG } from '../../rng';

const { isFinite: R_FINITE } = Number;
const printer = debug('runif');

export function runif(n: number | number[], min = 0, max = 1, u: IRNG) {
    return randomGenHelper(n, runifOne, min, max, u);
}

export function runifOne(n = 1, min = 0, max = 1, u: IRNG): number {
    if (!(R_FINITE(min) && R_FINITE(max) && max > min)) {
        return ML_ERR_return_NAN(printer);
    }
    const s = u.random();
    return (max - min) * s + min;
}
