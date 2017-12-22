/*
 *  AUTHOR
 * 
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 25, 2017
 * 
 *  ORIGINAL AUTHOR
  Mathlib : A C Library of Special Functions
  Copyright (C) 1999-2014  The R Core Team

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or (at
  your option) any later version.

  This program is distributed in the hope that it will be useful, but
  WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the GNU
  General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, a copy is available at
  https://www.R-project.org/Licenses/

  SYNOPSIS

    #include <Rmath.h>
    double dwilcox(double x, double m, double n, int give_log)
    double pwilcox(double x, double m, double n, int lower_tail, int log_p)
    double qwilcox(double x, double m, double n, int lower_tail, int log_p);
    double rwilcox(double m, double n)

  DESCRIPTION

    dwilcox	The density of the Wilcoxon distribution.
    pwilcox	The distribution function of the Wilcoxon distribution.
    qwilcox	The quantile function of the Wilcoxon distribution.
    rwilcox	Random variates from the Wilcoxon distribution.

 */


import * as debug from 'debug';

import { vectorize } from '../r-func';
import { ML_ERR_return_NAN, R_D__0 } from '../common/_general';
import { choose, lchoose } from '../common/choose';

import { initw } from './initw';
import { cwilcox } from './cwilcox';

const { round: R_forceint, abs: fabs, log } = Math;
const { isNaN: ISNAN } = Number;

const printer_dwilcox = debug('dwilcox');

export function dwilcox<T>(
  xx: T,
  m: number,
  n: number,
  giveLog: boolean = false
): T {
  // outside the potential loop
  const w = initw(n, m);
  m = R_forceint(m);
  n = R_forceint(n);

  return vectorize(xx)(x => {
    //#ifdef IEEE_754
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(m) || ISNAN(n)) {
      return x + m + n;
    }
    //#endif

    if (m <= 0 || n <= 0) {
      return ML_ERR_return_NAN(printer_dwilcox);
    }

    if (fabs(x - R_forceint(x)) > 1e-7) return R_D__0(giveLog);
    x = R_forceint(x);
    if (x < 0 || x > m * n) {
      return R_D__0(giveLog);
    }

    let mm = m;
    let nn = n;
    let xx = x;
    return giveLog
      ? log(cwilcox(xx, mm, nn, w)) - lchoose(m + n, n)
      : cwilcox(xx, mm, nn, w) / choose(m + n, n);
  }) as any;
}
