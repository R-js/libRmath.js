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
import { ML_ERR_return_NAN, R_P_bounds_Inf_01 } from '../common/_general';


const { exp, log1p } = Math;
const { isNaN: ISNAN } = Number;


export function Rf_log1pexp(x: number): number {
  if (x <= 18) return log1p(exp(x));
  if (x > 33.3) return x;
  // else: 18.0 < x <= 33.3 :
  return x + exp(-x);
}

const printer_plogis = debug('plogis');

export function plogis(
  x: number,
  location: number = 0,
  scale: number = 1,
  lower_tail: boolean = true,
  log_p: boolean = false
): number {

  if (ISNAN(x) || ISNAN(location) || ISNAN(scale))
    return x + location + scale;

  if (scale <= 0.0) {
    return ML_ERR_return_NAN(printer_plogis);
  }

  x = (x - location) / scale;
  if (ISNAN(x)) {
    return ML_ERR_return_NAN(printer_plogis);
  }
  let rc = R_P_bounds_Inf_01(lower_tail, log_p, x);
  if (rc !== undefined) {
    return rc;
  }

  if (log_p) {
    // log(1 / (1 + exp( +- x ))) = -log(1 + exp( +- x))
    return -Rf_log1pexp(lower_tail ? -x : x);
  }
  return 1 / (1 + exp(lower_tail ? -x : x));


}
