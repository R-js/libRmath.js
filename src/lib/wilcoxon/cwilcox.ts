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

/* 
This counts the number of choices with 
statistic = k 
*/
const { trunc } = Math;

import { WilcoxonCache } from './WilcoxonCache';

export function cwilcox(
  k: number,
  m: number,
  n: number,
  w: WilcoxonCache
): number {
  let i;
  let j;

  const u = m * n;
  const c = trunc(u / 2);

  if (k < 0 || k > u) {
    return 0;
  }

  if (k > c) {
    k = u - k; /* hence  k <= floor(u / 2) */
  }

  if (m < n) {
    i = m;
    j = n;
  } else {
    i = n;
    j = m;
  } /* hence  i <= j */

  /*if (j === 0) {
    // and hence i == 0 
    console.log(`5. cwilcox: exit with k:${k}`);
    return k === 0 ? 1 : 0;
  }*/

  /*
     We can simplify things if k is small.  Consider the Mann-Whitney 
         definition, and sort y.  Then if the statistic is k, no more 
         than k of the y's can be <= any x[i], and since they are sorted 
         these can only be in the first k.  So the count is the same as
         if there were just k y's. 
  */

  if (j > 0 && k < j) {
    return cwilcox(k, i, k, w);
  }

  /*if (w[i][j] === undefined) {
      w[i][j] = new Array<number>(c + 1).fill(-1); //  (double *) calloc((size_t) c + 1, sizeof(double));
      //#ifdef MATHLIB_STANDALONE
      //if (!w[i][j]) MATHLIB_ERROR(_("wilcox allocation error %d"), 3);
      //#endif
      //NOTE: replaced by "fill" for (l = 0; l <= c; l++) w[i][j][l] = -1;
    }*/

  if (w.get(i, j, k) === undefined) {
    if (j === 0) {
      w.set(i, j, k, k === 0 ? 1 : 0);
    } else {
      const c1 = cwilcox(k - j, i - 1, j, w);
      const c2 =  cwilcox(k, i, j - 1, w);
      w.set(i, j, k, c1 + c2);
    }
  }
  const result = w.get(i, j, k);
  if (result === undefined){
    throw new Error ('WilcoxonCache not set');
  }
  return result;
}
