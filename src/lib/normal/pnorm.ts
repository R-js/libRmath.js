/*  AUTHOR
*  Jacob Bogers, jkfbogers@gmail.com
*  March 17, 2017
* 
*  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998	    Ross Ihaka
 *  Copyright (C) 2000-2013 The R Core Team
 *  Copyright (C) 2003	    The R Foundation
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
 *   #include <Rmath.h>
 *
 *   double pnorm5(double x, double mu, double sigma, int lower_tail,int log_p);
 *	   {pnorm (..) is synonymous and preferred inside R}
 *
 *   void   pnorm_both(double x, double *cum, double *ccum,
 *		       int i_tail, int log_p);
 *
 *  DESCRIPTION
 *
 *	The main computation evaluates near-minimax approximations derived
 *	from those in "Rational Chebyshev approximations for the error
 *	function" by W. J. Cody, Math. Comp., 1969, 631-637.  This
 *	transportable program uses rational functions that theoretically
 *	approximate the normal distribution function to at least 18
 *	significant decimal digits.  The accuracy achieved depends on the
 *	arithmetic system, the compiler, the intrinsic functions, and
 *	proper selection of the machine-dependent constants.
 *
 *  REFERENCE
 *
 *	Cody, W. D. (1993).
 *	ALGORITHM 715: SPECFUN - A Portable FORTRAN Package of
 *	Special Function Routines and Test Drivers".
 *	ACM Transactions on Mathematical Software. 19, 22-32.
 *
 *  EXTENSIONS
 *
 *  The "_both" , lower, upper, and log_p  variants were added by
 *  Martin Maechler, Jan.2000;
 *  as well as log1p() and similar improvements later on.
 *
 *  James M. Rath contributed bug report PR#699 and patches correcting SIXTEN
 *  and if() clauses {with a bug: "|| instead of &&" -> PR #2883) more in line
 *  with the original Cody code.
 */

import * as debug from 'debug';

import {
  M_1_SQRT_2PI,
  M_SQRT_32,
  ML_ERR_return_NAN,
  R_D__0,
  R_D__1,
  R_DT_0,
  R_DT_1
} from '../common/_general';

import { forEach } from '../r-func';

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  EPSILON: DBL_EPSILON,
  NaN: ML_NAN,
  MIN_VALUE: DBL_MIN
} = Number;

const { trunc, log, exp, abs: fabs, log1p } = Math;


import { NumberW } from '../common/toms708';

const SIXTEN = 16; /* Cutoff allowing exact "*" and "/" */
const printer = debug('pnorm5');

function do_del(
  ccum: NumberW,
  cum: NumberW,
  log_p: boolean,
  X: number,
  temp: number,
  upper: boolean,
  lower: boolean,
  x: number
): void {
  let xsq = trunc(X * SIXTEN) / SIXTEN;
  let del = (X - xsq) * (X + xsq);
  if (log_p) {
    cum.val = -xsq * xsq * 0.5 + -del * 0.5 + log(temp);
    if ((lower && x > 0) || (upper && x <= 0))
      ccum.val = log1p(-exp(-xsq * xsq * 0.5) * exp(-del * 0.5) * temp);
  } else {
    cum.val = exp(-xsq * xsq * 0.5) * exp(-del * 0.5) * temp;
    ccum.val = 1.0 - cum.val;
  }
}

export function pnorm5<T>(
  q: T,
  mu: number = 0,
  sigma: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): T {

  return forEach(q)( fx => {
    let p = new NumberW(0);
    let cp = new NumberW(0);

    /* Note: The structure of these checks has been carefully thought through.
     * For example, if x == mu and sigma == 0, we get the correct answer 1.
     */

    if (ISNAN(fx) || ISNAN(mu) || ISNAN(sigma)) return fx + mu + sigma;

    if (!R_FINITE(fx) && mu === fx) return ML_NAN; /* x-mu is NaN */
    if (sigma <= 0) {
      if (sigma < 0) return ML_ERR_return_NAN(printer);
      /* sigma = 0 : */
      return fx < mu ? R_DT_0(lowerTail, logP) : R_DT_1(lowerTail, logP);
    }
    p.val = (fx - mu) / sigma;
    if (!R_FINITE(p.val))
      return fx < mu ? R_DT_0(lowerTail, logP) : R_DT_1(lowerTail, logP);
    fx = p.val;

    pnorm_both(fx, p, cp, !lowerTail, logP);

    return lowerTail ? p.val : cp.val;
  }) as any;
}

export function pnorm_both(
  x: number,
  cum: NumberW,
  ccum: NumberW,
  i_tail: boolean,
  log_p: boolean
) {
  /* i_tail in {0,1,2} means: "lower", "upper", or "both" :
       if(lower) return  *cum := P[X <= x]
       if(upper) return *ccum := P[X >  x] = 1 - P[X <= x]
    */
  const a = [
    2.2352520354606839287,
    161.02823106855587881,
    1067.6894854603709582,
    18154.981253343561249,
    0.065682337918207449113
  ];
  const b = [
    47.20258190468824187,
    976.09855173777669322,
    10260.932208618978205,
    45507.789335026729956
  ];
  const c = [
    0.39894151208813466764,
    8.8831497943883759412,
    93.506656132177855979,
    597.27027639480026226,
    2494.5375852903726711,
    6848.1904505362823326,
    11602.651437647350124,
    9842.7148383839780218,
    1.0765576773720192317e-8
  ];
  const d = [
    22.266688044328115691,
    235.38790178262499861,
    1519.377599407554805,
    6485.558298266760755,
    18615.571640885098091,
    34900.952721145977266,
    38912.003286093271411,
    19685.429676859990727
  ];
  const p = [
    0.21589853405795699,
    0.1274011611602473639,
    0.022235277870649807,
    0.001421619193227893466,
    2.9112874951168792e-5,
    0.02307344176494017303
  ];
  const q = [
    1.28426009614491121,
    0.468238212480865118,
    0.0659881378689285515,
    0.00378239633202758244,
    7.29751555083966205e-5
  ];

  let xden;
  let xnum;
  let temp;
  let eps;
  let xsq;
  let y;

  let min = DBL_MIN;

  let i = new Int32Array([0]);
  let lower: boolean;
  let upper: boolean;

  if (ISNAN(x)) {
    cum.val = ccum.val = x;
    return;
  }

  /* Consider changing these : */
  eps = DBL_EPSILON * 0.5;

  /* i_tail in {0,1,2} =^= {lower, upper, both} */
  lower = i_tail !== true;
  upper = i_tail !== false;

  y = fabs(x);
  if (y <= 0.67448975) {
    /* qnorm(3/4) = .6744.... -- earlier had 0.66291 */
    if (y > eps) {
      xsq = x * x;
      xnum = a[4] * xsq;
      xden = xsq;
      for (i[0] = 0; i[0] < 3; ++i[0]) {
        xnum = (xnum + a[i[0]]) * xsq;
        xden = (xden + b[i[0]]) * xsq;
      }
    } else xnum = xden = 0.0;

    temp = x * (xnum + a[3]) / (xden + b[3]);
    if (lower) cum.val = 0.5 + temp;
    if (upper) ccum.val = 0.5 - temp;
    if (log_p) {
      if (lower) cum.val = log(cum.val);
      if (upper) ccum.val = log(ccum.val);
    }
  } else if (y <= M_SQRT_32) {
    /* Evaluate pnorm for 0.674.. = qnorm(3/4) < |x| <= sqrt(32) ~= 5.657 */

    xnum = c[8] * y;
    xden = y;
    for (i[0] = 0; i[0] < 7; ++i[0]) {
      xnum = (xnum + c[i[0]]) * y;
      xden = (xden + d[i[0]]) * y;
    }
    temp = (xnum + c[7]) / (xden + d[7]);

    //function do_del(ccum: NumberW, cum: NumberW, log_p: boolean, X: number, temp: number, upper: number, lower: number, x: number):
    /*
        #define swap_tail
            if (x > 0.) {// swap  ccum <--> cum 
                temp = *cum; if(lower) *cum = *ccum; *ccum = temp; \
            }
        */
    do_del(ccum, cum, log_p, y, temp, upper, lower, x);
    //swap_tail;
    if (x > 0) {
      // swap  ccum <--> cum
      temp = cum.val;
      if (lower) {
        cum.val = ccum.val;
      }
      ccum.val = temp;
    }
  } else if (
    (log_p && y < 1e170) /* avoid underflow below */ ||
    /*  ^^^^^ MM FIXME: can speedup for log_p and much larger |x| !
         * Then, make use of  Abramowitz & Stegun, 26.2.13, something like
    
         xsq = x*x;
    
         if(xsq * DBL_EPSILON < 1.)
            del = (1. - (1. - 5./(xsq+6.)) / (xsq+4.)) / (xsq+2.);
         else
            del = 0.;
         *cum = -.5*xsq - M_LN_SQRT_2PI - log(x) + log1p(-del);
         *ccum = log1p(-exp(*cum)); /.* ~ log(1) = 0 *./
    
          swap_tail;
    
         [Yes, but xsq might be infinite.]
    
        */
    (lower && -37.5193 < x && x < 8.2924) ||
    (upper && -8.2924 < x && x < 37.5193)
  ) {
    /* else	  |x| > sqrt(32) = 5.657 :
     * the next two case differentiations were really for lower=T, log=F
     * Particularly	 *not*	for  log_p !
    
     * Cody had (-37.5193 < x  &&  x < 8.2924) ; R originally had y < 50
     *
     * Note that we do want symmetry(0), lower/upper -> hence use y
     */
    /* Evaluate pnorm for x in (-37.5, -5.657) union (5.657, 37.5) */
    xsq = 1.0 / (x * x); /* (1./x)*(1./x) might be better */
    xnum = p[5] * xsq;
    xden = xsq;
    for (i[0] = 0; i[0] < 4; ++i[0]) {
      xnum = (xnum + p[i[0]]) * xsq;
      xden = (xden + q[i[0]]) * xsq;
    }
    temp = xsq * (xnum + p[4]) / (xden + q[4]);
    temp = (M_1_SQRT_2PI - temp) / y;
    do_del(ccum, cum, log_p, x, temp, upper, lower, x);
    //do_del(x);
    //swap_tail;
    if (x > 0) {
      // swap  ccum <--> cum
      temp = cum.val;
      if (lower) {
        cum.val = ccum.val;
      }
      ccum.val = temp;
    }
  } else {
    /* large x such that probs are 0 or 1 */
    if (x > 0) {
      cum.val = R_D__1(log_p);
      ccum.val = R_D__0(log_p);
    } else {
      cum.val = R_D__0(log_p);
      ccum.val = R_D__1(log_p);
    }
  }

  /* do not return "denormalized" -- we do in R */
  if (log_p) {
    if (cum.val > -min) cum.val = -0;
    if (ccum.val > -min) {
      ccum.val = -0;
    }
  } else {
    if (cum.val < min) cum.val = 0;
    if (ccum.val < min) ccum.val = 0;
  }

  return;
}
