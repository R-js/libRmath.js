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

import debug from 'debug';
import { ML_ERR_return_NAN } from '@common/logger';
import type { IRNG } from '@rng/irng';
import { globalUni } from '@lib/rng/global-rng';
import { emptyFloat32Array, nanFloat32Array } from 'lib/common/constants';

const printer = debug('runif');

export function runif(n: number, min = 0, max = 1, u: IRNG = globalUni()): Float32Array {
    // do the check once
    if (n === 0){
        return emptyFloat32Array;
    }
    if (!(isFinite(min) && isFinite(max) && max > min)) {
        ML_ERR_return_NAN(printer);
        return nanFloat32Array
    }
    const rc = new Float32Array(n);
    for (let i = 0; i < n; i++){
        const s = u.random();
        rc[i] = (max - min) * s + min;
    }
    return rc;
}

export function runifOne(min = 0, max = 1, u: IRNG = globalUni()): number {
    if (!(isFinite(min) && isFinite(max) && max > min)) {
        return ML_ERR_return_NAN(printer);
    }
    const s = u.random();
    return (max - min) * s + min;
}
