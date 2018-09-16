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

import {
  fmod,
  M_LN_SQRT_2PI, // no math alias for this
  M_LN_SQRT_PId2,
  ME,
  ML_ERR_return_NAN,
  ML_ERROR
} from '../common/_general';

import { sinpi } from '../trigonometry';
import { gammafn } from './gamma_fn';
import { lgammacor } from './lgammacor';

const { isNaN: ISNAN, POSITIVE_INFINITY: ML_POSINF } = Number;
const { log, abs: fabs, floor, trunc } = Math;


const printer_sign = debug('lgammafn_sign');

const xmax = 2.5327372760800758e305;
const dxrel = 1.490116119384765625e-8;

export function lgammafn_sign(x: number, sgn?: number[]): number {
  let ans: number;
  let y: number;
  let sinpiy: number;

  /*
  #ifdef NOMORE_FOR_THREADS
    static double xmax = 0.;
    static double dxrel = 0.;
 
    if (xmax == 0) {// initialize machine dependent constants _ONCE_ 
        xmax = d1mach(2) / log(d1mach(2));// = 2.533 e305	 for IEEE double 
        dxrel = sqrt(d1mach(4));// sqrt(Eps) ~ 1.49 e-8  for IEEE double 
    }
    #else*/
  // For IEEE double precision DBL_EPSILON = 2^-52 = 2.220446049250313e-16 :
  //   xmax  = DBL_MAX / log(DBL_MAX) = 2^1024 / (1024 * log(2)) = 2^1014 / log(2)
  //   dxrel = sqrt(DBL_EPSILON) = 2^-26 = 5^26 * 1e-26 (is *exact* below !)
  //

  if (sgn) sgn[0] = 1;

  //#ifdef IEEE_754
  if (ISNAN(x)) return x;
  //#endif

  if (sgn && x < 0 && fmod(floor(-x), 2) === 0) {
    sgn[0] = -1;
  }

  if (x <= 0 && x === trunc(x)) {
    /// Negative integer argument
    ML_ERROR(ME.ME_RANGE, 'lgamma', printer_sign);
    return ML_POSINF; // +Inf, since lgamma(x) = log|gamma(x)|
  }

  y = fabs(x);

  if (y < 1e-306) return -log(y); // denormalized range, R change
  if (y <= 10) return log(fabs(gammafn(x) as number));

  //  ELSE  y = |x| > 10 ----------------------

  if (y > xmax) {
    ML_ERROR(ME.ME_RANGE, 'lgamma', printer_sign);
    return ML_POSINF;
  }

  if (x > 0) {
    // i.e. y = x > 10
    //#ifdef IEEE_754
    if (x > 1e17) return x * (log(x) - 1);
    else if (x > 4934720) return M_LN_SQRT_2PI + (x - 0.5) * log(x) - x;
    else return M_LN_SQRT_2PI + (x - 0.5) * log(x) - x + lgammacor(x);
  }
  // else: x < -10; y = -x
  sinpiy = fabs(sinpi(y));

  if (sinpiy === 0) {
    // Negative integer argument ===
    //Now UNNECESSARY: caught above
    printer_sign(' ** should NEVER happen! *** [lgamma.c: Neg.int, y=%d]', y);
    return ML_ERR_return_NAN(printer_sign);
  }

  ans = M_LN_SQRT_PId2 + (x - 0.5) * log(y) - x - log(sinpiy) - lgammacor(y);

  if (fabs((x - Math.trunc(x - 0.5)) * ans / x) < dxrel) {
    // The answer is less than half precision because
    // the argument is too near a negative integer.

    ML_ERROR(ME.ME_PRECISION, 'lgamma', printer_sign);
  }

  return ans;
}

