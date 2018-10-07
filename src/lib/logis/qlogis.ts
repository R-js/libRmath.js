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

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';

import { R_Log1_Exp } from '../exp/expm1';


const {
  isNaN: ISNAN,
  POSITIVE_INFINITY: ML_POSINF,
  NEGATIVE_INFINITY: ML_NEGINF
} = Number;

const { log } = Math;

const printer_qlogis = debug('qlogis');

export function qlogis(
  p: number,
  location: number = 0,
  scale: number = 1,
  lower_tail: boolean = true,
  log_p: boolean = false
): number {

    if (ISNAN(p) || ISNAN(location) || ISNAN(scale))
      return p + location + scale;

    let rc = R_Q_P01_boundaries(lower_tail, log_p, p, ML_NEGINF, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }

    if (scale < 0) {
      return ML_ERR_return_NAN(printer_qlogis);
    }
    if (scale === 0) return location;

    /* p := logit(p) = log( p / (1-p) )	 : */
    if (log_p) {
      if (lower_tail) p = p - R_Log1_Exp(p);
      else p = R_Log1_Exp(p) - p;
    } else p = log(lower_tail ? p / (1 - p) : (1 - p) / p);

    return location + scale * p;

}
