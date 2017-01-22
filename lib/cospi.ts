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

import { ISNAN, R_FINITE, ME, ML_ERROR, ML_NAN, fabs, M_PI, fmod } from "./general";

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

    x = fmod(fabs(x), 2.);// cos() symmetric; cos(pi(x + 2k)) == cos(pi x) for all integer k
    if (fmod(x, 1.) == 0.5) return 0.;
    if (x == 1.) return -1.;
    if (x == 0.) return 1.;
    // otherwise
    return Math.cos(M_PI * x);
}


// sin(pi * x)  -- exact when x = k/2  for all integer k
export function sinpi(x: number): number {
    if (ISNAN(x)) return x;
    if (!R_FINITE(x)) {
        ML_ERROR(ME.ME_DOMAIN, '');
        return ML_NAN;
    }
    x = fmod(x, 2.); // sin(pi(x + 2k)) == sin(pi x)  for all integer k
    // map (-2,2) --> (-1,1] :
    if (x <= -1) x += 2.; else if (x > 1.) x -= 2.;
    if (x == 0. || x == 1.) return 0.;
    if (x == 0.5) return 1.;
    if (x == -0.5) return -1.;
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
    x = fmod(x, 1.); // tan(pi(x + k)) == tan(pi x)  for all integer k
    // map (-1,1) --> (-1/2, 1/2] :
    if (x <= -0.5) x++; else if (x > 0.5) x--;
    return (x == 0.) ? 0. : ((x == 0.5) ? ML_NAN : Math.tan(M_PI * x));
}


/*
#ifdef HAVE_COSPI
#elif defined HAVE___COSPI
double cospi(double x) {
    return __cospi(x);
}
#else
// cos(pi * x)  -- exact when x = k/2  for all integer k

double cospi(double x) {
#ifdef IEEE_754
    // NaNs propagated correctly 
    if (ISNAN(x)) return x;
#endif
    if(!R_FINITE(x)) ML_ERR_return_NAN;

    x = fmod(fabs(x), 2.);// cos() symmetric; cos(pi(x + 2k)) == cos(pi x) for all integer k
    if(fmod(x, 1.) == 0.5) return 0.;
    if( x == 1.)	return -1.;
    if( x == 0.)	return  1.;
    // otherwise
    return cos(M_PI * x);
}
#endif

#ifdef HAVE_SINPI
#elif defined HAVE___SINPI
double sinpi(double x) {
    return __sinpi(x);
}
#else
// sin(pi * x)  -- exact when x = k/2  for all integer k
double sinpi(double x) {
#ifdef IEEE_754
    if (ISNAN(x)) return x;
#endif
    if(!R_FINITE(x)) ML_ERR_return_NAN;

    x = fmod(x, 2.); // sin(pi(x + 2k)) == sin(pi x)  for all integer k
    // map (-2,2) --> (-1,1] :
    if(x <= -1) x += 2.; else if (x > 1.) x -= 2.;
    if(x == 0. || x == 1.) return 0.;
    if(x ==  0.5)	return  1.;
    if(x == -0.5)	return -1.;
    // otherwise
    return sin(M_PI * x);
}
#endif

// tan(pi * x)  -- exact when x = k/2  for all integer k
#if defined(HAVE_TANPI) || defined(HAVE___TANPI)
// for use in arithmetic.c, half-values documented to give NaN
double Rtanpi(double x)
#else
double tanpi(double x)
#endif
{
#ifdef IEEE_754
    if (ISNAN(x)) return x;
#endif
    if(!R_FINITE(x)) ML_ERR_return_NAN;

    x = fmod(x, 1.); // tan(pi(x + k)) == tan(pi x)  for all integer k
    // map (-1,1) --> (-1/2, 1/2] :
    if(x <= -0.5) x++; else if(x > 0.5) x--;
    return (x == 0.) ? 0. : ((x == 0.5) ? ML_NAN : tan(M_PI * x));
}

#if !defined(HAVE_TANPI) && defined(HAVE___TANPI)
double tanpi(double x) {
    return __tanpi(x);
}
#endif
*/