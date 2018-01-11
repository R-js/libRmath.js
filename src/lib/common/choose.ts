/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Februari 20, 2017
 * 
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998      Ross Ihaka
 *  Copyright (C) 2004-2014 The R Foundation
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
 
 *  *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 * 
 *  License for R statistical package
 * https://www.r-project.org/Licenses/
 * 
*
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double choose(double n, double k);
 *    double lchoose(double n, double k);
 * (and private)
 *    double lfastchoose(double n, double k);
 *
 *  DESCRIPTION
 *
 *	Binomial coefficients.
 *	choose(n, k)   and  lchoose(n,k) := log(abs(choose(n,k))
 *
 *	These work for the *generalized* binomial theorem,
 *	i.e., are also defined for non-integer n  (integer k).
 *
 *  We use the simple explicit product formula for  k <= k_small_max
 *  and also have added statements to make sure that the symmetry
 *    (n \\ k ) == (n \\ n-k)  is preserved for non-negative integer n.
 */

/* These are recursive, so we should do a stack check */
import * as debug from 'debug';
import { isOdd } from '../common/_general';

const { abs: fabs, log, exp, round } = Math;
const { isInteger, NEGATIVE_INFINITY: ML_NEGINF, isNaN: ISNAN } = Number;

import { lbeta } from '../beta/lbeta';
import { lgammafn } from '../gamma/lgamma_fn';
import { lgammafn_sign } from '../gamma/lgammafn_sign';

// used by "qhyper"
function lfastchoose(n: number, k: number) {
  return -log(n + 1) - lbeta(n - k + 1, k + 1);
}
/* mathematically the same:
   less stable typically, but useful if n-k+1 < 0 : */

function lfastchoose2(n: number, k: number, sChoose?: number[]) {
  let r: number;
  r = lgammafn_sign(n - k + 1, sChoose);
  return lgammafn(n + 1) - lgammafn(k + 1) - r;
}

const printer_lchoose = debug('lchoose');
export function lchoose(n: number, k: number): number {
  let k0 = k;
  k = Math.round(k);
  /* NaNs propagated correctly */
  if (ISNAN(n) || ISNAN(k)) return n + k;
  if (fabs(k - k0) > 1e-7)
    printer_lchoose('"k" (%d) must be integer, rounded to %d', k0, k);
  if (k < 2) {
    if (k < 0) return ML_NEGINF;
    if (k === 0) return 0;
    /* else: k == 1 */
    return log(fabs(n));
  }
  /* else: k >= 2 */
  if (n < 0) {
    return lchoose(-n + k - 1, k);
  } else if (isInteger(n)) {
    n = round(n);
    if (n < k) return ML_NEGINF;
    /* k <= n :*/
    if (n - k < 2) return lchoose(n, n - k); /* <- Symmetry */
    /* else: n >= k+2 */
    return lfastchoose(n, k);
  }
  /* else non-integer n >= 0 : */
  if (n < k - 1) {
    return lfastchoose2(n, k);
  }
  return lfastchoose(n, k);
}

const k_small_max = 30;

/* 30 is somewhat arbitrary: it is on the *safe* side:
 * both speed and precision are clearly improved for k < 30.
*/
const printer_choose = debug('choose');

export function choose(n: number, k: number): number {
  let r: number;
  let k0 = k;
  k = round(k);
  /* NaNs propagated correctly */
  if (ISNAN(n) || ISNAN(k)) return n + k;
  if (fabs(k - k0) > 1e-7)
    printer_choose('k (%d) must be integer, rounded to %d', k0, k);
  if (k < k_small_max) {
    let j: number;
    if (n - k < k && n >= 0 && isInteger(n)) k = n - k; /* <- Symmetry */
    if (k < 0) return 0;
    if (k === 0) return 1;
    /* else: k >= 1 */
    r = n;
    for (j = 2; j <= k; j++) r *= (n - j + 1) / j;
    return isInteger(n) ? round(r) : r;
    /* might have got rounding errors */
  }
  /* else: k >= k_small_max */
  if (n < 0) {
    r = choose(-n + k - 1, k);
    if (isOdd(k)) r = -r;
    return r;
  } else if (isInteger(n)) {
    n = round(n);
    if (n < k) return 0;
    if (n - k < k_small_max) return choose(n, n - k); /* <- Symmetry */
    return round(exp(lfastchoose(n, k)));
  }
  /* else non-integer n >= 0 : */
  if (n < k - 1) {
    let schoose: number[] = [0];
    r = lfastchoose2(n, k, /* -> */ schoose);
    return schoose[0] * exp(r);
  }
  return exp(lfastchoose(n, k));
}
