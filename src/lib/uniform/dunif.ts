/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  Feb 10, 2017
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
 * 
 *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 * 
 * */

import { R_D__0 } from '~common';

const { isNaN: ISNAN } = Number;
const { log } = Math;
const { isArray } = Array;

export function dunif(
  x: number | number[],
  a: number = 0,
  b: number = 1,
  giveLog: boolean = false
): number|number[] {
  
  let fa = ( () => (isArray(x) && x) || [x])(); 

  const result = fa.map(fx => {
    if (ISNAN(fx) || ISNAN(a) || ISNAN(b)) {
      return fx + a + b;
    }
    if (a <= fx && fx <= b) {
      return giveLog ? -log(b - a) : 1 / (b - a);
    }
    return R_D__0(giveLog); // return logP ? ML_NEGINF : 0.0;
  });
  return result.length === 1 ? result[0] : result;
}
