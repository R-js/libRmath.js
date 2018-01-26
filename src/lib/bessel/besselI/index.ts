/*

 *  23 jan 2018 Jacob Bogers jkfbogers@gmail.com
 *   
 *	Ported to JS
 
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998-2014 Ross Ihaka and the R Core team.
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


 /* From http://www.netlib.org/specfun/ribesl	Fortran translated by f2c,...
  *	------------------------------=#----	Martin Maechler, ETH Zurich
  */

  import * as debug from 'debug';
  import { ME, ML_ERROR } from '../../common/_general';
  import { sinpi } from '../../trigonometry/sinpi';
  import { bessel_k } from '../besselK';
  import { I_bessel } from './IBessel';

  


  const { isNaN:ISNAN } = Number;
  const { exp,  trunc, floor, PI: M_PI } = Math;

  const printer = debug('bessel_i');
  /* .Internal(besselI(*)) : */
  export function bessel_i(x: number, alpha: number, expo: boolean): number  {
    
    //int
    let nb;
    let ize;
    
    //double 
    let na;
  
      /* NaNs propagated correctly */
      if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
      if (x < 0) {
          ML_ERROR(ME.ME_RANGE, 'bessel_i', printer);
          return NaN;
      }
      ize = expo ? 2 : 1;
      na = floor(alpha);
      if (alpha < 0) {
          /* Using Abramowitz & Stegun  9.6.2 & 9.6.6
           * this may not be quite optimal (CPU and accuracy wise) */
          return(bessel_i(x, -alpha, expo) +
              ((alpha === na) ? /* sin(pi * alpha) = 0 */ 0 :
                  bessel_k(x, -alpha, expo) *
                  ((ize === 1) ? 2. : 2. * exp(-2. * x)) / M_PI * sinpi(-alpha)));
      }
      nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
      alpha -= (nb - 1);
  
  
  
      const rc = I_bessel(x, alpha, nb, ize);
      if (rc.ncalc !== rc.nb) {/* error input */
          if (rc.ncalc < 0)
          printer('bessel_i(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?',
                  x, rc.ncalc, rc.nb, alpha);
          else
          printer('bessel_i(%d,nu=%d): precision lost in result\n',
                  rc.x, alpha + rc.nb - 1);
      }
      x = rc.x; // bi[nb - 1];
  
      return x;
  }
  
