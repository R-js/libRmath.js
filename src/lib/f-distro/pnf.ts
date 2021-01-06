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
import { ML_ERR_return_NAN, R_P_bounds_01 } from '../common/_general';

import { pnbeta2 } from '../beta/pnbeta';
import { pnchisq } from '../chi-2/pnchisq';

const { isNaN: ISNAN, isFinite: R_FINITE, POSITIVE_INFINITY: ML_POSINF } = Number;

const printer_pnf = debug('pnf');
export function pnf(x: number, df1: number, df2: number, ncp: number, lowerTail = true, logP = false): number {
    let y;

    if (ISNAN(x) || ISNAN(df1) || ISNAN(df2) || ISNAN(ncp)) return x + df2 + df1 + ncp;

    if (df1 <= 0 || df2 <= 0 || ncp < 0) return ML_ERR_return_NAN(printer_pnf);
    if (!R_FINITE(ncp)) return ML_ERR_return_NAN(printer_pnf);
    if (!R_FINITE(df1) && !R_FINITE(df2))
        /* both +Inf */
        return ML_ERR_return_NAN(printer_pnf);

    const rc = R_P_bounds_01(lowerTail, logP, x, 0, ML_POSINF);
    if (rc !== undefined) {
        return rc;
    }
    if (df2 > 1e8)
        /* avoid problems with +Inf and loss of accuracy */
        return pnchisq(x * df1, df1, ncp, lowerTail, logP);

    y = (df1 / df2) * x;
    return pnbeta2(y / (1 + y), 1 / (1 + y), df1 / 2, df2 / 2, ncp, lowerTail, logP);
}
