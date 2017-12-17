/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 19, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-8 The R Core Team
 *  Copyright (C) 2005 The R Foundation
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
 *    This the lognormal quantile function.
 */

import { ISNAN, ML_POSINF, R_Q_P01_boundaries, exp } from '~common';

import { qnorm } from '../normal/qnorm';

const { isArray } = Array;

export function qlnorm(
  _p: number | number[],
  meanlog: number,
  sdlog: number,
  lower_tail: boolean,
  log_p: boolean
): number | number[] {
  let fp: number[] = (() => (isArray(_p) && _p) || [_p])();

  let result = fp.map(p => {
    if (ISNAN(p) || ISNAN(meanlog) || ISNAN(sdlog)) return p + meanlog + sdlog;

    R_Q_P01_boundaries(lower_tail, log_p, p, 0, ML_POSINF);

    return exp(qnorm(p, meanlog, sdlog, lower_tail, log_p));
  });

  return result.length === 1 ? result[0] : result;
}
