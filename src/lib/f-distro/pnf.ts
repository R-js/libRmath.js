/*  AUTHOR
*  Jacob Bogers, jkfbogers@gmail.com
*  March 14, 2017
* 
*  ORGINAL AUTHOR
*  Mathlib : A C Library of Special Functions
*  Copyright (C) 1998	Ross Ihaka
*  Copyright (C) 2000-8 The R Core Team
*
*  This program is free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  You should have received a copy of the GNU General Public License
*  along with this program; if not, a copy is available at
*  https://www.R-project.org/Licenses/
*
*  DESCRIPTION
*
*	The distribution function of the non-central F distribution.
*/

import * as debug from 'debug';
import { ML_ERR_return_NAN, R_P_bounds_01 } from '~common';

import { pnchisq } from '../chi-2/pnchisq';
import { pnbeta2 } from '../beta/pnbeta';
import { INormal } from '../normal';

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer_pnf = debug('pnf');
export function pnf<T>(
  xx: T,
  df1: number,
  df2: number,
  ncp: number,
  lowerTail: boolean = true,
  logP: boolean = false,
  normal: INormal
): T {
  const fx: number[] = Array.isArray(xx) ? xx : ([xx] as any);
  const result = fx.map(x => {
    let y;

    if (ISNAN(x) || ISNAN(df1) || ISNAN(df2) || ISNAN(ncp))
      return x + df2 + df1 + ncp;

    if (df1 <= 0 || df2 <= 0 || ncp < 0) return ML_ERR_return_NAN(printer_pnf);
    if (!R_FINITE(ncp)) return ML_ERR_return_NAN(printer_pnf);
    if (!R_FINITE(df1) && !R_FINITE(df2))
      /* both +Inf */
      return ML_ERR_return_NAN(printer_pnf);

    let rc = R_P_bounds_01(lowerTail, logP, x, 0, ML_POSINF);
    if (rc !== undefined) {
      return rc;
    }
    if (df2 > 1e8)
      /* avoid problems with +Inf and loss of accuracy */
      return pnchisq(x * df1, df1, ncp, lowerTail, logP, normal);

    y = df1 / df2 * x;
    return pnbeta2(
      y / (1 + y),
      1 / (1 + y),
      df1 / 2,
      df2 / 2,
      ncp,
      lowerTail,
      logP
    );
  });
  return result.length === 1 ? result[0] : (result as any);
}
