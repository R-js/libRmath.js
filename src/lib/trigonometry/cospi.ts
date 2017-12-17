/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Januari 22, 2017
 * 
 *  Original Author: R Core team
 *
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 2013-2016 The R Core Team
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
 *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 * 
 */

import {
  ME,
  ML_ERROR,
  fmod
} from '~common';

const  { 
    abs: fabs, 
    PI: M_PI
} = Math;

const { 
    NaN: ML_NAN,
    isNaN: ISNAN,  
    isFinite: R_FINITE  
} = Number;

/* HAVE_COSPI etc will not be defined in standalone-use: the
   intention is to make the versions here available in that case.

   The __cospi etc variants are from OS X (and perhaps other BSD-based systems).
*/

// cos(pi * x)  -- exact when x = k/2  for all integer k

export function cospi(x: number): number {
  // NaNs propagated correctly
  if (ISNAN(x)) return x;
  if (!R_FINITE(x)) {
    ML_ERROR(ME.ME_DOMAIN, '');
    return ML_NAN;
  }

  x = fmod(fabs(x), 2); // cos() symmetric; cos(pi(x + 2k)) == cos(pi x) for all integer k
  if (fmod(x, 1) === 0.5) return 0;
  if (x === 1) return -1;
  if (x === 0) return 1;
  // otherwise
  return Math.cos(M_PI * x);
}

// sin(pi * x)  -- exact when x = k/2  for all integer k
export function sinpi(x: number): number {
  if (ISNAN(x)) return x;
  if (!R_FINITE(x)) {
    ML_ERROR(ME.ME_DOMAIN, 'sinpi not finite');
    return ML_NAN;
  }
  x = fmod(x, 2); // sin(pi(x + 2k)) == sin(pi x)  for all integer k
  // map (-2,2) --> (-1,1] :
  if (x <= -1) x += 2;
  else if (x > 1) x -= 2;
  if (x === 0 || x === 1) return 0;
  if (x === 0.5) return 1;
  if (x === -0.5) return -1;
  // otherwise
  return Math.sin(M_PI * x);
}

// tan(pi * x)  -- exact when x = k/2  for all integer k
export function tanpi(x: number): number {
  if (ISNAN(x)) return x;
  if (!R_FINITE(x)) {
    ML_ERROR(ME.ME_DOMAIN, '');
    return ML_NAN;
  }
  x = fmod(x, 1); // tan(pi(x + k)) == tan(pi x)  for all integer k
  // map (-1,1) --> (-1/2, 1/2] :
  if (x <= -0.5) {
    x++;
  } else if (x > 0.5) {
    x--;
  }
  return x === 0 ? 0 : x === 0.5 ? ML_NAN : Math.tan(M_PI * x);
}

export function atanpi(x: number) {
  return Math.atan(x) / Math.PI;
}
