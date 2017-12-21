/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 20, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2013 The R Core Team
 *  Copyright (C) 2003-2013 The R Foundation
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
 *  DESCRIPTION
 *
 *	The "Student" t distribution quantile function.
 *
 *  NOTES
 *
 *	This is a C translation of the Fortran routine given in:
 *	Hill, G.W (1970) "Algorithm 396: Student's t-quantiles"
 *	CACM 13(10), 619-620.
 *
 *	Supplemented by inversion for 0 < ndf < 1.
 *
 *  ADDITIONS:
 *	- lower_tail, log_p
 *	- using	 expm1() : takes care of  Lozy (1979) "Remark on Algo.", TOMS
 *	- Apply 2-term Taylor expansion as in
 *	  Hill, G.W (1981) "Remark on Algo.396", ACM TOMS 7, 250-1
 *	- Improve the formula decision for 1 < df < 2
 */

import * as debug from 'debug';

import {
  R_Q_P01_boundaries,
  ML_ERR_return_NAN,
  ML_ERROR,
  ME,
  R_D_qIv,
  R_D_Lval,
  R_D_Cval,
  M_1_PI,
  M_PI_2,
  DBL_MANT_DIG,
  R_D_log
} from '../common/_general';

import { R_DT_qIv, R_D_LExp } from '~exp-utils';
import { pt } from './pt';
import { INormal } from '~normal';
import { dt } from './dt';
import { tanpi } from '../trigonometry/cospi';

const {
  LN2: M_LN2,
  PI: M_PI,
  SQRT2: M_SQRT2,
  sqrt,
  pow,
  log,
  exp,
  min: fmin2,
  abs: fabs,
  expm1
} = Math;

const {
  isNaN: ISNAN,
  EPSILON: DBL_EPSILON,
  MAX_VALUE: DBL_MAX,
  MIN_VALUE: DBL_MIN,
  POSITIVE_INFINITY: ML_POSINF,
  NEGATIVE_INFINITY: ML_NEGINF,
  isFinite: R_FINITE
} = Number;

const printer_qt = debug('qt');

export function qt<T>(
  pp: T,
  ndf: number,
  lowerTail: boolean,
  logP: boolean,
  normal: INormal
): T {
  const fp: number[] = (Array.isArray(pp) ? pp : [pp]) as any;
  const result = fp.map(p => _qt(p, ndf, lowerTail, logP, normal));

  return (result.length === 1 ? result[0] : result) as any;
}

function _qt(
  p: number,
  ndf: number,
  lower_tail: boolean,
  log_p: boolean,
  normal: INormal
): number {
  const eps = 1e-12;
  let P;
  let q;

  const accu = 1e-13;
  const Eps = 1e-11; /* must be > accur */

  if (ISNAN(p) || ISNAN(ndf)) return p + ndf;

  let rc = R_Q_P01_boundaries(lower_tail, log_p, p, ML_NEGINF, ML_POSINF);
  if (rc !== undefined) {
    return rc;
  }
  if (ndf <= 0) return ML_ERR_return_NAN(printer_qt);

  if (ndf < 1) {
    /* based on qnt */

    let ux;
    let lx;
    let nx;
    let pp;

    let iter = 0;

    p = R_DT_qIv(lower_tail, log_p, p);

    /* Invert pt(.) :
     * 1. finding an upper and lower bound */
    if (p > 1 - DBL_EPSILON) return ML_POSINF;
    pp = fmin2(1 - DBL_EPSILON, p * (1 + Eps));
    for (
      ux = 1;
      ux < DBL_MAX && pt(ux, ndf, true, false, normal) < pp;
      ux *= 2
    );
    pp = p * (1 - Eps);
    for (
      lx = -1;
      lx > -DBL_MAX && pt(lx, ndf, true, false, normal) > pp;
      lx *= 2
    );

    /* 2. interval (lx,ux)  halving
       regula falsi failed on qt(0.1, 0.1)
     */
    do {
      nx = 0.5 * (lx + ux);
      if (pt(nx, ndf, true, false, normal) > p) ux = nx;
      else lx = nx;
    } while ((ux - lx) / fabs(nx) > accu && ++iter < 1000);

    if (iter >= 1000) {
      ML_ERROR(ME.ME_PRECISION, 'qt', printer_qt);
    }

    return 0.5 * (lx + ux);
  }

  /* Old comment:
     * FIXME: "This test should depend on  ndf  AND p  !!
     * -----  and in fact should be replaced by
     * something like Abramowitz & Stegun 26.7.5 (p.949)"
     *
     * That would say that if the qnorm value is x then
     * the result is about x + (x^3+x)/4df + (5x^5+16x^3+3x)/96df^2
     * The differences are tiny even if x ~ 1e5, and qnorm is not
     * that accurate in the extreme tails.
     */
  if (ndf > 1e20) return normal.qnorm(p, 0, 1, lower_tail, log_p);

  P = R_D_qIv(log_p, p); /* if exp(p) underflows, we fix below */

  let neg = (!lower_tail || P < 0.5) && (lower_tail || P > 0.5);
  let is_neg_lower = lower_tail === neg; /* both TRUE or FALSE == !xor */
  if (neg)
    P = 2 * (log_p ? (lower_tail ? P : -expm1(p)) : R_D_Lval(lower_tail, p));
  else P = 2 * (log_p ? (lower_tail ? -expm1(p) : P) : R_D_Cval(lower_tail, p));
  /* 0 <= P <= 1 ; P = 2*min(P', 1 - P')  in all cases */

  if (fabs(ndf - 2) < eps) {
    /* df ~= 2 */
    if (P > DBL_MIN) {
      if (3 * P < DBL_EPSILON)
        /* P ~= 0 */
        q = 1 / sqrt(P);
      else if (P > 0.9)
        /* P ~= 1 */
        q = (1 - P) * sqrt(2 / (P * (2 - P))); /* eps/3 <= P <= 0.9 */
      else q = sqrt(2 / (P * (2 - P)) - 2);
    } else {
      /* P << 1, q = 1/sqrt(P) = ... */
      if (log_p) q = is_neg_lower ? exp(-p / 2) / M_SQRT2 : 1 / sqrt(-expm1(p));
      else q = ML_POSINF;
    }
  } else if (ndf < 1 + eps) {
    /* df ~= 1  (df < 1 excluded above): Cauchy */
    if (P === 1) q = 0;
    else if (P > 0)
      // some versions of tanpi give Inf, some NaN
      q = 1 / tanpi(P / 2);
    else {
      /* == - tan((P+1) * M_PI_2) -- suffers for P ~= 0 */

      /* P = 0, but maybe = 2*exp(p) ! */
      if (log_p)
        /* 1/tan(e) ~ 1/e */
        q = is_neg_lower ? M_1_PI * exp(-p) : -1 / (M_PI * expm1(p));
      else q = ML_POSINF;
    }
  } else {
    /*-- usual case;  including, e.g.,  df = 1.1 */
    let x = 0;
    let y = 0;
    let log_P2 = 0 /* -Wall */;
    let a = 1 / (ndf - 0.5);
    let b = 48 / (a * a);
    let c = ((20700 * a / b - 98) * a - 16) * a + 96.36;
    let d = ((94.5 / (b + c) - 3) / b + 1) * sqrt(a * M_PI_2) * ndf;

    let P_ok1 = P > DBL_MIN || !log_p;
    let P_ok = P_ok1;

    if (P_ok1) {
      y = pow(d * P, 2.0 / ndf);
      P_ok = y >= DBL_EPSILON;
    }
    if (!P_ok) {
      // log.p && P very.small  ||  (d*P)^(2/df) =: y < eps_c
      log_P2 = is_neg_lower
        ? R_D_log(log_p, p)
        : R_D_LExp(log_p, p); /* == log(P / 2) */
      x = (log(d) + M_LN2 + log_P2) / ndf;
      y = exp(2 * x);
    }

    if ((ndf < 2.1 && P > 0.5) || y > 0.05 + a) {
      /* P > P0(df) */
      /* Asymptotic inverse expansion about normal */
      if (P_ok)
        x = normal.qnorm(
          0.5 * P,
          0,
          1,
          /*lower_tail*/ false,
          /*log_p*/ false
        ); /* log_p && P underflowed */
      else x = normal.qnorm(log_P2, 0, 1, lower_tail, /*log_p*/ true);

      y = x * x;
      if (ndf < 5) c += 0.3 * (ndf - 4.5) * (x + 0.6);
      c = (((0.05 * d * x - 5) * x - 7) * x - 2) * x + b + c;
      y = (((((0.4 * y + 6.3) * y + 36) * y + 94.5) / c - y - 3) / b + 1) * x;
      y = expm1(a * y * y);
      q = sqrt(ndf * y);
    } else if (!P_ok && x < -M_LN2 * DBL_MANT_DIG) {
      /* 0.5* log(DBL_EPSILON) */
      /* y above might have underflown */
      q = sqrt(ndf) * exp(-x);
    } else {
      /* re-use 'y' from above */
      y =
        ((1 / (((ndf + 6) / (ndf * y) - 0.089 * d - 0.822) * (ndf + 2) * 3) +
          0.5 / (ndf + 4)) *
          y -
          1) *
          (ndf + 1) /
          (ndf + 2) +
        1 / y;
      q = sqrt(ndf * y);
    }

    /* Now apply 2-term Taylor expansion improvement (1-term = Newton):
     * as by Hill (1981) [ref.above] */

    /* FIXME: This can be far from optimal when log_p = TRUE
     *      but is still needed, e.g. for qt(-2, df=1.01, log=TRUE).
     *	Probably also improvable when  lower_tail = FALSE */

    if (P_ok1) {
      let it = 0;
      while (
        it++ < 10 &&
        (y = dt(q, ndf, false, normal)) > 0 &&
        R_FINITE((x = (pt(q, ndf, false, false, normal) - P / 2) / y)) &&
        fabs(x) > 1e-14 * fabs(q)
      )
        /* Newton (=Taylor 1 term):
         *  q += x;
         * Taylor 2-term : */
        q += x * (1 + x * q * (ndf + 1) / (2 * (q * q + ndf)));
    }
  }
  if (neg) q = -q;
  return q;
}
