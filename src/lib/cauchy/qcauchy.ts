/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 18, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998    Ross Ihaka
 *  Copyright (C) 2000-2013 The R Core Team
 *  Copyright (C) 2005-6  The R Foundation
 *
 *  This version is based on a suggestion by Morten Welinder.
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
 *	The quantile function of the Cauchy distribution.
 */
import * as debug from 'debug';
import { ML_ERR_return_NAN, R_Q_P01_check } from '../common/_general';

import { forEach } from '../r-func';
import { tanpi } from '../trigonometry/tanpi';

const { expm1, exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const { p: ML_POSINF, n: ML_NEGINF } = {
  p: Infinity,
  n: -Infinity
};

const printer = debug('qcauchy');

export function qcauchy<T>(
  pp: T,
  location = 0,
  scale = 1,
  lowerTail = true,
  logP = false
): T {
  return forEach(pp)(p => {
    if (ISNAN(p) || ISNAN(location) || ISNAN(scale)) return NaN;
    let lower_tail = lowerTail;

    let rc = R_Q_P01_check(logP, p);
    if (rc !== undefined) {
      return rc;
    }

    if (scale <= 0 || !R_FINITE(scale)) {
      if (scale === 0) return location;
      /* else */ return ML_ERR_return_NAN(printer);
    }

    const my_INF = location + (lower_tail ? scale : -scale) * ML_POSINF;
    if (logP) {
      if (p > -1) {
        /* when ep := exp(p),
       * tan(pi*ep)= -tan(pi*(-ep))= -tan(pi*(-ep)+pi) = -tan(pi*(1-ep)) =
       *		 = -tan(pi*(-expm1(p))
       * for p ~ 0, exp(p) ~ 1, tan(~0) may be better than tan(~pi).
       */
        if (p === 0)
          /* needed, since 1/tan(-0) = -Inf  for some arch. */
          return my_INF;
        lower_tail = !lower_tail;
        p = -expm1(p);
      } else p = exp(p);
    } else {
      if (p > 0.5) {
        if (p === 1) return my_INF;
        p = 1 - p;
        lower_tail = !lower_tail;
      }
    }

    if (p === 0.5) return location; // avoid 1/Inf below
    if (p === 0) return location + (lower_tail ? scale : -scale) * ML_NEGINF; // p = 1. is handled above
    return location + (lower_tail ? -scale : scale) / tanpi(p);
    /*	-1/tan(pi * p) = -cot(pi * p) = tan(pi * (p - 1/2))  */
  }) as any;
}
