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
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { M_1_SQRT_2PI, M_LN_SQRT_2PI, R_D__0, log as _log } from '@lib/r-func';
const printer = debug('dlnorm');

export function dlnorm(x: number, meanlog = 0, sdlog = 1, log = false): number {
    if (isNaN(x) || isNaN(meanlog) || isNaN(sdlog)) {
        return x + meanlog + sdlog; // preserve NaN metatdata bits
    }
    if (sdlog <= 0) {
        if (sdlog < 0) {
            return ML_ERR_return_NAN2(printer, lineInfo4);
        }
        // sdlog == 0 :
        return Math.log(x) === meanlog ? Infinity : R_D__0(log);
    }
    if (x <= 0) {
        return R_D__0(log);
    }
    // Z- transform
    const y = (_log(x) - meanlog) / sdlog;
    return log
        ? -(M_LN_SQRT_2PI + 0.5 * y * y + _log(x * sdlog))
        : (M_1_SQRT_2PI * Math.exp(-0.5 * y * y)) / (x * sdlog);
    // M_1_SQRT_2PI = 1 / sqrt( 2*pi )
    // M_LN_SQRT_2PI = log( sqrt( 2*pi ) )
}
