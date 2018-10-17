'use strict'
/* This is a conversion from libRmath.so to Typescript/Javascript
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
import { M_LN_SQRT_PI, ML_ERR_return_NAN, R_D__0 } from '../common/_general';

import { lgammafn } from '../gamma/lgamma_fn';
import { dnorm4 as dnorm } from '../normal/dnorm';
import { dt } from './dt';
import { pnt } from './pnt';

const { isNaN: ISNAN, isFinite: R_FINITE, EPSILON: DBL_EPSILON } = Number;
const { abs: fabs, sqrt, log, exp } = Math;

const printer_dnt = debug('dnt');
export function dnt(
  x: number,
  df: number,
  ncp: number = 0,
  giveLog: boolean = false
): number {

  if (ISNAN(x) || ISNAN(df)) return x + df;

  /* If non-positive df then error */
  if (df <= 0.0) return ML_ERR_return_NAN(printer_dnt);

  if (ncp === 0.0) return dt(x, df, giveLog);

  /* If x is infinite then return 0 */
  if (!R_FINITE(x)) return R_D__0(giveLog);

  /* If infinite df then the density is identical to a
     normal distribution with mean = ncp.  However, the formula
     loses a lot of accuracy around df=1e9
  */
  if (!R_FINITE(df) || df > 1e8) return dnorm(x, ncp, 1, giveLog);

  /* Do calculations on log scale to stabilize */

  /* Consider two cases: x ~= 0 or not */
  const u = function() {
    if (fabs(x) > sqrt(df * DBL_EPSILON)) {
      printer_dnt('fabs(x:%d)>sqrt(df*espsilon):%d', fabs(x), sqrt(df * DBL_EPSILON));
      return (
        log(df) -
        log(fabs(x)) +
        log(
          fabs(
            pnt(x * sqrt((df + 2) / df), df + 2, ncp, true, false) -
            pnt(x, df, ncp, true, false)
          )
        )
      );
      /* FIXME: the above still suffers from cancellation (but not horribly) */
    } else {
      /* x ~= 0 : -> same value as for  x = 0 */
      printer_dnt('fabs(x:%d)<=sqrt(df*espsilon):%d', fabs(x), sqrt(df * DBL_EPSILON));
      return (
        lgammafn((df + 1) / 2) -
        lgammafn(df / 2) -
        (M_LN_SQRT_PI + 0.5 * (log(df) + ncp * ncp))
      );
    }
  }();
  printer_dnt('u=%d, giveLog=%s', u, giveLog);
  return giveLog ? u : exp(u);
}
