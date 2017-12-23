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

import { IRNG } from '../rng';
import { seq, possibleScalar } from '../r-func';
import { ML_ERR_return_NAN } from '../common/_general';

const printer_rwilcox = debug('rwilcox');
const { round: R_forceint, trunc, floor } = Math;
const { isNaN: ISNAN } = Number;

export function rwilcox(
  N: number = 1,
  m: number,
  n: number,
  rng: IRNG
): number | number[] {
  const result = new Array(N).fill(0).map(() => {
    /* NaNs propagated correctly */
    if (ISNAN(m) || ISNAN(n)) return m + n;

    m = R_forceint(m);
    n = R_forceint(n);
    if (m < 0 || n < 0) return ML_ERR_return_NAN(printer_rwilcox);

    if (m === 0 || n === 0) return 0;

    let r = 0.0;
    let k = trunc(m + n);
    let x = seq()()(0, k - 1);
    printer_rwilcox(`------v`);
    for (let i = 0; i < n; i++) {
      let j = floor(k * rng.unif_rand());
      r += x[j];
      x[j] = x[--k];
      printer_rwilcox(`i:${i},\tn:${n}\tj:${j}\tk:${k}\tr:${r}\tx:${x}`);
    }

    return r - n * (n - 1) / 2;
  });
  return possibleScalar(result);
}
