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
import { R_DT_0 } from 'lib/common/constants';
import { pnorm5 as pnorm } from '@dist/normal/pnorm';

const { isNaN: ISNAN } = Number;
const { log } = Math;

const printer = debug('plnorm');

export function plnorm(x: number, meanlog = 0, sdlog = 1, lower_tail = true, log_p = false): number {
    if (ISNAN(x) || ISNAN(meanlog) || ISNAN(sdlog)) return x + meanlog + sdlog;

    if (sdlog < 0) return ML_ERR_return_NAN(printer);

    if (x > 0) return pnorm(log(x), meanlog, sdlog, lower_tail, log_p);
    return R_DT_0(lower_tail, log_p);
}
