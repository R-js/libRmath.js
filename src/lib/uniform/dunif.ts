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

import { R_D__0 } from '../common/_general';
import { map } from '../r-func';

const { isNaN: ISNAN } = Number;
const { log } = Math;

export function dunif(
  x: number | number[],
  min: number = 0,
  max: number = 1,
  logP: boolean = false
): number | number[] {
  return map(x)(fx => {
    if (ISNAN(fx) || ISNAN(min) || ISNAN(max)) {
      return fx + min + max;
    }
    if (min <= fx && fx <= max) {
      return logP ? -log(max - min) : 1 / (max - min);
    }
    return R_D__0(logP); // return logP ? ML_NEGINF : 0.0;
  }) as any;
}
