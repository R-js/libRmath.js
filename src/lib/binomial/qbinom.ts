/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 18, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2009 The R Core Team
 *  Copyright (C) 2003-2009 The R Foundation
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
 *	The quantile function of the binomial distribution.
 *
 *  METHOD
 *
 *	Uses the Cornish-Fisher Expansion to include a skewness
 *	correction to a normal approximation.  This gives an
 *	initial value which never seems to be off by more than
 *	1 or 2.	 A search is then conducted of values close to
 *	this initial start point.
 */

import * as debug from 'debug';

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';

const { max: fmax2, min: fmin2, floor, sqrt } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, EPSILON: DBL_EPSILON } = Number;

import { R_DT_qIv } from '~exp-utils';
import { NumberW } from '../common/toms708';
import { qnorm } from '../normal/qnorm';
import { map } from '../r-func';
import { pbinom } from './pbinom';

const printer_do_search = debug('do_search');

function do_search(
  y: number,
  z: NumberW,
  p: number,
  n: number,
  pr: number,
  incr: number
): number {
  if (z.val >= p) {
    /* search to the left */

    printer_do_search(
      'new z=%o >= p = %d  --> search to left (y--) ..',
      z,
      p
    );

    while (true) {
      let newz: number;
      if (
        y === 0 ||
        (newz = pbinom(y - incr, n, pr, /*l._t.*/ true, /*log_p*/ false)) < p
      )
        return y;
      y = fmax2(0, y - incr);
      z.val = newz;
    }
  } else {
    /* search to the right */

    printer_do_search(
      'new z=%d < p = %d  --> search to right (y++) ..',
      z.val,
      p
    );

    while (true) {
      y = fmin2(y + incr, n);
      if (
        y === n ||
        (z.val = pbinom(y, n, pr, /*l._t.*/ true, /*log_p*/ false)) >= p
      )
        return y;
    }
  }
}

export function qbinom<T>(
  pp: T,
  n: number,
  pr: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  return map(pp)(p => _qbinom(p, n, pr, lowerTail, logP)) as any;
}

const printer_qbinom = debug('_qbinom');

function _qbinom(
  p: number,
  size: number,
  pr: number,
  lower_tail: boolean,
  log_p: boolean
): number {
  let q: number;
  let mu: number;
  let sigma: number;
  let gamma: number;
  const z = new NumberW(0);
  let y: number;

  if (ISNAN(p) || ISNAN(size) || ISNAN(pr)) return NaN;

  if (!R_FINITE(size) || !R_FINITE(pr)) {
    return ML_ERR_return_NAN(printer_qbinom);
  }
  /* if log_p is true, p = -Inf is a legitimate value */
  if (!R_FINITE(p) && !log_p) {
    return ML_ERR_return_NAN(printer_qbinom);
  }

  if (!Number.isInteger(size)) {
    return ML_ERR_return_NAN(printer_qbinom);
  }

  if (pr < 0 || pr > 1 || size < 0) {
    return ML_ERR_return_NAN(printer_qbinom);
  }

  let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, size);
  if (rc !== undefined) {
    return rc;
  }

  //edge cases

  if (pr === 0 || size === 0) return 0;

  q = 1 - pr;
  if (q === 0) return size; /* covers the full range of the distribution */

  mu = size * pr; //mean
  sigma = sqrt(size * pr * q); //standard deviation

  gamma = (q - pr) / sigma; // = (  (1 - pr)-pr )/sd = (1 - 2pr)/sd

  printer_qbinom(
    'qbinom(p=%d, n=%d, pr=%d, l.t.=%s, log=%s): sigm=%d, gam=%d',
    p,
    size,
    pr,
    lower_tail,
    log_p,
    sigma,
    gamma
  );

  /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
  if (!lower_tail || log_p) {
    p = R_DT_qIv(lower_tail, log_p, p); /* need check again (cancellation!): */
    if (p === 0) return 0;
    if (p === 1) return size;
  }
  /* temporary hack --- FIXME --- */
  //if (p + 1.01 * DBL_EPSILON >= 1.) return size;
  if (Math.abs(p - 1) < DBL_EPSILON) {
    return size;
  }

  /* y := approx.value (Cornish-Fisher expansion) :  */
  z.val = qnorm(p, 0, 1, /*lower_tail*/ true, /*log_p*/ false);
  y = floor(mu + sigma * (z.val + gamma * (z.val * z.val - 1) / 6) + 0.5);

  if (y > size) {
    /* way off */ y = size;
  }

  printer_qbinom(
    '  new (p,1-p)=(%d,%d), z=qnorm(..)=%d, y=%d, size=%d',
    p,
    1 - p,
    z.val,
    y,
    size
  );

  z.val = pbinom(y, size, pr, /*lower_tail*/ true, /*log_p*/ false);

  /* fuzz to ensure left continuity: */
  p *= 1 - 64 * DBL_EPSILON;

  if (size < 1e5) {
    return do_search(y, z, p, size, pr, 1);
  }
  /* Otherwise be a bit cleverer in the search */

  let incr = floor(size * 0.001);
  let oldincr;
  do {
    console.log('loopdieloop');
    oldincr = incr;
    y = do_search(y, z, p, size, pr, incr);
    incr = fmax2(1, floor(incr / 100));
  } while (oldincr > 1 && incr > size * 1e-15);
  return y;
}
