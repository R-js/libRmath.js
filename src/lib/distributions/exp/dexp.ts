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

import { ML_ERR_return_NAN } from '@common/logger';
import { R_D__0 } from 'lib/common/constants';
import debug from 'debug';

const printer = debug('dexp');

export function dexp(x: number, scale: number, give_log: boolean): number {
    /* NaNs propagated correctly */
    if (Number.isNaN(x) || Number.isNaN(scale)) {
        return NaN;
    }

    if (scale <= 0.0) {
        return ML_ERR_return_NAN(printer);
    }

    if (x < 0) {
        return R_D__0(give_log);
    }
    return give_log ? -x / scale - Math.log(scale) : Math.exp(-x / scale) / scale;
}
