/*

 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 09, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 2005-6 Morten Welinder <terra@gnome.org>
 *  Copyright (C) 2005-10 The R Foundation
 *  Copyright (C) 2006-2015 The R Core Team
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
 *	#include <Rmath.h>
 *
 *	double pgamma (double x, double alph, double scale,
 *		       int lowerTail, int logP)
 *
 *	double log1pmx	(double x)
 *	double lgamma1p (double a)
 *
 *	double logspace_add (double logx, double logy)
 *	double logspace_sub (double logx, double logy)
 *	double logspace_sum (double* logx, int n)
 *
 *
 *  DESCRIPTION
 *
 *	This function computes the distribution function for the
 *	gamma distribution with shape parameter alph and scale parameter
 *	scale.	This is also known as the incomplete gamma function.
 *	See Abramowitz and Stegun (6.5.1) for example.
 *
 *  NOTES
 *
 *	Complete redesign by Morten Welinder, originally for Gnumeric.
 *	Improvements (e.g. "while NEEDED_SCALE") by Martin Maechler
 *
 *  REFERENCES
 *
 */

/*----------- DEBUGGING -------------
 * make CFLAGS='-DDEBUG_p -g'
 * (cd `R-devel RHOME`/src/nmath; gcc -I. -I../../src/include -I../../../R/src/include  -DHAVE_CONFIG_H -fopenmp -DDEBUG_p -g -c ../../../R/src/nmath/pgamma.c -o pgamma.o)
 */

/* Scalefactor:= (2^32)^8 = 2^256 = 1.157921e+77 */

import * as debug from 'debug';

import {
  DBL_MAX_EXP,
  ML_ERR_return_NAN,
  R_D__0,
  R_D__1,
  R_D_exp,
  R_DT_0,
  R_DT_1,
  R_P_bounds_01
} from '../common/_general';

import { R_Log1_Exp } from '../exp/expm1';
import { dnorm4 as dnorm } from '../normal/dnorm';
import { pnorm5 as pnorm } from '../normal/pnorm';
import { dpois_raw } from '../poisson/dpois';
import { lgammafn } from './lgamma_fn';
//import { logspace_add } from './logspace-add';

const {
  LN2:M_LN2,
  log1p,
  expm1,
  sqrt,
  floor,
  pow,
  log,
  exp,
  max: fmax2,
  abs: fabs
} = Math;
const {
  isNaN: ISNAN,
  MIN_VALUE: DBL_MIN,
  EPSILON: DBL_EPSILON,
  isFinite: R_FINITE,
 // NEGATIVE_INFINITY: ML_NEGINF,
  POSITIVE_INFINITY:ML_POSINF
} = Number;

const { isArray } = Array;
const sqr = (x: number) => x * x;
const scalefactor = sqr(sqr(sqr(4294967296.0)));

/* If |x| > |k| * M_cutoff,  then  log[ exp(-x) * k^x ]	 =~=  -x */
const M_cutoff = M_LN2 * DBL_MAX_EXP / DBL_EPSILON; /*=3.196577e18*/

/* Continued fraction for calculation of
 *    1/i + x/(i+d) + x^2/(i+2*d) + x^3/(i+3*d) + ... = sum_{k=0}^Inf x^k/(i+k*d)
 *
 * auxilary in log1pmx() and lgamma1p()
 */
function logcf(
  x: number,
  i: number,
  d: number,
  eps: number /* ~ relative tolerance */
) {
  let c1 = 2 * d;
  let c2 = i + d;
  let c4 = c2 + d;
  let a1 = c2;
  let b1 = i * (c2 - i * x);
  let b2 = d * d * x;
  let a2 = c4 * c2 - b2;
  /*
  #if 0
      assert (i > 0);
      assert (d >= 0);
  #endif
  */
  b2 = c4 * b1 - i * b2;

  while (fabs(a2 * b1 - a1 * b2) > fabs(eps * b1 * b2)) {
    let c3 = c2 * c2 * x;
    c2 += d;
    c4 += d;
    a1 = c4 * a2 - c3 * a1;
    b1 = c4 * b2 - c3 * b1;

    c3 = c1 * c1 * x;
    c1 += d;
    c4 += d;
    a2 = c4 * a1 - c3 * a2;
    b2 = c4 * b1 - c3 * b2;

    if (fabs(b2) > scalefactor) {
      a1 /= scalefactor;
      b1 /= scalefactor;
      a2 /= scalefactor;
      b2 /= scalefactor;
    } else if (fabs(b2) < 1 / scalefactor) {
      a1 *= scalefactor;
      b1 *= scalefactor;
      a2 *= scalefactor;
      b2 *= scalefactor;
    }
  }

  return a2 / b2;
}

/* Accurate calculation of log(1+x)-x, particularly for small x.  */
function log1pmx(x: number) {
  const minLog1Value = -0.79149064;

  if (x > 1 || x < minLog1Value) return log1p(x) - x;
  else {
    /* -.791 <=  x <= 1  -- expand in  [x/(2+x)]^2 =: y :
      * log(1+x) - x =  x/(2+x) * [ 2 * y * S(y) - x],  with
      * ---------------------------------------------
      * S(y) = 1/3 + y/5 + y^2/7 + ... = \sum_{k=0}^\infty  y^k / (2k + 3)
     */
    let r = x / (2 + x);
    let y = r * r;
    if (fabs(x) < 1e-2) {
      let two = 2;
      return (
        r * ((((two / 9 * y + two / 7) * y + two / 5) * y + two / 3) * y - x)
      );
    } else {
      let tol_logcf = 1e-14;
      return r * (2 * y * logcf(y, 3, 2, tol_logcf) - x);
    }
  }
}

/* Compute  log(gamma(a+1))  accurately also for small a (0 < a < 0.5). */
export function lgamma1p(a: number) {
  const eulers_const = 0.5772156649015328606065120900824024;

  /* coeffs[i] holds (zeta(i+2)-1)/(i+2) , i = 0:(N-1), N = 40 : */
  const N = 40;
  const coeffs = [
    0.3224670334241132182362075833230126 /* = (zeta(2)-1)/2 */,
    0.6735230105319809513324605383715e-1 /* = (zeta(3)-1)/3 */,
    0.2058080842778454787900092413529198e-1,
    0.7385551028673985266273097291406834e-2,
    0.2890510330741523285752988298486755e-2,
    0.1192753911703260977113935692828109e-2,
    0.5096695247430424223356548135815582e-3,
    0.2231547584535793797614188036013401e-3,
    0.994575127818085337145958900319017e-4,
    0.4492623673813314170020750240635786e-4,
    0.2050721277567069155316650397830591e-4,
    0.9439488275268395903987425104415055e-5,
    0.4374866789907487804181793223952411e-5,
    0.2039215753801366236781900709670839e-5,
    0.9551412130407419832857179772951265e-6,
    0.4492469198764566043294290331193655e-6,
    0.2120718480555466586923135901077628e-6,
    0.1004322482396809960872083050053344e-6,
    0.476981016936398056576019341724673e-7,
    0.2271109460894316491031998116062124e-7,
    0.1083865921489695409107491757968159e-7,
    0.5183475041970046655121248647057669e-8,
    0.2483674543802478317185008663991718e-8,
    0.119214014058609120744254820277464e-8,
    0.5731367241678862013330194857961011e-9,
    0.2759522885124233145178149692816341e-9,
    0.1330476437424448948149715720858008e-9,
    0.6422964563838100022082448087644648e-10,
    0.3104424774732227276239215783404066e-10,
    0.1502138408075414217093301048780668e-10,
    0.7275974480239079662504549924814047e-11,
    0.3527742476575915083615072228655483e-11,
    0.1711991790559617908601084114443031e-11,
    0.8315385841420284819798357793954418e-12,
    0.4042200525289440065536008957032895e-12,
    0.1966475631096616490411045679010286e-12,
    0.9573630387838555763782200936508615e-13,
    0.4664076026428374224576492565974577e-13,
    0.2273736960065972320633279596737272e-13,
    0.1109139947083452201658320007192334e-13 /* = (zeta(40+1)-1)/(40+1) */
  ];

  const c = 0.2273736845824652515226821577978691e-12; /* zeta(N+2)-1 */
  const tol_logcf = 1e-14;
  let lgam;
  let i;

  if (fabs(a) >= 0.5) return lgammafn(a + 1);

  /* Abramowitz & Stegun 6.1.33 : for |x| < 2,
   * <==> log(gamma(1+x)) = -(log(1+x) - x) - gamma*x + x^2 * \sum_{n=0}^\infty c_n (-x)^n
   * where c_n := (Zeta(n+2) - 1)/(n+2)  = coeffs[n]
   *
   * Here, another convergence acceleration trick is used to compute
   * lgam(x) :=  sum_{n=0..Inf} c_n (-x)^n
   */
  lgam = c * logcf(-a / 2, N + 2, 1, tol_logcf);
  for (i = N - 1; i >= 0; i--) lgam = coeffs[i] - a * lgam;

  return (a * lgam - eulers_const) * a - log1pmx(a);
} /* lgamma1p */

/*
 * Compute the; log of a sum from logs of terms, i.e.,
 *
 *     log (sum_i  exp (logx[i]) ) =
 *     log (e ^M * sum_i  e ^ (logx[i] - M) ) =
 *     M + log( sum_i  e ^ (logx[i] - M)
 *
 * without causing overflows or throwing much accuracy.
 * /

function logspace_sum(logx: number[], n: number): number {
  if (n === 0) return ML_NEGINF; // = log( sum(<empty>) )
  if (n === 1) return logx[0];
  if (n === 2) return logspace_add(logx[0], logx[1]);
  // else (n >= 3) :
  let i;
  // Mx := max_i log(x_i)
  let Mx = logx[0];
  for (i = 1; i < n; i++) if (Mx < logx[i]) Mx = logx[i];
  let s = 0;
  for (i = 0; i < n; i++) s += exp(logx[i] - Mx);
  return Mx + log(s);
};

// log(1 - exp(x))  in more stable form than log1p(- R_D_qIv(x)) :
/*export function R_Log1_Exp(x: number): number {
  return (
    x > -M_LN2 ? log(-expm1(x)) : log1p(-exp(x)));
}*/
/* dpois_wrap (x__1, lambda) := dpois(x__1 - 1, lambda);  where
 * dpois(k, L) := exp(-L) L^k / gamma(k+1)  {the usual Poisson probabilities}
 *
 * and  dpois*(.., give_log = TRUE) :=  log( dpois*(..) )
*/
const pr_dpois_wrap = debug('dpois_wrap');

function dpois_wrap(
  x_plus_1: number,
  lambda: number,
  give_log: boolean
): number {
  pr_dpois_wrap(
    'dpois_wrap(x+1=%d, lambda=%d, log=%s)',
    x_plus_1,
    lambda,
    give_log
  );

  if (!R_FINITE(lambda)) {
    return R_D__0(give_log);
  }
  if (x_plus_1 > 1) return dpois_raw(x_plus_1 - 1, lambda, give_log);
  if (lambda > fabs(x_plus_1 - 1) * M_cutoff)
    return R_D_exp(give_log, -lambda - lgammafn(x_plus_1));
  else {
    let d = dpois_raw(x_plus_1, lambda, give_log);
    pr_dpois_wrap('  -> d=dpois_raw(..)=%d', d);
    return give_log ? d + log(x_plus_1 / lambda) : d * (x_plus_1 / lambda);
  }
}

/*
 * Abramowitz and Stegun 6.5.29 [right]
 */
const pr_pgamma_smallx = debug('pgamma_smallx');

function pgamma_smallx(
  x: number,
  alph: number,
  lowerTail: boolean,
  logP: boolean
): number {
  let sum = 0;
  let c = alph;
  let n = 0;
  let term;

  pr_pgamma_smallx(' pg_smallx(x=%d, alph=%d): ', x, alph);

  /*
   * Relative to 6.5.29 all terms have been multiplied by alph
   * and the first, thus being 1, is omitted.
   */

  do {
    n++;
    c *= -x / n;
    term = c / (alph + n);
    sum += term;
  } while (fabs(term) > DBL_EPSILON * fabs(sum));

  pr_pgamma_smallx('%d terms --> conv.sum=%d;', n, sum);
  if (lowerTail) {
    let f1 = logP ? log1p(sum) : 1 + sum;
    let f2;
    if (alph > 1) {
      f2 = dpois_raw(alph, x, logP);
      f2 = logP ? f2 + x : f2 * exp(x);
    } else if (logP) f2 = alph * log(x) - lgamma1p(alph);
    else f2 = pow(x, alph) / exp(lgamma1p(alph));

    pr_pgamma_smallx(' (f1,f2)= (%d,%d)', f1, f2);
    return logP ? f1 + f2 : f1 * f2;
  } else {
    let lf2 = alph * log(x) - lgamma1p(alph);
    pr_pgamma_smallx(' 1:%d  2:%d', alph * log(x), lgamma1p(alph));
    pr_pgamma_smallx(' sum=%d  log(1+sum)=%d	 lf2=%d', sum, log1p(sum), lf2);

    if (logP) return R_Log1_Exp(log1p(sum) + lf2);
    else {
      let f1m1 = sum;
      let f2m1 = expm1(lf2);
      return -(f1m1 + f2m1 + f1m1 * f2m1);
    }
  }
} /* pgamma_smallx() */

function pd_upper_series(x: number, y: number, logP: boolean): number {
  let term = x / y;
  let sum = term;

  do {
    y++;
    term *= x / y;
    sum += term;
  } while (term > sum * DBL_EPSILON);

  /* sum =  \sum_{n=1}^ oo  x^n     / (y*(y+1)*...*(y+n-1))
   *	   =  \sum_{n=0}^ oo  x^(n+1) / (y*(y+1)*...*(y+n))
   *	   =  x/y * (1 + \sum_{n=1}^oo	x^n / ((y+1)*...*(y+n)))
   *	   ~  x/y +  o(x/y)   {which happens when alph -> Inf}
   */
  return logP ? log(sum) : sum;
}

/* Continued fraction for calculation of
 *    scaled upper-tail F_{gamma}
 *  ~=  (y / d) * [1 +  (1-y)/d +  O( ((1-y)/d)^2 ) ]
 */
const pr_pd_lower_cf = debug('pd_lower_cf');

function pd_lower_cf(y: number, d: number): number {
  let f = 0.0; /* -Wall */
  let of;
  let f0;
  let i;
  let c2;
  let c3;
  let c4;
  let a1;
  let b1;
  let a2;
  let b2;

  const max_it = 200000;

  pr_pd_lower_cf('pd_lower_cf(y=%d, d=%d)', y, d);

  if (y === 0) return 0;

  f0 = y / d;
  /* Needed, e.g. for  pgamma(10^c(100,295), shape= 1.1, log=TRUE): */
  if (fabs(y - 1) < fabs(d) * DBL_EPSILON) {
    /* includes y < d = Inf */
    pr_pd_lower_cf(' very small "y" -> returning (y/d)');
    return f0;
  }

  if (f0 > 1) f0 = 1;
  c2 = y;
  c4 = d; /* original (y,d), *not* potentially scaled ones!*/

  a1 = 0;
  b1 = 1;
  a2 = y;
  b2 = d;

  while (b2 > scalefactor) {
    a1 /= scalefactor;
    b1 /= scalefactor;
    a2 /= scalefactor;
    b2 /= scalefactor;
  }

  i = 0;
  of = -1; /* far away */
  while (i < max_it) {
    i++;
    c2--;
    c3 = i * c2;
    c4 += 2;
    /* c2 = y - i,  c3 = i(y - i),  c4 = d + 2i,  for i odd */
    a1 = c4 * a2 + c3 * a1;
    b1 = c4 * b2 + c3 * b1;

    i++;
    c2--;
    c3 = i * c2;
    c4 += 2;
    /* c2 = y - i,  c3 = i(y - i),  c4 = d + 2i,  for i even */
    a2 = c4 * a1 + c3 * a2;
    b2 = c4 * b1 + c3 * b2;

    if (b2 !== 0) {
      f = a2 / b2;
      /* convergence check: relative; "absolute" for very small f : */
      if (fabs(f - of) <= DBL_EPSILON * fmax2(f0, fabs(f))) {
        pr_pd_lower_cf(' %d iter.\n', i);
        return f;
      }
      of = f;
    }
  }

  pr_pd_lower_cf(" ** NON-convergence in pgamma()'s pd_lower_cf() f= %d.", f);
  return f; /* should not happen ... */
} /* pd_lower_cf() */

const pr_pd_lower_series = debug('pd_lower_series');

function pd_lower_series(lambda: number, y: number): number {
  let term = 1;
  let sum = 0;

  pr_pd_lower_series('pd_lower_series(lam=%d, y=%d) ...', lambda, y);

  while (y >= 1 && term > sum * DBL_EPSILON) {
    term *= y / lambda;
    sum += term;
    y--;
  }
  /* sum =  \sum_{n=0}^ oo  y*(y-1)*...*(y - n) / lambda^(n+1)
   *	   =  y/lambda * (1 + \sum_{n=1}^Inf  (y-1)*...*(y-n) / lambda^n)
   *	   ~  y/lambda + o(y/lambda)
   */

  pr_pd_lower_series(' done: term=%d, sum=%d, y= %d', term, sum, y);

  if (y !== floor(y)) {
    /*
     * The series does not converge as the terms start getting
     * bigger (besides flipping sign) for y < -lambda.
     */
    let f;

    pr_pd_lower_series(' y not int: add another term ');

    /* FIXME: in quite few cases, adding  term*f  has no effect (f too small)
     *	  and is unnecessary e.g. for pgamma(4e12, 121.1) */
    f = pd_lower_cf(y, lambda + 1 - y);
    pr_pd_lower_series('  (= %d) * term = %d to sum %d', f, term * f, sum);

    sum += term * f;
  }

  return sum;
} /* pd_lower_series() */

/*
 * Compute the following ratio with higher accuracy that would be had
 * from doing it directly.
 *
 *		 dnorm (x, 0, 1, FALSE)
 *	   ----------------------------------
 *	   pnorm (x, 0, 1, lowerTail, FALSE)
 *
 * Abramowitz & Stegun 26.2.12
 */
function dpnorm(
  x: number,
  lowerTail: boolean,
  lp: number
): number {
  /*
   * So as not to repeat a pnorm call, we expect
   *
   *	 lp == pnorm (x, 0, 1, lowerTail, TRUE)
   *
   * but use it only in the non-critical case where either x is small
   * or p==exp(lp) is close to 1.
   */

  if (x < 0) {
    x = -x;
    lowerTail = !lowerTail;
  }

  if (x > 10 && !lowerTail) {
    let term = 1 / x;
    let sum = term;
    let x2 = x * x;
    let i = 1;
    do {
      term *= -i / x2;
      sum += term;
      i += 2;
    } while (fabs(term) > DBL_EPSILON * sum);

    return 1 / sum;
  } else {
    let d = dnorm(x, 0, 1, false);
    return d / exp(lp);
  }
}

/*
 * Asymptotic expansion to calculate the probability that Poisson variate
 * has value <= x.
 * Various assertions about this are made (without proof) at
 * http://members.aol.com/iandjmsmith/PoissonApprox.htm
 */

const pr_ppois_asymp = debug('ppois_asymp');

function ppois_asymp(
  x: number,
  lambda: number,
  lowerTail: boolean,
  logP: boolean
): number {
  const coefs_a = [
    -1e99 /* placeholder used for 1-indexing */,
    2 / 3,
    -4 / 135,
    8 / 2835,
    16 / 8505,
    -8992 / 12629925,
    -334144 / 492567075,
    698752 / 1477701225
  ];

  const coefs_b = [
    -1e99 /* placeholder */,
    1 / 12,
    1 / 288,
    -139 / 51840,
    -571 / 2488320,
    163879 / 209018880,
    5246819 / 75246796800,
    -534703531 / 902961561600
  ];

  let elfb: number;
  let elfb_term: number;
  let res12: number;
  let res1_term: number;
  let res1_ig: number;
  let res2_term: number;
  let res2_ig: number;
  let dfm: number;
  let pt_: number;
  let s2pt: number;
  let f: number;
  let np: number;
  let i: number;

  dfm = lambda - x;
  /* If lambda is large, the distribution is highly concentrated
     about lambda.  So representation error in x or lambda can lead
     to arbitrarily large values of pt_ and hence divergence of the
     coefficients of this approximation.
  */
  pt_ = -log1pmx(dfm / x);
  s2pt = sqrt(2 * x * pt_);
  if (dfm < 0) s2pt = -s2pt;

  res12 = 0;
  res1_ig = res1_term = sqrt(x);
  res2_ig = res2_term = s2pt;
  for (i = 1; i < 8; i++) {
    res12 += res1_ig * coefs_a[i];
    res12 += res2_ig * coefs_b[i];
    res1_term *= pt_ / i;
    res2_term *= 2 * pt_ / (2 * i + 1);
    res1_ig = res1_ig / x + res1_term;
    res2_ig = res2_ig / x + res2_term;
  }

  elfb = x;
  elfb_term = 1;
  for (i = 1; i < 8; i++) {
    elfb += elfb_term * coefs_b[i];
    elfb_term /= x;
  }
  if (!lowerTail) elfb = -elfb;

  pr_ppois_asymp('res12 = %d   elfb=%d', elfb, res12);

  f = res12 / elfb;

  np = pnorm(s2pt, 0.0, 1.0, !lowerTail, logP);

  if (logP) {
    let n_d_over_p = dpnorm(s2pt, !lowerTail, np);
    pr_ppois_asymp(
      'pp*_asymp(): f=%d	 np=e^%d  nd/np=%d  f*nd/np=%d',
      f,
      np,
      n_d_over_p,
      f * n_d_over_p
    );
    return np + log1p(f * n_d_over_p);
  } else {
    let nd = dnorm(s2pt, 0, 1, logP);

    pr_ppois_asymp(
      'pp*_asymp(): f=%d	 np=%d  nd=%d  f*nd=%d',
      f,
      np,
      nd,
      f * nd
    );
    return np + f * nd;
  }
} /* ppois_asymp() */

const pr_pgamma_raw = debug('pgamma_raw');

export function pgamma_raw(
  x: number,
  alph: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number {
  /* Here, assume that  (x,alph) are not NA  &  alph > 0 . */

  let res;

  pr_pgamma_raw(
    'pgamma_raw(x=%d, alph=%d, low=%s, log=%s)',
    x,
    alph,
    lowerTail,
    logP
  );

  let rc = R_P_bounds_01(lowerTail, logP, x, 0, ML_POSINF);
  if (rc !== undefined) {
    return rc;
  }

  if (x < 1) {
    res = pgamma_smallx(x, alph, lowerTail, logP);
  } else if (x <= alph - 1 && x < 0.8 * (alph + 50)) {
    /* incl. large alph compared to x */
    let sum = pd_upper_series(x, alph, logP); /* = x/alph + o(x/alph) */
    let d = dpois_wrap(alph, x, logP);
    pr_pgamma_raw(
      ' alph "large": sum=pd_upper*()= %d, d=dpois_w(*)= %d',
      sum,
      d
    );
    if (!lowerTail) res = logP ? R_Log1_Exp(d + sum) : 1 - d * sum;
    else res = logP ? sum + d : sum * d;
  } else if (alph - 1 < x && alph < 0.8 * (x + 50)) {
    /* incl. large x compared to alph */
    let sum;
    let d = dpois_wrap(alph, x, logP);
    pr_pgamma_raw('  x "large": d=dpois_w(*)= %d ', d);

    if (alph < 1) {
      if (x * DBL_EPSILON > 1 - alph) sum = R_D__1(logP);
      else {
        let f = pd_lower_cf(alph, x - (alph - 1)) * x / alph;
        /* = [alph/(x - alph+1) + o(alph/(x-alph+1))] * x/alph = 1 + o(1) */
        sum = logP ? log(f) : f;
      }
    } else {
      sum = pd_lower_series(x, alph - 1); /* = (alph-1)/x + o((alph-1)/x) */
      sum = logP ? log1p(sum) : 1 + sum;
    }

    pr_pgamma_raw(', sum= %d', sum);
    if (!lowerTail) res = logP ? sum + d : sum * d;
    else res = logP ? R_Log1_Exp(d + sum) : 1 - d * sum;
  } else {
    /* x >= 1 and x fairly near alph. */

    pr_pgamma_raw(' using ppois_asymp()');
    res = ppois_asymp(alph - 1, x, !lowerTail, logP);
  }

  /*
   * We lose a fair amount of accuracy to underflow in the cases
   * where the final result is very close to DBL_MIN.	 In those
   * cases, simply redo via log space.
   */
  if (!logP && res < DBL_MIN / DBL_EPSILON) {
    /* with(.Machine, double.xmin / double.eps) #|-> 1.002084e-292 */

    pr_pgamma_raw(' very small res=%.14g; -> recompute via log\n', res);
    return exp(pgamma_raw(x, alph, lowerTail, true));
  } else return res;
}

const printer_pgamma = debug('pgamma');
export function pgamma<T>(
  q: T,
  shape: number,
  scale: number,
  lowerTail: boolean,
  logP: boolean
): T {
  const fa: number[] = isArray(q) ? q : ([q] as any);

  const result = fa.map(x => {
    if (ISNAN(x) || ISNAN(shape) || ISNAN(scale)) {
      return x + shape + scale;
    }
    if (shape < 0 || scale <= 0) return ML_ERR_return_NAN(printer_pgamma);
    x /= scale;

    if (ISNAN(x))
      /* eg. original x = scale = +Inf */
      return x;
    if (shape === 0)
      /* limit case; useful e.g. in pnchisq() */
      return x <= 0
        ? R_DT_0(lowerTail, logP)
        : R_DT_1(lowerTail, logP); /* <= assert  pgamma(0,0) ==> 0 */
    return pgamma_raw(x, shape, lowerTail, logP);
  });
  return result.length === 1 ? result[0] : (result as any);
}
/* From: terra@gnome.org (Morten Welinder)
 * To: R-bugs@biostat.ku.dk
 * Cc: maechler@stat.math.ethz.ch
 * Subject: Re: [Rd] pgamma discontinuity (PR#7307)
 * Date: Tue, 11 Jan 2005 13:57:26 -0500 (EST)

 * this version of pgamma appears to be quite good and certainly a vast
 * improvement over current R code.  (I last looked at 2.0.1)  Apart from
 * type naming, this is what I have been using for Gnumeric 1.4.1.

 * This could be included into R as-is, but you might want to benefit from
 * making logcf, log1pmx, lgamma1p, and possibly logspace_add/logspace_sub
 * available to other parts of R.

 * MM: I've not (yet?) taken  logcf(), but the other four
 */
