/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Februari 5, 2017
 *  ORIGNAL AUTHOR
 *  Using Node or Javascript Native implementation (when running in browser)
 *  
 *  Other RNG's by George Marsaglia from newshourp comp.lang.c 2003-May-13   
 * 
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
 *  *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
*/

import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';
import { IRNG } from '../rng';

const { isFinite: R_FINITE } = Number;
const printer = debug('runif');

export function runif(
  n: number = 1,
  min: number = 0,
  max: number = 1,
  u: IRNG
): number | number[] {

  if (!(R_FINITE(min) && R_FINITE(max) && max > min)) {
    return ML_ERR_return_NAN(printer);
  }

  let result = new Array(n).fill(0).map(() => {
    const s = u.unif_rand();
    return (max - min) * s + min;
  });

  return result.length === 1 ? result[0] : result;
}
