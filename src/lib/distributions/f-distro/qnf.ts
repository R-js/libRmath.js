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

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '@common/logger.js';

import { qnbeta } from '@dist/beta/qnbeta.js';
import { qnchisq } from '@dist/chi-2/qnchisq.js';

const printer = debug('qnf');

export function qnf(p: number, df1: number, df2: number, ncp: number, lowerTail: boolean, logP: boolean): number {

    if (isNaN(p) || isNaN(df1) || isNaN(df2) || isNaN(ncp)) return p + df1 + df2 + ncp;

    if (
        (df1 <= 0 || df2 <= 0 || ncp < 0)
        ||
        !isFinite(ncp)
        ||
        (!isFinite(df1) && !isFinite(df2))
    ) {
        return ML_ERR_return_NAN(printer);
    }

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, Infinity);
    if (rc !== undefined) {
        return rc;
    }

    if (df2 > 1e8)
        /* avoid problems with +Inf and loss of accuracy */
        return qnchisq(p, df1, ncp, lowerTail, logP) / df1;
    //console.log({p,df1,df2,ncp,lowerTail, logP})
    const y = qnbeta(p, df1 / 2, df2 / 2, ncp, lowerTail, logP);
    //console.log({y});
    return y / (1 - y) * (df2 / df1);
}
