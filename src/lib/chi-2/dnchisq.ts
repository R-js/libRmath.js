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

import { ML_ERR_return_NAN, R_D__0, R_D_val } from '../common/_general';

import { dchisq } from '../chi-2/dchisq';
import { dpois_raw } from '../poisson/dpois';

const { ceil, sqrt } = Math;
const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer_dnchisq = debug('dnchisq');

export function dnchisq(
  x: number,
  df: number,
  ncp: number,
  give_log: boolean
): number {
  const eps = 5e-15;

  


    let i: number;
    let ncp2: number;
    let q: number;
    let mid: number;
    let dfmid: number;
    let imax: number;
    let sum: number;
    let term: number;

    if (ISNAN(x) || ISNAN(df) || ISNAN(ncp)) {
      return x + df + ncp;
    }

    if (!R_FINITE(df) || !R_FINITE(ncp) || ncp < 0 || df < 0) {
      return ML_ERR_return_NAN(printer_dnchisq);
    }

    if (x < 0) {
      return R_D__0(give_log);
    }
    if (x === 0 && df < 2) return ML_POSINF;
    if (ncp === 0) return df > 0 ? dchisq(x, df, give_log) : R_D__0(give_log);
    if (x === ML_POSINF) return R_D__0(give_log);

    ncp2 = 0.5 * ncp;

    /* find max element of sum */
    imax = ceil((-(2 + df) + sqrt((2 - df) * (2 - df) + 4 * ncp * x)) / 4);
    if (imax < 0) imax = 0;
    if (R_FINITE(imax)) {
      dfmid = df + 2 * imax;
      mid = dpois_raw(imax, ncp2, false) * dchisq(x, dfmid, false);
    } else {
      /* imax = Inf */
      // mid = 0;
      // }

      // if (mid === 0) {
      /* underflow to 0 -- maybe numerically correct; maybe can be more accurate,
	 * particularly when  give_log = TRUE */
      /* Use  central-chisq approximation formula when appropriate;
	 * ((FIXME: the optimal cutoff also depends on (x,df);  use always here? )) */
      if (give_log || ncp > 1000) {
        let nl = df + ncp;
        let ic = nl / (nl + ncp); /* = "1/(1+b)" Abramowitz & St.*/
        return dchisq(x * ic, nl * ic, give_log);
      } else return R_D__0(give_log);
    }

    sum = mid;

    /* errorbound := term * q / (1-q)  now subsumed in while() / if() below: */

    /* upper tail */
    term = mid;
    df = dfmid;
    i = imax;
    let x2 = x * ncp2;
    do {
      i++;
      q = x2 / i / df;
      df += 2;
      term *= q;
      sum += term;
    } while (q >= 1 || term * q > (1 - q) * eps || term > 1e-10 * sum);
    /* lower tail */
    term = mid;
    df = dfmid;
    i = imax;
    while (i !== 0) {
      df -= 2;
      q = i * df / x2;
      i--;
      term *= q;
      sum += term;
      if (q < 1 && term * q <= (1 - q) * eps) break;
    }
    return R_D_val(give_log, sum);
 
}
