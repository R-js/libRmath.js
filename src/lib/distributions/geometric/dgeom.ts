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
import { dbinom_raw } from '@dist/binomial/dbinom';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';

import { R_D__0, R_D_nonint_check, log as _log, round } from '@lib/r-func';

const printer = debug('dgeom');

export function dgeom(x: number, p: number, log = false): number {

    if (isNaN(x) || isNaN(p)) return x + p;

    if (p <= 0 || p > 1) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    const rc = R_D_nonint_check(log, x, printer);
    if (rc !== undefined) {
        return rc;
    }
    if (x < 0 || !isFinite(x) || p === 0) {
        return R_D__0(log);
    }
    x = round(x);

    /* prob = (1-p)^x, stable for small p */
    const prob = dbinom_raw(0, x, p, 1 - p, log);

    return log ? _log(p) + prob : p * prob;
}
