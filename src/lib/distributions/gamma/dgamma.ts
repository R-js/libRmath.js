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
import { ML_ERR_return_NAN2, lineInfo4  } from '@common/logger';
import { dpois_raw } from '@dist/poisson/dpois';
import { R_D__0 } from '@lib/r-func';

const printer = debug('dgamma');

export function dgamma(x: number, shape: number, scale: number, aslog: boolean): number {
    let pr: number;

    if (isNaN(x) || isNaN(shape) || isNaN(scale)) return x + shape + scale;
    if (shape < 0 || scale <= 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }
    if (x < 0) {
        return R_D__0(aslog);
    }
    if (shape === 0) {
        /* point mass at 0 */
        return x === 0 ? Infinity : R_D__0(aslog);
    }
    if (x === 0) {
        if (shape < 1) return Infinity;
        if (shape > 1) {
            return R_D__0(aslog);
        }
        /* else */
        return aslog ? -Math.log(scale) : 1 / scale;
    }

    if (shape < 1) {
        pr = dpois_raw(shape, x / scale, aslog);
        return aslog ? pr + Math.log(shape / x) : (pr * shape) / x;
    }
    /* else  shape >= 1 */
    pr = dpois_raw(shape - 1, x / scale, aslog);
    console.log(pr, aslog);
    return aslog ? pr - Math.log(scale) : pr / scale;
}
