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
import { globalNorm } from '@rng/global-rng';

const printer = debug('rnorm');

export function rnormOne(mean = 0, sd = 1): number {
    const rng = globalNorm()
    if (isNaN(mean) || !isFinite(sd) || sd < 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (sd === 0 || !isFinite(mean)) {
        return mean; /* includes mean = +/- Inf with finite sd */
    }
    return mean + sd * rng.random();
}
