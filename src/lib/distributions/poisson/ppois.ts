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

import { ML_ERR_return_NAN2, lineInfo4, } from '@common/logger';
import { R_DT_0, R_DT_1, isFinite , floor } from '@lib/r-func';

import { debug } from '@mangos/debug';
import { pgamma } from '@dist/gamma/pgamma';

const printer = debug('ppois');

export function ppois(q: number,lambda: number, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(lambda)) return q + lambda;

    if (lambda < 0)
    {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (q < 0)
    { 
        return R_DT_0(lowerTail, logP);
    }
    if (lambda === 0)
    {
        return R_DT_1(lowerTail, logP);
    }
    if (!isFinite(q))
    {
        return R_DT_1(lowerTail, logP);
    }
    q = floor(q + 1e-7);

    return pgamma(lambda, q + 1, 1, !lowerTail, logP);
}

