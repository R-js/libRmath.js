/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 23, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 2003-2007     The R Foundation
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2, or (at your option)
 *  any later version.
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
 *
 *  SYNOPSIS
 *
 *	#include <Rmath.h>
 *	void rmultinom(int n, double* prob, int K, int* rN);
 *
 *  DESCRIPTION
 *
 *	Random Vector from the multinomial distribution.
 *             ~~~~~~
 *  NOTE
 *	Because we generate random _vectors_ this doesn't fit easily
 *	into the do_random[1-4](.) framework setup in ../main/random.c
 *	as that is used only for the univariate random generators.
 *      Multivariate distributions typically have too complex parameter spaces
 *	to be treated uniformly.
 *	=> Hence also can have  int arguments.
 */

import * as debug from 'debug';

const { isFinite: R_FINITE } = Number;
const { abs: fabs } = Math;

import { rbinom } from '../binomial/rbinom';
import { flatten, possibleScalar, seq, sum } from '../r-func';
import { IRNG } from '../rng/irng';

const printer_rmultinom = debug('rmultinom');
const sequence = seq()();

export function rmultinom(
  n: number,
  size: number,
  prob: number | number[],
  rng: IRNG
): (number[]) | (number[][]) {
  const result = sequence(n).map(() => _rmultinom(size, prob, rng));
  return possibleScalar(result);
}

//workhorse
function _rmultinom(
  size: number,
  prob: number | number[],
  rng: IRNG
): number[] {
  /* `Return' vector  rN[1:K] {K := length(prob)}
     *  where rN[j] ~ Bin(n, prob[j]) ,  sum_j rN[j] == n,  sum_j prob[j] == 1,
     */
  const rN: number[] = [];
  let p = flatten(prob);
  const K = p.length;
  //let pp;
  /* This calculation is sensitive to exact values, so we try to
       ensure that the calculations are as accurate as possible
       so different platforms are more likely to give the same
       result. */

  if (p.length === 0) {
    printer_rmultinom('list of probabilities cannot be empty');
    return rN;
  }
  if (size < 0) {
    printer_rmultinom('Illegal Argument:size is negative');
    rN.splice(0);
    return rN;
  }
  /* Note: prob[K] is only used here for checking  sum_k prob[k] = 1 ;
     *       Could make loop one shorter and drop that check !
     */
  //check probabilities
  if (p.find(pp => !R_FINITE(pp) || pp < 0)) {
    printer_rmultinom('some propbabilities are invalid or negative numbers');
    rN.splice(0);
    return rN;
  }

  rN.splice(0, rN.length, ...new Array(K).fill(0)); //remove, insert and init

  if (size === 0) {
    return rN;
  }
  /* Generate the first K-1 obs. via binomials */
  // context vars for the next loop
  let _size = size;
  let p_tot = sum(p);

  printer_rmultinom('%o', { p, p_tot, _size, K, rN });
  for (let k = 0; k < K - 1; k++) {
    //can happen, protect against devide by zero
    if (fabs(p_tot) < Number.EPSILON) {
      rN[k] = _size;
      _size = 0;
      p_tot = 0;
      continue;
    }

    const pp = p[k] / p_tot;

    if (pp === 0) {
      rN[k] = 0;
      continue;
    }
    // nothing left, rest will be zero
    if (_size === 0) {
      rN[k] = 0;
      continue;
    }
    /* printf("[%d] %.17f\n", k+1, pp); */
    rN[k] = pp < 1 ? (rbinom(1, _size, pp, rng) as number) : _size;
    //adjust size
    _size -= rN[k];
    //adjust probabilities
    p_tot -= p[k];
    printer_rmultinom('%o', { p_tot, _size, k, rN });
  }
  rN[K - 1] = _size; //left over
  return rN;
}
