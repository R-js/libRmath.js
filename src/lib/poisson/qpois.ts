/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2014 The R Core Team
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
 *	The quantile function of the Poisson distribution.
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

import { NumberW } from '../common/toms708';

import { ppois } from './ppois';

import { qnorm } from '../normal/qnorm';

import { R_DT_qIv } from '~exp-utils';

import { forEach } from '../r-func';

const { max: fmax2, sqrt, floor, round: nearbyint } = Math;
const {
  isNaN: ISNAN,
  EPSILON: DBL_EPSILON,
  POSITIVE_INFINITY: ML_POSINF,
  isFinite: R_FINITE
} = Number;

function do_search(
  y: number,
  z: NumberW,
  p: number,
  lambda: number,
  incr: number
): number {
  if (z.val >= p) {
    // search to the left
    while (true) {
      if (y === 0 || (z.val = ppois(y - incr, lambda, true, false)) < p)
        return y;
      y = fmax2(0, y - incr);
    }
  } else {
    // search to the right

    while (true) {
      y = y + incr;
      if ((z.val = ppois(y, lambda, true, false)) >= p) return y;
    }
  }
}

export function qpois<T>(
  pp: T,
  lambda: number,
  lower_tail: boolean = true,
  log_p: boolean = false
  //normal: INormal
): T {
  return forEach(pp)(p => {
    return _qpois(p, lambda, lower_tail, log_p /*, normal*/);
  }) as any;
}

const printer_qpois = debug('_qpois');

function _qpois(
  p: number,
  lambda: number,
  lower_tail: boolean,
  log_p: boolean
  // normal: INormal
): number {
  let mu;
  let sigma;
  let gamma;
  let y;
  let z = new NumberW(0);

  if (ISNAN(p) || ISNAN(lambda)) return p + lambda;

  if (!R_FINITE(lambda)) {
    return ML_ERR_return_NAN(printer_qpois);
  }
  if (lambda < 0) return ML_ERR_return_NAN(printer_qpois);
  if (lambda === 0) return 0;

  let rc = R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);
  if (rc !== undefined) {
    return rc;
  }

  mu = lambda;
  sigma = sqrt(lambda);
  /* gamma = sigma; PR#8058 should be kurtosis which is mu^-0.5 */
  gamma = 1.0 / sigma;

  /* Note : "same" code in qpois.c, qbinom.c, qnbinom.c --
     * FIXME: This is far from optimal [cancellation for p ~= 1, etc]: */
  if (!lower_tail || log_p) {
    p = R_DT_qIv(lower_tail, log_p, p); /* need check again (cancellation!): */
    if (p === 0) return 0;
    if (p === 1) return ML_POSINF;
  }
  /* temporary hack --- FIXME --- */
  if (p + 1.01 * DBL_EPSILON >= 1) return ML_POSINF;

  /* y := approx.value (Cornish-Fisher expansion) :  */
  z.val = qnorm(p, 0, 1, /*lower_tail*/ true, /*log_p*/ false);

  y = nearbyint(mu + sigma * (z.val + gamma * (z.val * z.val - 1) / 6));

  z.val = ppois(y, lambda, /*lower_tail*/ true, /*log_p*/ false);

  /* fuzz to ensure left continuity; 1 - 1e-7 may lose too much : */
  p *= 1 - 64 * DBL_EPSILON;

  /* If the mean is not too large a simple search is OK */
  if (lambda < 1e5) return do_search(y, z, p, lambda, 1);
  /* Otherwise be a bit cleverer in the search */
  {
    let incr = floor(y * 0.001);
    let oldincr;
    do {
      oldincr = incr;
      y = do_search(y, z, p, lambda, incr);
      incr = fmax2(1, floor(incr / 100));
    } while (oldincr > 1 && incr > lambda * 1e-15);
    return y;
  }
}
