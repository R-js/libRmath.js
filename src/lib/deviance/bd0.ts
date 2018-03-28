/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

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
