/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import * as debug from 'debug';

import { ML_ERR_return_NAN } from '../common/_general';

const { abs: fabs } = Math;

const printer = debug('chebyshev_eval');

export function chebyshev_init(
  dos: number[],
  nos: number,
  eta: number
): number {
  let retCode: number = 0;
  //let ii: number;
  let err: number;

  if (nos < 1) return 0;

  err = 0.0;

  for (let ii = 1; ii <= nos; ii++) {
    retCode = nos - ii;
    err += fabs(dos[retCode]);
    if (err > eta) {
      return retCode;
    }
  }
  return retCode;
}

export function chebyshev_eval(x: number, a: number[], n: number): number {
  let b0: number;
  let b1: number;
  let b2: number;
  let twox: number;
  let i: number;

  if (n < 1 || n > 1000) {
    return ML_ERR_return_NAN(printer);
  }

  if (x < -1.1 || x > 1.1) {
    return ML_ERR_return_NAN(printer);
  }

  twox = x * 2;
  b2 = b1 = 0;
  b0 = 0;
  for (i = 1; i <= n; i++) {
    b2 = b1;
    b1 = b0;
    b0 = twox * b1 - b2 + a[n - i];
  }
  return (b0 - b2) * 0.5;
}
