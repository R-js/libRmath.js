/* This is a conversion from BLAS to Typescript/Javascript
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

import { ML_ERR_return_NAN, R_D_val, R_DT_0, R_DT_1 } from '../common/_general';

import { R_D_Clog } from '../common/_general';
import { atanpi } from '../trigonometry';


const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const { abs: fabs } = Math;

const printer = debug('pcauchy');

export function pcauchy(
  x: number,
  location = 0,
  scale = 1,
  lowerTail = true,
  logP = false
): number {


  if (ISNAN(x) || ISNAN(location) || ISNAN(scale))
    return x + location + scale;

  if (scale <= 0) {
    return ML_ERR_return_NAN(printer);
  }

  x = (x - location) / scale;
  if (ISNAN(x)) {
    return ML_ERR_return_NAN(printer);
  }

  if (!R_FINITE(x)) {
    if (x < 0) return R_DT_0(lowerTail, logP);
    else return R_DT_1(lowerTail, logP);
  }

  if (!lowerTail) x = -x;
  /* for large x, the standard formula suffers from cancellation.
   * This is from Morten Welinder thanks to  Ian Smith's  atan(1/x) : */

  if (fabs(x) > 1) {
    let y = atanpi(1 / x);
    return x > 0 ? R_D_Clog(logP, y) : R_D_val(logP, -y);
  } else {
    return R_D_val(logP, 0.5 + atanpi(x));
  }

}
