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

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';

import { debug } from '@mangos/debug';
import { exp_rand } from './sexp';

import { globalUni } from '@rng/global-rng';


const printer = debug('rexp');

export function rexpOne(scale: number): number {
    const rng = globalUni();
    if (!Number.isFinite(scale) || scale <= 0.0) {
        if (scale === 0) return 0;
        /* else */
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    return scale * exp_rand(rng); // --> in ./sexp.c
}
