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

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../../common/_general';

import { qbeta } from '../../beta/qbeta';
import { qchisq } from '../chi-2/qchisq';

const printer = debug('qf');

const { isNaN: ISNAN, isFinite: R_FINITE, NaN: ML_NAN, POSITIVE_INFINITY: ML_POSINF, isFinite: ML_VALID } = Number;

export function qf<T>(pp: T, df1: number, df2: number, lower_tail: boolean, log_p: boolean): T {
    const fp: number[] = Array.isArray(pp) ? pp : ([pp] as any);
    const result = fp.map((p) => {
        if (ISNAN(p) || ISNAN(df1) || ISNAN(df2)) return p + df1 + df2;

        if (df1 <= 0 || df2 <= 0) return ML_ERR_return_NAN(printer);

        const rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
        if (rc !== undefined) {
            return rc;
        }

        /* fudge the extreme DF cases -- qbeta doesn't do this well.
       But we still need to fudge the infinite ones.
     */

        if (df1 <= df2 && df2 > 4e5) {
            if (!R_FINITE(df1))
                /* df1 == df2 == Inf : */
                return 1;
            /* else */
            return qchisq(p, df1, lower_tail, log_p) / df1;
        }
        if (df1 > 4e5) {
            /* and so  df2 < df1 */
            return df2 / qchisq(p, df2, !lower_tail, log_p);
        }

        // FIXME: (1/qb - 1) = (1 - qb)/qb; if we know qb ~= 1, should use other tail
        p = (1 / qbeta(p, df2 / 2, df1 / 2, !lower_tail, log_p) - 1) * (df2 / df1);
        return ML_VALID(p) ? p : ML_NAN;
    });
    return result.length === 1 ? result[0] : (result as any);
}
