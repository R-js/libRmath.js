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

import { ML_ERR_return_NAN, R_D_exp, R_DT_0 } from '../common/_general';


import * as debug from 'debug';
import { R_Log1_Exp } from './expm1';

const { expm1 } = Math;
const { isNaN: ISNAN } = Number;
const printer = debug('pexp');

export function pexp(
  q: number,
  scale: number,
  lower_tail: boolean,
  log_p: boolean
): number {
    if (ISNAN(q) || ISNAN(scale)) return q + scale;
    if (scale < 0) {
      return ML_ERR_return_NAN(printer);
    }

    if (q <= 0) return R_DT_0(lower_tail, log_p);
    /* same as weibull( shape = 1): */
    q = -(q / scale);
    return lower_tail
      ? log_p ? R_Log1_Exp(q) : -expm1(q)
      : R_D_exp(log_p, q);
 
}
