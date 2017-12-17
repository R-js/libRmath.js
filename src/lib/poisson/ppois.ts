/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 16, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000 The R Core Team
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
 *    The distribution function of the Poisson distribution.
 */

import { ML_ERR_return_NAN, R_DT_0, R_DT_1 } from '~common';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const { isArray } = Array;
const { floor, max: fmax2 } = Math;

import { pgamma } from '~gamma';

import { NumberW } from '../common/toms708';

import { INormal } from '~normal';

import * as debug from 'debug';

const printer = debug('ppois');

export function ppois<T>(
  _x: T,
  lambda: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false,
  normal: INormal //pass it on to "pgamma"->"pgamma_raw"->"ppois_asymp"->(dpnorm??)->("normal.pnorm")  
): T {
  const fa: number[] = isArray(_x) ? _x : [_x] as any;

  const result = fa.map(x => {
    if (ISNAN(x) || ISNAN(lambda)) return x + lambda;

    if (lambda < 0) {
      return ML_ERR_return_NAN(printer);
    }
    if (x < 0) return R_DT_0(lowerTail, logP);
    if (lambda === 0) return R_DT_1(lowerTail, logP);
    if (!R_FINITE(x)) return R_DT_1(lowerTail, logP);
    x = floor(x + 1e-7);

    return pgamma(lambda, x + 1, 1, !lowerTail, logP, normal);
  });

  return result.length === 1 ? result[0] : result as any;
}

export function do_search(
  y: number,
  z: NumberW,
  p: number,
  lambda: number,
  incr: number,
  normal: INormal
): number {
  if (z.val >= p) {
    /* search to the left */
    while (true) {
      if (
        y === 0 ||
        (z.val = ppois(
          y - incr,
          lambda,
          /*l._t.*/ true,
          /*log_p*/ false,
          normal
        )) < p
      )
        return y;
      y = fmax2(0, y - incr);
    }
  } else {
    /* search to the right */

    while (true) {
      y = y + incr;
      if (
        (z.val = ppois(y, lambda, /*l._t.*/ true, /*log_p*/ false, normal)) >= p
      )
        return y;
    }
  }
}
