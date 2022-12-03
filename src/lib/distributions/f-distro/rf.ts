/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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

import { rchisqOne } from '../chi-2/rchisq';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { IRNGNormal } from '@rng/normal/normal-rng';

const printer = debug('rf');

export function rfOne(n1: number, n2: number, rng: IRNGNormal): number {
    if (isNaN(n1) || isNaN(n2) || n1 <= 0 || n2 <= 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    const v1 = isFinite(n1) ? rchisqOne(n1, rng) / n1 : 1;
    const v2 = isFinite(n2) ? rchisqOne(n2, rng) / n2 : 1;
    return v1 / v2;
}
