/*

 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Januari 22, 2017
 * 
 * AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2012 The R Core Team
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
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double lgammafn_sign(double x, int *sgn);
 *    double lgammafn(double x);
 *
 *  DESCRIPTION
 *
 *    The function lgammafn computes log|gamma(x)|.  The function
 *    lgammafn_sign in addition assigns the sign of the gamma function
 *    to the address in the second argument if this is not NULL.
 *
 *  NOTES
 *
 *    This routine is a translation into C of a Fortran subroutine
 *    by W. Fullerton of Los Alamos Scientific Laboratory.
 *
 *    The accuracy of this routine compares (very) favourably
 *    with those of the Sun Microsystems portable mathematical
 *    library.
 */

import { map } from '../r-func';
import { lgammafn_sign } from './lgammafn_sign';

export function lgammafn<T>(x: T): T {
  return map(x)(fx => {
    return lgammafn_sign(fx);
  }) as any;
}
