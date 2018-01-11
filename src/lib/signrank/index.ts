/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 25, 2017 --initial
 *  Jan 9, 2018 tested and documented  
 * 
 * ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1999-2014  The R Core Team
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
 *    double dsignrank(double x, double n, int give_log)
 *    double psignrank(double x, double n, int lower_tail, int log_p)
 *    double qsignrank(double x, double n, int lower_tail, int log_p)
 *    double rsignrank(double n)
 *
 *  DESCRIPTION
 *
 *    dsignrank	   The density of the Wilcoxon Signed Rank distribution.
 *    psignrank	   The distribution function of the Wilcoxon Signed Rank
 *		   distribution.
 *    qsignrank	   The quantile function of the Wilcoxon Signed Rank
 *		   distribution.
 *    rsignrank	   Random variates from the Wilcoxon Signed Rank
 *		   distribution.
 */

import { IRNG, rng } from '../rng';
import { dsignrank } from './dsign';
import { psignrank } from './psign';
import { qsignrank } from './qsign';
import { rsignrank as _rsignrank } from './rsign';

const { MersenneTwister } = rng;

export function SignRank(rng: IRNG = new MersenneTwister(0)) {

  function rsignrank(N: number, n: number) {
    return _rsignrank(N, n, rng);
  }

  return {
    dsignrank,
    psignrank,
    qsignrank,
    rsignrank
  };
}
