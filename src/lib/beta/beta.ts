/*

 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Januari 22, 2017
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
 *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 *
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double beta(double a, double b);
 *
 *  DESCRIPTION
 *
 *    This function returns the value of the beta function
 *    evaluated with arguments a and b.
 *
 *  NOTES
 *
 *    This routine is a translation into C of a Fortran subroutine
 *    by W. Fullerton of Los Alamos Scientific Laboratory.
 *    Some modifications have been made so that the routines
 *    conform to the IEEE 754 standard.
 */

import * as debug from 'debug';

import { ME, ML_ERR_return_NAN, ML_ERROR } from '../common/_general';
import { gammafn } from '../gamma/gamma_fn';
import { lbeta } from './lbeta';

//const xmin =  - 170.5674972726612;
const xmax = 171.61447887182298;
const lnsml = -708.39641853226412;

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  POSITIVE_INFINITY: ML_POSINF
} = Number;

const printer_beta = debug('beta');

export function beta(_a: number | number[], b: number): number | number[] {
  const fa = Array.isArray(_a) ? _a : [_a];

  const result = fa.map(a => {
    if (ISNAN(a) || ISNAN(b)) return a + b;

    if (a < 0 || b < 0) return ML_ERR_return_NAN(printer_beta);
    else if (a === 0 || b === 0) return ML_POSINF;
    else if (!R_FINITE(a) || !R_FINITE(b)) return 0;

    if (a + b < xmax) {
      //
      // ~= 171.61 for IEEE
      //	return gammafn(a) * gammafn(b) / gammafn(a+b);
      // All the terms are positive, and all can be large for large
      //   or small arguments.  They are never much less than one.
      //   gammafn(x) can still overflow for x ~ 1e-308,
      //   but the result would too.
      //
      return 1 / gammafn(a + b) * gammafn(a) * gammafn(b);
    } else {
      let val: number = lbeta(a, b);
      // underflow to 0 is not harmful per se;  exp(-999) also gives no warning
      //#ifndef IEEE_754
      if (val < lnsml) {
        // a and/or b so big that beta underflows
        ML_ERROR(ME.ME_UNDERFLOW, 'beta', printer_beta);
        // return ML_UNDERFLOW; pointless giving incorrect value
      }
      //#endif
      return Math.exp(val);
    }
  });

  return result.length === 1 ? result[0] : result;
}
