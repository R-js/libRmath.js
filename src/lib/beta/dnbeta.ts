/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 4, 2017
 * 
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-12 The R Core Team
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
 *    double dnbeta(double x, double a, double b, double ncp, int give_log);
 *
 *  DESCRIPTION
 *
 *    Computes the density of the noncentral beta distribution with
 *    noncentrality parameter ncp.  The noncentral beta distribution
 *    has density:
 *
 *		       Inf
 *	f(x|a,b,ncp) = SUM  p(i) *  x^(a+i-1) * (1-x)^(b-1) / B(a+i,b)
 *		       i=0
 *
 *    where:
 *
 *		p(k) = exp(-ncp/2) (ncp/2)^k / k!
 *
 *	      B(a,b) = Gamma(a) * Gamma(b) / Gamma(a+b)
 *
 *
 *    This can be computed efficiently by using the recursions:
 *
 *	      p(k+1) = ncp/2 / (k+1) * p(k)
 *
 *      B(a+k+1,b)   = (a+k)/(a+b+k) * B(a+k,b)
 *
 * The new algorithm first determines for which k the k-th term is maximal,
 * and then sums outwards to both sides from the 'mid'.
 */
import * as debug from 'debug';

import {
  ML_ERR_return_NAN,
  R_D__0,
  R_D_exp
} from '../common/_general';

const { log, sqrt, ceil} = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;
const printer = debug('dnbeta');

import { dbeta } from './dbeta';

import { dpois_raw } from '../poisson/dpois';

//used by f-distriution

export function dnbeta<T>(
    xx: T,
    shape1: number = 0.5,
    shape2: number = 0.5,
    ncp: number = 0,
    log: boolean): T
    {
        const fa: number[] = Array.isArray(xx) ? xx :[xx] as any;
        const result = fa.map( x => _dnbeta(x, shape1, shape2, ncp, log));
        
        return result.length === 1 ? result[0] : result as any;
    }

function _dnbeta(
  x: number,
  a: number,
  b: number,
  ncp: number,
  give_log: boolean
): number {
  const eps = 1e-15;
  //int
  let kMax;
  //double
  let k;
  let ncp2;
  let dx2;
  let d;
  let D;
  let term;
  //long double
  let sum;
  let p_k;
  let q;

  if (ISNAN(x) || ISNAN(a) || ISNAN(b) || ISNAN(ncp)) return x + a + b + ncp;
  if (ncp < 0 || a <= 0 || b <= 0) {
    return ML_ERR_return_NAN(printer);
  }

  if (!R_FINITE(a) || !R_FINITE(b) || !R_FINITE(ncp)) {
    return ML_ERR_return_NAN(printer);
  }

  if (x < 0 || x > 1) {
    return R_D__0(give_log);
  }
  if (ncp === 0) {
    return dbeta(x, a, b, give_log);
  }
  /* New algorithm, starting with *largest* term : */
  ncp2 = 0.5 * ncp;
  dx2 = ncp2 * x;
  d = (dx2 - a - 1) / 2;
  D = d * d + dx2 * (a + b) - a;
  if (D <= 0) {
    kMax = 0;
  } else {
    D = ceil(d + sqrt(D));
    kMax = D > 0 ? D : 0;
  }

  /* The starting "middle term" --- first look at it's log scale: */
  term = dbeta(x, a + kMax, b, /* log = */ true);
  p_k = dpois_raw(kMax, ncp2, true);
  if (x === 0 || !R_FINITE(term) || !R_FINITE(p_k)) {
    /* if term = +Inf */
    return R_D_exp(give_log, p_k + term);
  }

  /* Now if s_k := p_k * t_k  {here = exp(p_k + term)} would underflow,
     * we should rather scale everything and re-scale at the end:*/

  p_k += term; /* = log(p_k) + log(t_k) == log(s_k) -- used at end to rescale */
  /* mid = 1 = the rescaled value, instead of  mid = exp(p_k); */

  /* Now sum from the inside out */
  sum = term = 1 /* = mid term */;
  /* middle to the left */
  k = kMax;
  while (k > 0 && term > sum * eps) {
    k--;
    q = /* 1 / r_k = */ (k + 1) * (k + a) / (k + a + b) / dx2;
    term *= q;
    sum += term;
  }
  /* middle to the right */
  term = 1;
  k = kMax;
  do {
    q = /* r_{old k} = */ dx2 * (k + a + b) / (k + a) / (k + 1);
    k++;
    term *= q;
    sum += term;
  } while (term > sum * eps);

  return R_D_exp(give_log, p_k + log(sum));
}
