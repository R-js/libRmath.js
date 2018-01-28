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

import {
  ML_ERR_return_NAN,
  R_DT_0,
  R_DT_1,
  R_Q_P01_check
} from '../common/_general';
import { R_DT_qIv } from '../exp/expm1';
import { map } from '../r-func';
import { cwilcox } from './cwilcox';
import { WilcoxonCache } from './WilcoxonCache';

import { internal_choose } from '../common/choose';

const { round: R_forceint, trunc } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, EPSILON: DBL_EPSILON } = Number;

const printer_qwilcox = debug('qwilcox');

export function qwilcox<T>(
  xx: T,
  m: number,
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  m = R_forceint(m);
  n = R_forceint(n);
  const w = new WilcoxonCache();

  return map(xx)(x => {
    if (ISNAN(x) || ISNAN(m) || ISNAN(n)) return x + m + n;
    if (!R_FINITE(x) || !R_FINITE(m) || !R_FINITE(n))
      return ML_ERR_return_NAN(printer_qwilcox);
    R_Q_P01_check(logP, x);

    if (m <= 0 || n <= 0) return ML_ERR_return_NAN(printer_qwilcox);

    if (x === R_DT_0(lowerTail, logP)) return 0;
    if (x === R_DT_1(lowerTail, logP)) return m * n;

    if (logP || !lowerTail)
      x = R_DT_qIv(lowerTail, logP, x); /* lower_tail,non-log "p" */

    let c = internal_choose(m + n, n);
    let p = 0;
    let q = 0;
    if (x <= 0.5) {
      x = x - 10 * DBL_EPSILON;
      while (true) {
        p += cwilcox(q, m, n, w) / c;
        if (p >= x) break;
        q++;
      }
    } else {
      x = 1 - x + 10 * DBL_EPSILON;
      while (true) {
        p += cwilcox(q, m, n, w) / c;
        if (p > x) {
          q = trunc(m * n - q);
          break;
        }
        q++;
      }
    }
    return q;
  }) as any;
}
