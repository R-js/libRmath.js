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
import { log as logfn, R_D__0 } from '@lib/r-func';

const printer = debug('dunif');


export function dunif(x: number, min = 0, max = 1, log = false): number {
    if (isNaN(x) || isNaN(min) || isNaN(max)) {
        return x + min + max;
    }
    if (max <= min) 
    {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (min <= x && x <= max)
    {
        return log ? -logfn(max - min) : 1. / (max - min);
    }
    return R_D__0(log);
}
