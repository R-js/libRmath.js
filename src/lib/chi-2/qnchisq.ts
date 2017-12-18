/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  R : A Computer Language for Statistical Data Analysis
 *  Copyright (C) 1995, 1996  Robert Gentleman and Ross Ihaka
 *  Copyright (C) 2000-2008   The R Core Team
 *  Copyright (C) 2004	      The R Foundation
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
 *  the quantile function of the  noncentral chi-squared distribution  
 */

import * as debug from 'debug';

import {
  ML_ERR_return_NAN,
  R_Q_P01_boundaries,
  ML_ERROR,
  R_D_qIv,
  ME
} from '~common';

import { qchisq } from '../chi-2/qchisq';
import { pnchisq_raw } from './pnchisq';
import { INormal } from '~normal';

const { expm1, min: fmin2 } = Math;
const {
  MAX_VALUE: DBL_MAX,
  MIN_VALUE: DBL_MIN,
  EPSILON: DBL_EPSILON,
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer = debug('_qnchisq');

export function qnchisq<T>(
  pp: T,
  df: number,
  ncp: number = 0,
  lowerTail: boolean = true,
  logP: boolean = false,
  normal: INormal
): T {
  const fa: number[] = Array.isArray(pp) ? pp : ([pp] as any);
  const result = fa.map(p => _qnchisq(p, df, ncp, lowerTail, logP, normal));
  return result.length === 1 ? result[0] : (result as any);
}

function _qnchisq(
  p: number,
  df: number,
  ncp: number,
  lower_tail: boolean = true,
  log_p: boolean = false,
  normal: INormal
): number {
  const accu = 1e-13;
  const racc = 4 * DBL_EPSILON;
  /* these two are for the "search" loops, can have less accuracy: */
  const Eps = 1e-11; /* must be > accu */
  const rEps = 1e-10; /* relative tolerance ... */

  let ux: number;
  let lx: number;
  let ux0: number;
  let nx: number;
  let pp: number;

  if (ISNAN(p) || ISNAN(df) || ISNAN(ncp)) return p + df + ncp;

  if (!R_FINITE(df)) return ML_ERR_return_NAN(printer);

  /* Was
     * df = floor(df + 0.5);
     * if (df < 1 || ncp < 0) ML_ERR_return_NAN;
     */
  if (df < 0 || ncp < 0) return ML_ERR_return_NAN(printer);

  let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
  if (rc !== undefined) {
    return rc;
  }

  pp = R_D_qIv(log_p, p);
  if (pp > 1 - DBL_EPSILON) return lower_tail ? ML_POSINF : 0.0;

  /* Invert pnchisq(.) :
     * 1. finding an upper and lower bound */
  {
    /* This is Pearson's (1959) approximation,
       which is usually good to 4 figs or so.  */
    let b;
    let c;
    let ff;
    b = ncp * ncp / (df + 3 * ncp);
    c = (df + 3 * ncp) / (df + 2 * ncp);
    ff = (df + 2 * ncp) / (c * c);
    ux = b + c * qchisq(p, ff, lower_tail, log_p, normal);
    if (ux < 0) ux = 1;
    ux0 = ux;
  }

  if (!lower_tail && ncp >= 80) {
    /* in this case, pnchisq() works via lower_tail = TRUE */
    if (pp < 1e-10) ML_ERROR(ME.ME_PRECISION, 'qnchisq', printer);
    p = /* R_DT_qIv(p)*/ log_p ? -expm1(p) : 0.5 - p + 0.5;
    lower_tail = true;
  } else {
    p = pp;
  }

  pp = fmin2(1 - DBL_EPSILON, p * (1 + Eps));
  if (lower_tail) {
    for (
      ;
      ux < DBL_MAX &&
      pnchisq_raw(ux, df, ncp, Eps, rEps, 10000, true, false, normal) < pp;
      ux *= 2
    );
    pp = p * (1 - Eps);
    for (
      lx = fmin2(ux0, DBL_MAX);
      lx > DBL_MIN &&
      pnchisq_raw(lx, df, ncp, Eps, rEps, 10000, true, false, normal) > pp;
      lx *= 0.5
    );
  } else {
    for (
      ;
      ux < DBL_MAX &&
      pnchisq_raw(ux, df, ncp, Eps, rEps, 10000, false, false, normal) > pp;
      ux *= 2
    );
    pp = p * (1 - Eps);
    for (
      lx = fmin2(ux0, DBL_MAX);
      lx > DBL_MIN &&
      pnchisq_raw(lx, df, ncp, Eps, rEps, 10000, false, false, normal) < pp;
      lx *= 0.5
    );
  }

  /* 2. interval (lx,ux)  halving : */
  if (lower_tail) {
    do {
      nx = 0.5 * (lx + ux);
      if (pnchisq_raw(nx, df, ncp, accu, racc, 100000, true, false, normal) > p)
        ux = nx;
      else lx = nx;
    } while ((ux - lx) / nx > accu);
  } else {
    do {
      nx = 0.5 * (lx + ux);
      if (
        pnchisq_raw(nx, df, ncp, accu, racc, 100000, false, false, normal) < p
      )
        ux = nx;
      else lx = nx;
    } while ((ux - lx) / nx > accu);
  }
  return 0.5 * (ux + lx);
}
