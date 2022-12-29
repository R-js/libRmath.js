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
import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import {  R_D_exp, R_DT_0, pow, expm1 } from '@lib/r-func'; 
import { R_Log1_Exp } from '@dist/exp/expm1';

const printer = debug('pweibull');

export function pweibull(q: number, shape: number, scale = 1, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(shape) || isNaN(scale)) 
    {
        return q + shape + scale;
    }

    if (shape <= 0 || scale <= 0)
    {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (q <= 0)
    {
        return R_DT_0(lowerTail, logP);
    }
    q = -pow(q / scale, shape);
    return lowerTail ? 
     (logP ? R_Log1_Exp(q) : -expm1(q)) 
     : R_D_exp(logP, q);
}
