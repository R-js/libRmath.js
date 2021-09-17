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

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '@common/logger';

import { R_DT_Clog } from '@dist/exp/expm1';

const printer = debug('qweibull');

export function qweibull(p: number, shape: number, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(shape) || isNaN(scale)) return p + shape + scale;

    if (shape <= 0 || scale <= 0) return ML_ERR_return_NAN(printer);

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    return scale * Math.pow(-R_DT_Clog(lowerTail, logP, p), 1 / shape);
}
