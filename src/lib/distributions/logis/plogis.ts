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
import { ML_ERR_return_NAN } from '@common/logger';
import { R_P_bounds_Inf_01 } from '$constants';

export function Rf_log1pexp(x: number): number {
    if (x <= 18) return Math.log1p(Math.exp(x));
    if (x > 33.3) return x;
    // else: 18.0 < x <= 33.3 :
    return x + Math.exp(-x);
}

const printer_plogis = debug('plogis');

export function plogis(x: number, location = 0, scale = 1, lower_tail = true, log_p = false): number {
    if (isNaN(x) || isNaN(location) || isNaN(scale)) return NaN;

    if (scale <= 0.0) {
        return ML_ERR_return_NAN(printer_plogis);
    }

    x = (x - location) / scale;
    if (isNaN(x)) {
        return ML_ERR_return_NAN(printer_plogis);
    }
    const rc = R_P_bounds_Inf_01(lower_tail, log_p, x);
    if (rc !== undefined) {
        return rc;
    }

    if (log_p) {
        // log(1 / (1 + exp( +- x ))) = -log(1 + exp( +- x))
        return -Rf_log1pexp(lower_tail ? -x : x);
    }
    return 1 / (1 + Math.exp(lower_tail ? -x : x));
}
