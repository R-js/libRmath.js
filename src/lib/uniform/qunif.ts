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

import { ML_ERR_return_NAN, R_Q_P01_check } from '../common/_general';

import { debug } from 'debug';
import { R_DT_qIv } from '../exp/expm1';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('qunif');

export function qunif(p: number, min = 0, max = 1, lowerTail = true, logP = false): number {
    if (ISNAN(p) || ISNAN(min) || ISNAN(max)) return NaN;

    const rc = R_Q_P01_check(logP, p);
    if (rc !== undefined) {
        return rc;
    }
    if (!R_FINITE(min) || !R_FINITE(max)) return ML_ERR_return_NAN(printer);
    if (max < min) return ML_ERR_return_NAN(printer);
    if (max === min) return min;

    return min + R_DT_qIv(lowerTail, logP, p) * (max - min);
}
