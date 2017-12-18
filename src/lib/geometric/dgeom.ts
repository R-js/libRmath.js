/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 4, 2017
 *
 *  ORIGINAL AUTHOR
 *  AUTHOR
 *    Catherine Loader, catherine@research.bell-labs.com.
 *    October 23, 2000.
 *
 *  Merge in to R:
 *	Copyright (C) 2000-2014 The R Core Team
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
 *    Computes the geometric probabilities, Pr(X=x) = p(1-p)^x.
 */
import * as debug from 'debug';
import { ML_ERR_return_NAN, R_D__0, R_D_nonint_check } from '~common';
import { dbinom_raw } from '../binomial/dbinom';

const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const { round: R_forceint, log } = Math;

const printer = debug('dgeom');

export function dgeom<T>(xx: T, p: number, giveLog: boolean = false): T {
  
  const fx: number[] = Array.isArray(xx) ? xx : [xx] as any;
  
  const result = fx.map( x => {
  
    let prob: number;

    if (ISNAN(x) || ISNAN(p)) return x + p;

    if (p <= 0 || p > 1) {
      return ML_ERR_return_NAN(printer);
    }

    let rc = R_D_nonint_check(giveLog, x, printer);
    if (rc !== undefined) {
      return rc;
    }
    if (x < 0 || !R_FINITE(x) || p === 0) {
      return R_D__0(giveLog);
    }
    x = R_forceint(x);

    /* prob = (1-p)^x, stable for small p */
    prob = dbinom_raw(0, x, p, 1 - p, giveLog);

    return giveLog ? log(p) + prob : p * prob;
  });

  return result.length === 1 ? result[0] : result as any;
}
