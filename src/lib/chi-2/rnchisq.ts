/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 23, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 2003--2015 The R Foundation
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
 *    double rnchisq(double df, double lambda);
 *
 *  DESCRIPTION
 *
 *    Random variates from the NON CENTRAL chi-squared distribution.
 *
 *  NOTES
 *
 According to Hans R. Kuensch's suggestion (30 sep 2002):

  It should be easy to do the general case (ncp > 0) by decomposing it
  as the sum of a central chisquare with df degrees of freedom plus a
  noncentral chisquare with zero degrees of freedom (which is a Poisson
  mixture of central chisquares with integer degrees of freedom),
  see Formula (29.5b-c) in Johnson, Kotz, Balakrishnan (1995).

  The noncentral chisquare with arbitary degrees of freedom is of interest
  for simulating the Cox-Ingersoll-Ross model for interest rates in
  finance.

  R code that works is

    rchisq0 <- function(n, ncp) {
	p <- 0 < (K <- rpois(n, lambda = ncp / 2))
	r <- numeric(n)
	r[p] <- rchisq(sum(p), df = 2*K[p])
	r
    }

    rchisq <- function(n, df, ncp=0) {
	if(missing(ncp)) .Internal(rchisq(n, df))
	else rchisq0(n, ncp) + .Internal(rchisq(n, df))
    }
 */

import * as debug from 'debug';

import { R_FINITE, ML_ERR_return_NAN } from '~common';

import { rgamma } from '~gamma';
import { rpois } from '~poisson';
import { rchisq } from './rchisq';
import { INormal } from '~normal';
//import { unwatchFile } from 'fs';

const printer = debug('rnchisq');

export function rnchisq(
  n: number = 1,
  df: number,
  lambda: number,
  normal: INormal
): number| number[] {
  const result = new Array(n).fill(0).map(() => {
    if (!R_FINITE(df) || !R_FINITE(lambda) || df < 0 || lambda < 0){
      ML_ERR_return_NAN(printer);
    }
    if (lambda === 0) {
      return df === 0 ? 0 : (rgamma(1, df / 2, 2, normal) as number);
    } else {
      let r = rpois(1, lambda / 2, normal) as number;
      if (r > 0) r = rchisq(1, 2 * r, normal) as number;
      if (df > 0) r += rgamma(1, df / 2, 2, normal) as number;
      return r;
    }
  });
  return result.length === 1 ? result[0] :result;
}
