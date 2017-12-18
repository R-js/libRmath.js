/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 27, 2017
 *
 *  ORIGINAL AUTHOR
 * 
 *    Catherine Loader, catherine@research.bell-labs.com.
 *    October 23, 2000.
 *
 *  Merge in to R:
 *	Copyright (C) 2000, 2005 The R Core Team
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
 *
 *  DESCRIPTION
 *
 *    The density function of the F distribution.
 *    To evaluate it, write it as a Binomial probability with p = x*m/(n+x*m).
 *    For m >= 2, we use the simplest conversion.
 *    For m < 2, (m-2)/2 < 0 so the conversion will not work, and we must use
 *               a second conversion.
 *    Note the division by p; this seems unavoidable
 *    for m < 2, since the F density has a singularity as x (or p) -> 0.
 */
import * as debug from 'debug';

import { ML_ERR_return_NAN, R_D__0, R_D__1 } from '~common';

import { dgamma } from '../gamma/dgamma';
import { dbinom_raw } from '../binomial/dbinom';

const { log } = Math;
const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer = debug('df');

export function df<T>(
    xx: T, 
    m: number, 
    n: number, 
    giveLog: boolean = false): T {

        const fx: number[] = Array.isArray(xx) ? xx :[xx] as any;
        const result = fx.map( x => {
  let p: number;
  let q: number;
  let f: number;
  let dens: number;

  if (ISNAN(x) || ISNAN(m) || ISNAN(n)) {
    return x + m + n;
  }
  if (m <= 0 || n <= 0) {
    return ML_ERR_return_NAN();
  }
  if (x < 0) {
    return R_D__0(giveLog);
  }
  if (x === 0) {
    return m > 2 ? R_D__0(giveLog) : m === 2 ? R_D__1(giveLog) : ML_POSINF;
  }
  if (!R_FINITE(m) && !R_FINITE(n)) {
    /* both +Inf */
    if (x === 1) {
      return ML_POSINF;
    } else {
      return R_D__0(giveLog);
    }
  }
  if (!R_FINITE(n)) {
    /* must be +Inf by now */
    return dgamma(x, m / 2, 2 / m, giveLog);
  }
  if (m > 1e14) {
    /* includes +Inf: code below is inaccurate there */
    dens = dgamma(1 / x, n / 2, 2 / n, giveLog);
    return giveLog ? dens - 2 * log(x) : dens / (x * x);
  }

  f = 1 / (n + x * m);
  q = n * f;
  p = x * m * f;

  if (m >= 2) {
    f = m * q / 2;
    dens = dbinom_raw((m - 2) / 2, (m + n - 2) / 2, p, q, giveLog);
  } else {
    f = m * m * q / (2 * p * (m + n));
    dens = dbinom_raw(m / 2, (m + n) / 2, p, q, giveLog);
  }
  return giveLog ? log(f) + dens : f * dens;
});
return result.length === 1 ? result[0] : result as any;
}
