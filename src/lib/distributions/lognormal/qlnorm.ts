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
import { R_Q_P01_boundaries } from '@common/logger';

import { qnorm } from '../normal/qnorm';

const { exp } = Math;
const { isNaN: ISNAN, POSITIVE_INFINITY: ML_POSINF } = Number;

export function qlnorm(p: number, meanlog = 0, sdlog = 1, lower_tail = true, log_p = false): number {
    if (ISNAN(p) || ISNAN(meanlog) || ISNAN(sdlog)) return p + meanlog + sdlog;

    R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);

    return exp(qnorm(p, meanlog, sdlog, lower_tail, log_p));
}
