/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 23, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000--2006  The R Core Team
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
 *    double rnbinom(double n, double p)
 *
 *  DESCRIPTION
 *
 *    Random variates from the negative binomial distribution.
 *
 *  NOTES
 *
 *    x = the number of failures before the n-th success
 *
 *  REFERENCE
 *
 *    Devroye, L. (1986).
 *    Non-Uniform Random Variate Generation.
 *    New York:Springer-Verlag.  Pages 488 and 543.
 *
 *  METHOD
 *
 *    Generate lambda as gamma with shape parameter n and scale
 *    parameter p/(1-p).  Return a Poisson deviate with mean lambda.
 */

import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';

import { INormal } from '~normal';
import { rgamma } from '../gamma/rgamma';
import { rpois } from '../poisson/rpois';

const { isFinite: R_FINITE } = Number;

const printer_rnbinom = debug('rnbinom');

export function rnbinom(
  n: number,
  size: number,
  prob: number,
  normal: INormal
): number| number[] {
  printer_rnbinom('n:%d, size:%d, prob:%d', n, size, prob);
  const result = new Array(n).fill(0).map(() => {
    if (
      !R_FINITE(size) ||
      !R_FINITE(prob) ||
      size <= 0 ||
      prob <= 0 ||
      prob > 1
    ) {
      /* prob = 1 is ok, PR#1218 */
      return ML_ERR_return_NAN(printer_rnbinom);
    }
    return prob === 1
      ? 0
      : (rpois(
          1,
          rgamma(1, size, (1 - prob) / prob, normal) as number,
          normal.rng
        ) as number);
  });
  return result.length === 1 ? result[0] : result;
}

const printer_rnbinom_mu = debug('rnbinom_mu');

export function rnbinom_mu(n: number= 1, size: number, mu: number, normal: INormal): number| number[] {

  const result = new Array(n).fill(0).map(() => {

  if (!R_FINITE(size) || !R_FINITE(mu) || size <= 0 || mu < 0) {
    return ML_ERR_return_NAN(printer_rnbinom_mu);
  }
  return mu === 0
    ? 0
    : (rpois(
        1,
        rgamma(1, size, mu / size, normal) as number,
        normal.rng
      ) as number);

});
return result.length === 1 ? result[0] :result ;
}
