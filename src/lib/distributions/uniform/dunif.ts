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
import { ML_ERR_return_NAN } from '@common/logger.js';
import { log, R_D__0 } from '@lib/r-func.js';

const printer = debug('dunif');


export function dunif(x: number, a = 0, b = 1, give_log = false): number {
    if (isNaN(x) || isNaN(a) || isNaN(b)) {
        return x + a + b;
    }
    if (b <= a) 
    {
        return ML_ERR_return_NAN(printer);
    }

    if (a <= x && x <= b)
    {
        return give_log ? -log(b - a) : 1. / (b - a);
    }
    return R_D__0(give_log);
}
