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

import { debug } from 'debug';
import { ML_ERR_return_NAN, R_D__0 } from '../common/_general';
import { dpois_raw } from '../poisson/dpois';

const { log } = Math;
const { isNaN: ISNAN } = Number;
const ML_POSINF = Infinity;

const printer = debug('dgamma');

export function dgamma(x: number, shape: number, scale: number, aslog = false): number {
    let pr: number;

    if (ISNAN(x) || ISNAN(shape) || ISNAN(scale)) return x + shape + scale;
    if (shape < 0 || scale <= 0) {
        return ML_ERR_return_NAN(printer);
    }
    if (x < 0) {
        return R_D__0(aslog);
    }
    if (shape === 0) {
        /* point mass at 0 */
        return x === 0 ? ML_POSINF : R_D__0(aslog);
    }
    if (x === 0) {
        if (shape < 1) return ML_POSINF;
        if (shape > 1) {
            return R_D__0(aslog);
        }
        /* else */
        return aslog ? -log(scale) : 1 / scale;
    }

    if (shape < 1) {
        pr = dpois_raw(shape, x / scale, aslog);
        return aslog ? pr + log(shape / x) : (pr * shape) / x;
    }
    /* else  shape >= 1 */
    pr = dpois_raw(shape - 1, x / scale, aslog);
    return aslog ? pr - log(scale) : pr / scale;
}
