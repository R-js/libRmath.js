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
import { ML_ERR_return_NAN, R_Q_P01_check } from '@common/logger';
import { R_DT_0 } from '@lib/r-func';
import { R_DT_Clog } from './expm1';

const printer = debug('qexp');

export function qexp(p: number, scale: number, lower_tail: boolean, log_p: boolean): number {
    if (isNaN(p) || isNaN(scale)) return p + scale;

    if (scale < 0) return ML_ERR_return_NAN(printer);

    const rc = R_Q_P01_check(log_p, p);
    if (rc !== undefined) {
        return rc;
    }
    if (p === R_DT_0(lower_tail, log_p)) return 0;

    return -scale * R_DT_Clog(lower_tail, log_p, p);
}
