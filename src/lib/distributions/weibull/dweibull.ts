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
import { R_D__0, pow, log as _log, exp } from '@lib/r-func';
const printer = debug('dweibull');

export function dweibull(x: number, shape: number, scale = 1, log = false): number {
    if (isNaN(x) || isNaN(shape) || isNaN(scale))
    {
        return x + shape + scale;
    }
    if (shape <= 0 || scale <= 0)
    {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (x < 0)
    {
        return R_D__0(log);
    }
    if (!isFinite(x))
    {
        return R_D__0(log);
    }
    /* need to handle x == 0 separately */
    if (x === 0 && shape < 1)
    {
        return Infinity;
    }
    const tmp1 = pow(x / scale, shape - 1);
    const tmp2 = tmp1 * (x / scale);
    /* These are incorrect if tmp1 == 0 */
    return log ?
         -tmp2 + _log(shape * tmp1 / scale) :
         shape * tmp1 * exp(-tmp2) / scale;
}
