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
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_DT_0, R_DT_1 } from '../common/_general';

import { R_DT_Clog } from '../exp/expm1';

const { expm1, log1p, log, exp, floor } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('pgeom');

export function pgeom(
  x: number,
  p: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number {

    if (ISNAN(x) || ISNAN(p)) return x + p;

    if (p <= 0 || p > 1) {
      return ML_ERR_return_NAN(printer);
    }

    if (x < 0) return R_DT_0(lowerTail, logP);
    if (!R_FINITE(x)) return R_DT_1(lowerTail, logP);
    x = floor(x + 1e-7);

    if (p === 1) {
      /* we cannot assume IEEE */
      x = lowerTail ? 1 : 0;
      return logP ? log(x) : x;
    }
    x = log1p(-p) * (x + 1);
    if (logP) return R_DT_Clog(lowerTail, logP, x);
    else return lowerTail ? -expm1(x) : exp(x);

}
