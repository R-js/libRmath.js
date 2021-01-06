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
import { dbinom_raw } from '../binomial/dbinom';
import { ML_ERR_return_NAN, R_D__0, R_D_nonint_check } from '../common/_general';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const { round: R_forceint, log } = Math;

const printer = debug('dgeom');

export function dgeom(x: number, p: number, giveLog = false): number {
    let prob: number;

    if (ISNAN(x) || ISNAN(p)) return x + p;

    if (p <= 0 || p > 1) {
        return ML_ERR_return_NAN(printer);
    }

    const rc = R_D_nonint_check(giveLog, x, printer);
    if (rc !== undefined) {
        return rc;
    }
    if (x < 0 || !R_FINITE(x) || p === 0) {
        return R_D__0(giveLog);
    }
    x = R_forceint(x);

    /* prob = (1-p)^x, stable for small p */
    prob = dbinom_raw(0, x, p, 1 - p, giveLog);

    return giveLog ? log(p) + prob : p * prob;
}
