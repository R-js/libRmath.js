/*
 *  23Jan 2018 jkfbogers@gmail.com
 *  Pre-port to JS, pointers and dynamic allocation was removed from this c-module
 *
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998-2014 Ross Ihaka and the R Core team.
 *  Copyright (C) 2002-3    The R Foundation
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
 */

/*  DESCRIPTION --> see below */


/* From http://www.netlib.org/specfun/rkbesl	Fortran translated by f2c,...
 *	------------------------------=#----	Martin Maechler, ETH Zurich
 */

import * as debug from 'debug';
import { ME, ML_ERROR } from '../../common/_general';
import { K_bessel } from './Kbessel';


const { isNaN: ISNAN } = Number;
const { floor } = Math;
const printer = debug('bessel_k');

export function bessel_k(x: number, alpha: number, expo: boolean = false): number {
  let nb;
  let ize;


  /* NaNs propagated correctly */
  if (ISNAN(x) || ISNAN(alpha)) return x + alpha;

  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_k', printer);
    return NaN;
  }
  ize = expo ? 2 : 1;
  if (alpha < 0)
    alpha = -alpha;
  nb = 1 + floor(alpha); /* nb-1 <= |alpha| < nb */
  alpha -= (nb - 1);




  const rc = K_bessel(x, alpha, nb, ize);
  if (rc.ncalc !== rc.nb) {/* error input */
    if (rc.ncalc < 0)
      printer('bessel_k(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?\n',
        rc.x, rc.ncalc, rc.nb, alpha);
    else
      printer('bessel_k(%d,nu=%d): precision lost in result\n',
        rc.x, alpha + rc.nb - 1);
  }
  x = rc.x; // bk[nb - 1];


  return x;
}

