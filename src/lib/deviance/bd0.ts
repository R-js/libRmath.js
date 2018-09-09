/* This is a conversion from BLAS to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const { isFinite: R_FINITE, MIN_VALUE: DBL_MIN, NaN } = Number;
const { abs: fabs, log } = Math;


export function bd0(x: number, np: number): number {
  let ej: number;

  let s: number;

  let s1: number;

  let v: number;

  let j: number;

  if (!R_FINITE(x) || !R_FINITE(np) || np === 0.0) {
    return NaN;
  }

  if (fabs(x - np) < 0.1 * (x + np)) {
    v = (x - np) / (x + np); // might underflow to 0

    s = (x - np) * v; // s using v -- change by MM

    if (fabs(s) < DBL_MIN) return s;

    ej = 2 * x * v;

    v = v * v;

    for (j = 1; j < 1000; j++) {
      // Taylor series; 1000: no infinite loop

      //				as |v| < .1,  v^2000 is "zero"

      ej *= v; // = v^(2j+1)

      s1 = s + ej / ((j << 1) + 1);

      if (s1 === s)
        //* last term was effectively 0

        return s1;

      s = s1;
    }
  }

  // else:  | x - np |  is not too small

  return x * log(x / np) + np - x;
}
