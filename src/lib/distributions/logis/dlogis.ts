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
import debug from 'debug';
import { ML_ERR_return_NAN } from '@common/logger';
const printer_dlogis = debug('dlogis');

export function dlogis(x: number, location = 0, scale = 1, give_log = false): number {
    if (isNaN(x) || isNaN(location) || isNaN(scale)) return NaN;
    if (scale <= 0.0) {
        return ML_ERR_return_NAN(printer_dlogis);
    }

    x = Math.abs((x - location) / scale);
    const e = Math.exp(-x);
    const f = 1.0 + e;
    return give_log ? -(x + Math.log(scale * f * f)) : e / (scale * f * f);
}
