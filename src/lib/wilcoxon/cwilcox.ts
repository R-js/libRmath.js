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
export function cwilcox(k: number, m: number, n: number, w: number[][][]): number {
    // int
    let c;
    let u;
    let i;
    let j;
    let l;
  
    u = m * n;
    if (k < 0 || k > u) {
      return 0;
    }
    c = (u / 2) >> 0;
  
    if (k > c) k = u - k; /* hence  k <= floor(u / 2) */
    if (m < n) {
      i = m;
      j = n;
    } else {
      i = n;
      j = m;
    } /* hence  i <= j */
  
    if (j === 0) {
      /* and hence i == 0 */
      return k === 0 ? 1 : 0;
    }
  
    /* We can simplify things if k is small.  Consider the Mann-Whitney 
         definition, and sort y.  Then if the statistic is k, no more 
         than k of the y's can be <= any x[i], and since they are sorted 
         these can only be in the first k.  So the count is the same as
         if there were just k y's. 
      */
    if (j > 0 && k < j) return cwilcox(k, i, k, w);
  
    /*if (w[i][j] === undefined) {
      w[i][j] = new Array<number>(c + 1).fill(-1); //  (double *) calloc((size_t) c + 1, sizeof(double));
      //#ifdef MATHLIB_STANDALONE
      //if (!w[i][j]) MATHLIB_ERROR(_("wilcox allocation error %d"), 3);
      //#endif
      //NOTE: replaced by "fill" for (l = 0; l <= c; l++) w[i][j][l] = -1;
    }*/
    if (w[i][j][k] < 0) {
      if (j === 0) {
        /* and hence i == 0 */
        w[i][j][k] = k === 0 ? 1 : 0;
      } else {
        w[i][j][k] = cwilcox(k - j, i - 1, j, w) + cwilcox(k, i, j - 1, w);
      }
    }
    return w[i][j][k];
  }
