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

import { ML_ERR_return_NAN } from '@common/logger';
import {  R_D_exp, R_DT_0 } from '$constants'; 
import { R_Log1_Exp } from '@dist/exp/expm1';

const printer = debug('pweibull');

export function pweibull(x: number, shape: number, scale = 1, lower_tail = true, log_p = false): number {
    if (isNaN(x) || isNaN(shape) || isNaN(scale)) return x + shape + scale;

    if (shape <= 0 || scale <= 0) return ML_ERR_return_NAN(printer);

    if (x <= 0) {
        return R_DT_0(lower_tail, log_p);
    }
    x = -Math.pow(x / scale, shape);
    return lower_tail ? (log_p ? R_Log1_Exp(x) : -Math.expm1(x)) : R_D_exp(log_p, x);
}
