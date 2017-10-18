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
   Note: the checks here for R_CheckInterrupt also do stack checking.

   calloc/free are remapped for use in R, so allocation checks are done there.
   freeing is completed by an on.exit action in the R wrappers.
*/

import {
    imax2,
    ISNAN,
    ML_ERR_return_NAN,
    R_forceint,
    fabs,
    R_D__0,
    log,
    R_FINITE,
    floor,
    R_DT_0,
    R_DT_1,
    R_Q_P01_check,
    DBL_EPSILON,
    trunc,
    MATHLIB_ERROR
} from '~common';

import { choose, lchoose } from '~common';
import { R_DT_val } from '~log';
import { R_DT_qIv } from '~exp';
import { unif_rand } from '~uniform';



const WILCOX_MAX = 50;

let allocated_m: number;
let allocated_n: number;

let w: number[][][];





function w_init_maybe(m: number, n: number): void {
    let i;

    if (m > n) {
        i = n; n = m; m = i;
    }

    if (!w) { /* initialize w[][] */
        m = imax2(m, WILCOX_MAX);
        n = imax2(n, WILCOX_MAX);
        w = new Array<number[][]>(m + 1);
        //w = (double ***) calloc((size_t) m + 1, sizeof(double **));
        for (i = 0; i <= m; i++) {
            //w[i] = (double **) calloc((size_t) n + 1, sizeof(double *));
            w[i] = new Array<number[]>(n + 1);
            // #ifdef MATHLIB_STANDALONE
            /* the apparent leak here in the in-R case should be
               swept up by the on.exit action */
            // if (!w[i]) {
            /* first free all earlier allocations */
            //   w_free(i - 1, n);
            //   MATHLIB_ERROR(_("wilcox allocation error %d"), 2);
            // }
            // #endif
        }
        allocated_m = m; allocated_n = n;
    }
}

/* This counts the number of choices with statistic = k */
export function cwilcox(k: number, m: number, n: number): number {
    let c;
    let u;
    let i;
    let j;
    let l;

    u = m * n;
    if (k < 0 || k > u)
        return 0; //false
    c = (u / 2);
    if (k > c)
        k = u - k; /* hence  k <= floor(u / 2) */
    if (m < n) {
        i = m; j = n;
    } else {
        i = n; j = m;
    } /* hence  i <= j */

    if (j === 0) {/* and hence i == 0 */
        return (k === 0 ? 1 : 0);
    }

    /* We can simplify things if k is small.  Consider the Mann-Whitney 
       definition, and sort y.  Then if the statistic is k, no more 
       than k of the y's can be <= any x[i], and since they are sorted 
       these can only be in the first k.  So the count is the same as
       if there were just k y's. 
    */
    if (j > 0 && k < j) return cwilcox(k, i, k);

    if (w[i][j] === undefined) {
        w[i][j] = new Array<number>(c + 1); //  (double *) calloc((size_t) c + 1, sizeof(double));
        //#ifdef MATHLIB_STANDALONE
        //if (!w[i][j]) MATHLIB_ERROR(_("wilcox allocation error %d"), 3);
        //#endif
        for (l = 0; l <= c; l++)
            w[i][j][l] = -1;
    }
    if (w[i][j][k] < 0) {
        if (j === 0) /* and hence i == 0 */
            w[i][j][k] = (k === 0) ? 1 : 0;
        else
            w[i][j][k] = cwilcox(k - j, i - 1, j) + cwilcox(k, i, j - 1);

    }
    return (w[i][j][k]);
}

export function dwilcox(x: number, m: number, n: number, give_log: boolean): number {
    let d: number;

    //#ifdef IEEE_754
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(m) || ISNAN(n))
        return (x + m + n);
    //#endif
    m = R_forceint(m);
    n = R_forceint(n);
    if (m <= 0 || n <= 0)
        ML_ERR_return_NAN;

    if (fabs(x - R_forceint(x)) > 1e-7)
        return R_D__0(give_log);
    x = R_forceint(x);
    if ((x < 0) || (x > m * n))
        return R_D__0(give_log);

    let mm = m;
    let nn = n;
    let xx = x;
    w_init_maybe(mm, nn);
    d = give_log ?
        log(cwilcox(xx, mm, nn)) - lchoose(m + n, n) :
        cwilcox(xx, mm, nn) / choose(m + n, n);

    return (d);
}

/* args have the same meaning as R function pwilcox */
export function pwilcox(q: number, m: number, n: number, lower_tail: boolean, log_p: boolean): number {
    let i;
    let c;
    let p;

    if (ISNAN(q) || ISNAN(m) || ISNAN(n))
        return (q + m + n);
    if (!R_FINITE(m) || !R_FINITE(n))
        ML_ERR_return_NAN;
    m = R_forceint(m);
    n = R_forceint(n);
    if (m <= 0 || n <= 0)
        ML_ERR_return_NAN;

    q = floor(q + 1e-7);

    if (q < 0.0)
        return R_DT_0(lower_tail, log_p);
    if (q >= m * n)
        return R_DT_1(lower_tail, log_p);

    let mm = m;
    let nn = n;
    w_init_maybe(mm, nn);
    c = choose(m + n, n);
    p = 0;
    /* Use summation of probs over the shorter range */
    if (q <= (m * n / 2)) {
        for (i = 0; i <= q; i++)
            p += cwilcox(i, mm, nn) / c;
    }
    else {
        q = m * n - q;
        for (i = 0; i < q; i++)
            p += cwilcox(i, mm, nn) / c;
        lower_tail = !lower_tail; /* p = 1 - p; */
    }

    return R_DT_val(lower_tail, log_p, p);
} /* pwilcox */

/* x is 'p' in R function qwilcox */

export function qwilcox(x: number, m: number, n: number, lower_tail: boolean, log_p: boolean): number {
    let c;
    let p;

    if (ISNAN(x) || ISNAN(m) || ISNAN(n))
        return (x + m + n);
    if (!R_FINITE(x) || !R_FINITE(m) || !R_FINITE(n))
        ML_ERR_return_NAN;
    R_Q_P01_check(log_p, x);

    m = R_forceint(m);
    n = R_forceint(n);
    if (m <= 0 || n <= 0)
       return  ML_ERR_return_NAN();

    if (x === R_DT_0(lower_tail, log_p))
        return (0);
    if (x === R_DT_1(lower_tail, log_p))
        return (m * n);

    if (log_p || !lower_tail)
        x = R_DT_qIv(lower_tail, log_p, x); /* lower_tail,non-log "p" */

    let mm = m;
    let nn = n;
    w_init_maybe(mm, nn);
    c = choose(m + n, n);
    p = 0;
    let q = 0;
    if (x <= 0.5) {
        x = x - 10 * DBL_EPSILON;
        while (true) {
            p += cwilcox(q, mm, nn) / c;
            if (p >= x)
                break;
            q++;
        }
    }
    else {
        x = 1 - x + 10 * DBL_EPSILON;
        while (true) {
            p += cwilcox(q, mm, nn) / c;
            if (p > x) {
                q = trunc(m * n - q);
                break;
            }
            q++;
        }
    }

    return (q);
}

export function rwilcox(m: number, n: number): number {
    let i;
    let j;
    let k;
    let x: number[];
    let r;

    /* NaNs propagated correctly */
    if (ISNAN(m) || ISNAN(n))
        return (m + n);

    m = R_forceint(m);
    n = R_forceint(n);
    if ((m < 0) || (n < 0))
        return ML_ERR_return_NAN();

    if ((m === 0) || (n === 0))
        return (0);

    r = 0.0;
    k = trunc(m + n);
    x = new Array<number>(k);

    if (!x) MATHLIB_ERROR('wilcox allocation error %d', 4);

    for (i = 0; i < k; i++)
        x[i] = i;
    for (i = 0; i < n; i++) {
        j = floor(k * unif_rand());
        r += x[j];
        x[j] = x[--k];
    }

    return (r - n * (n - 1) / 2);
}


