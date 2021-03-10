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

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '@common/logger';

import { R_Log1_Exp } from '@dist/exp/expm1';

const printer_qlogis = debug('qlogis');

export function qlogis(p: number, location = 0, scale = 1, lower_tail = true, log_p = false): number {
    if (isNaN(p) || isNaN(location) || isNaN(scale)) return p + location + scale;

    const rc = R_Q_P01_boundaries(lower_tail, log_p, p, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    if (rc !== undefined) {
        return rc;
    }

    if (scale < 0) {
        return ML_ERR_return_NAN(printer_qlogis);
    }
    if (scale === 0) return location;

    /* p := logit(p) = log( p / (1-p) )	 : */
    if (log_p) {
        if (lower_tail) p = p - R_Log1_Exp(p);
        else p = R_Log1_Exp(p) - p;
    } else p = Math.log(lower_tail ? p / (1 - p) : (1 - p) / p);

    return location + scale * p;
}
