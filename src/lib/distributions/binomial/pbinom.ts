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

import { pbeta } from '../beta/pbeta.js';
import { ML_ERR_return_NAN,  } from '@common/logger.js';
import { R_DT_0, R_DT_1, R_nonint } from '@lib/r-func.js';

const printer = debug('pbinom');

export function pbinom(x: number, n: number, p: number, lowerTail = true, logP = false): number {
    if (isNaN(x) || isNaN(n) || isNaN(p)) return NaN;
    if (!isFinite(n) || !isFinite(p)) {
        return ML_ERR_return_NAN(printer);
    }

    const lower_tail = lowerTail;
    const log_p = logP;

    if (R_nonint(n)) {
        printer('non-integer n = %d', n);
        return ML_ERR_return_NAN(printer);
    }
    n = Math.round(n);
    /* 
     PR#8560: n=0 is a valid value 
  */
    if (n < 0 || p < 0 || p > 1) return ML_ERR_return_NAN(printer);

    if (x < 0) return R_DT_0(lower_tail, log_p);
    x = Math.floor(x + 1e-7);
    if (n <= x) return R_DT_1(lower_tail, log_p);
    printer('calling pbeta:(q=%d,a=%d,b=%d, l.t=%s, log=%s', p, x + 1, n - x, !lower_tail, log_p);
    return pbeta(p, x + 1, n - x, !lower_tail, log_p);
}
