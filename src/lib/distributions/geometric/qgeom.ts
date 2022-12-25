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
import { R_Q_P01_check, ML_ERR_return_NAN2, lineInfo4, R_Q_P01_boundaries } from '@common/logger';
import { R_DT_Clog } from '@dist/exp/expm1';
import { max, ceil, log1p } from '@lib/r-func';

const printer = debug('qgeom');

export function qgeom(p: number, prob: number, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(prob)) return NaN;

    if (prob <= 0 || prob > 1) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    const chk1 = R_Q_P01_check(logP, p);
    if (chk1 !== undefined) {
        return chk1;
    }
    
    if (prob === 1) return 0;

    const chk2 = R_Q_P01_boundaries(lowerTail, logP, p, 0, Infinity);
    if (chk2 !== undefined) {
        return chk2;
    }
   
    /* add a fuzz to ensure left continuity, but value must be >= 0 */
    return max(0, ceil(R_DT_Clog(lowerTail, logP, p) / log1p(-prob) - 1 - 1e-12));
}
