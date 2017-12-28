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

import { ML_ERR_return_NAN, R_DT_0, R_DT_1, R_DT_val } from '../common/_general';
import { choose } from '../common/choose';
import { forEach } from '../r-func';

import { WilcoxonCache } from './WilcoxonCache';

import { cwilcox } from './cwilcox';

const { round:R_forceint, floor} = Math;
const { isNaN:ISNAN, isFinite:R_FINITE } = Number;

const printer_pwilcox = debug('pwilcox');
export function pwilcox<T>(
  qq: T,
  m: number,
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  m = R_forceint(m);
  n = R_forceint(n);
 

  return forEach(qq)(q => {
    
    const w = new WilcoxonCache();

    let lower_tail = lowerTail;
    if (ISNAN(q) || ISNAN(m) || ISNAN(n)) return q + m + n;
    if (!R_FINITE(m) || !R_FINITE(n)) return ML_ERR_return_NAN(printer_pwilcox);

    if (m <= 0 || n <= 0) return ML_ERR_return_NAN(printer_pwilcox);

    q = floor(q + 1e-7);

    if (q < 0.0) return R_DT_0(lower_tail, logP);
    if (q >= m * n) return R_DT_1(lower_tail, logP);

    let mm = m;
    let nn = n;
    //w_init_maybe(mm, nn);
    let c = choose(m + n, n);
    let p = 0;
    /* Use summation of probs over the shorter range */
    if (q <= m * n / 2) {
      for (let i = 0; i <= q; i++) p += cwilcox(i, m, n, w) / c;
    } else {
      q = m * n - q;
      for (let i = 0; i < q; i++) p += cwilcox(i, m, n, w) / c;
      lower_tail = !lower_tail; /* p = 1 - p; */
    }

    return R_DT_val(lower_tail, logP, p);
  }) as any;
} /* pwilcox */

/* x is 'p' in R function qwilcox */
