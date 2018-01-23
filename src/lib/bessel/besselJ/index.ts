/*
 *
 *  23-Jan-2018: JS Port by Jacob Bogers jkfbogers@gmail.com
 * 
 * 
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998-2015 Ross Ihaka and the R Core team.
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


 /* From http://www.netlib.org/specfun/rjbesl	Fortran translated by f2c,...
  *	------------------------------=#----	Martin Maechler, ETH Zurich
  * Additional code for nu == alpha < 0  MM
  */

import * as debug from 'debug';
import { ME, ML_ERROR } from '../../common/_general';
import { cospi } from '../../trigonometry/cospi';
import { sinpi } from '../../trigonometry/sinpi';
import { bessel_y } from '../besselY';
import { J_bessel } from './Jbessel';

const { isNaN: ISNAN }  = Number;
const { floor, trunc } = Math;

const printer = debug('bessel_j');

export function bessel_j(x: number, alpha: number): number  {
    //int
    let nb; 
    //double
    let na; // , *bj;
  
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
    if (x < 0) {
      ML_ERROR(ME.ME_RANGE, 'bessel_j', printer);
        return NaN;
    }
    na = floor(alpha);
    if (alpha < 0) {
      /* Using Abramowitz & Stegun  9.1.2
       * this may not be quite optimal (CPU and accuracy wise) */
      return(((alpha - na === 0.5) ? 0 : bessel_j(x, -alpha) * cospi(alpha)) +
        ((alpha === na) ? 0 : bessel_y(x, -alpha) * sinpi(alpha)));
    }
    else if (alpha > 1e7) {
      printer(
        'besselJ(x, nu): nu=%d too large for bessel_j() algorithm',
        alpha);
      return NaN;
    }
  
    nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
    alpha -= (nb - 1); // ==> alpha' in [0, 1)
    const rc = J_bessel(x, alpha, nb);
  
    if (rc.ncalc !== rc.nb) {/* error input */
      if (rc.ncalc < 0)
        printer('bessel_j(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?',
          x, rc.ncalc, rc.nb, alpha);
      else
        printer('bessel_j(%d,nu=%d): precision lost in result',
          x, alpha + nb - 1);
    }
    x = rc.x; // bj[nb - 1];
    return x;
  }
  
  
