/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 25, 2017
 * 
 * ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1999-2014  The R Core Team
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
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double dsignrank(double x, double n, int give_log)
 *    double psignrank(double x, double n, int lower_tail, int log_p)
 *    double qsignrank(double x, double n, int lower_tail, int log_p)
 *    double rsignrank(double n)
 *
 *  DESCRIPTION
 *
 *    dsignrank	   The density of the Wilcoxon Signed Rank distribution.
 *    psignrank	   The distribution function of the Wilcoxon Signed Rank
 *		   distribution.
 *    qsignrank	   The quantile function of the Wilcoxon Signed Rank
 *		   distribution.
 *    rsignrank	   Random variates from the Wilcoxon Signed Rank
 *		   distribution.
 */

import * as debug from 'debug';

import {
  ML_ERR_return_NAN,
  R_D__0,
  R_D_exp,
  R_DT_0,
  R_DT_1,
  R_Q_P01_check,
  imin2
} from '~common';

import { R_DT_val } from '../log/log1p';
import { R_DT_qIv } from '~exp-utils';

import { IRNG } from '../rng';

const { isFinite: R_FINITE, EPSILON: DBL_EPSILON, isNaN: ISNAN } = Number;
const {
  LN2: M_LN2,
  abs: fabs,
  trunc,
  log,
  exp,
  floor,
  round: R_forceint
} = Math;


let w: number[];


export function w_init_maybe(n: number): void {
  let u;
  let c;

  u = n * (n + 1) / 2;
  c = u / 2;
  w = new Array<number>(c + 1);
}

export function csignrank(k: number, n: number): number {
  let c;
  let u;
  let j;

  //R_CheckUserInterrupt();

  u = n * (n + 1) / 2;
  c = u / 2;

  if (k < 0 || k > u) return 0;
  if (k > c) k = u - k;

  if (n === 1) return 1;
  if (w[0] === 1) return w[k];

  w[0] = w[1] = 1;
  for (j = 2; j < n + 1; ++j) {
    let i;
    let end = imin2(j * (j + 1) / 2, c);
    for (i = end; i >= j; --i) w[i] += w[i - j];
  }

  return w[k];
}

const printer_dsignrank = debug('dsignrank');
export function dsignrank(x: number, n: number, give_log: boolean): number {
 

    let d: number;

  /* NaNs propagated correctly */
  if (ISNAN(x) || ISNAN(n)) return x + n;

  n = R_forceint(n);
  if (n <= 0) {
    return ML_ERR_return_NAN(printer_dsignrank);
  }
  if (fabs(x - R_forceint(x)) > 1e-7) {
    return R_D__0(give_log);
  }
  x = R_forceint(x);
  if (x < 0 || x > n * (n + 1) / 2) {
    return R_D__0(give_log);
  }

  let nn = trunc(n);
  w_init_maybe(nn);
  d = R_D_exp(give_log, log(csignrank(trunc(x), nn)) - n * M_LN2);

  return d;
}

const printer_psignrank = debug('psignrank');
export function psignrank(
  x: number,
  n: number,
  lower_tail: boolean,
  log_p: boolean
): number {
  let i;
  let f;
  let p;

  if (ISNAN(x) || ISNAN(n)) return x + n;

  if (!R_FINITE(n)) return ML_ERR_return_NAN(printer_psignrank);
  n = R_forceint(n);
  if (n <= 0) return ML_ERR_return_NAN(printer_psignrank);

  x = R_forceint(x + 1e-7);
  if (x < 0.0) return R_DT_0(lower_tail, log_p);
  if (x >= n * (n + 1) / 2) return R_DT_1(lower_tail, log_p);

  let nn = trunc(n);
  w_init_maybe(nn);
  f = exp(-n * M_LN2);
  p = 0;
  if (x <= n * (n + 1) / 4) {
    for (i = 0; i <= x; i++) p += csignrank(i, nn) * f;
  } else {
    x = n * (n + 1) / 2 - x;
    for (i = 0; i < x; i++) p += csignrank(i, nn) * f;
    lower_tail = !lower_tail; /* p = 1 - p; */
  }

  return R_DT_val(lower_tail, log_p, p);
} /* psignrank() */

const printer_qsignrank = debug('qsignrank');

export function qsignrank(
  x: number,
  n: number,
  lower_tail: boolean,
  log_p: boolean
): number {
  let f;
  let p;

  if (ISNAN(x) || ISNAN(n)) {
    return x + n;
  }
  if (!R_FINITE(x) || !R_FINITE(n)) {
    return ML_ERR_return_NAN(printer_qsignrank);
  }
  let rc = R_Q_P01_check(log_p, x);
  if (rc !== undefined) {
    return rc;
  }

  n = R_forceint(n);
  if (n <= 0) return ML_ERR_return_NAN(printer_qsignrank);

  if (x === R_DT_0(lower_tail, log_p)) return 0;
  if (x === R_DT_1(lower_tail, log_p)) return n * (n + 1) / 2;

  if (log_p || !lower_tail)
    x = R_DT_qIv(lower_tail, log_p, x); /* lower_tail,non-log "p" */

  let nn = trunc(n);
  w_init_maybe(nn);
  f = exp(-n * M_LN2);
  p = 0;
  let q = 0;
  if (x <= 0.5) {
    x = x - 10 * DBL_EPSILON;
    while (true) {
      p += csignrank(q, nn) * f;
      if (p >= x) break;
      q++;
    }
  } else {
    x = 1 - x + 10 * DBL_EPSILON;
    while (true) {
      p += csignrank(q, nn) * f;
      if (p > x) {
        q = trunc(n * (n + 1) / 2 - q);
        break;
      }
      q++;
    }
  }

  return q;
}

const printer_rsignrank = debug('rsignrank');
export function rsignrank(n: number, rng: IRNG): number {
  let i;
  let k;
  let r;

  /* NaNs propagated correctly */
  if (ISNAN(n)) return n;
  n = R_forceint(n);
  if (n < 0) return ML_ERR_return_NAN(printer_rsignrank);

  if (n === 0) return 0;
  r = 0.0;
  k = floor(n);
  for (i = 0; i < k /**/; ) {
    r += ++i * floor(rng.unif_rand() + 0.5);
  }
  return r;
}
