/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';
import { ME, ML_ERROR } from '../../common/_general';
import { multiplexer } from '../../r-func';
import { boolVector, numVector } from '../../types';
import { K_bessel } from './Kbessel';

const { isNaN: ISNAN } = Number;
const { floor } = Math;
const printer = debug('bessel_k');

export function bessel_k(_x: numVector, _alpha: numVector, _expo: boolVector): numVector {
  return multiplexer(_x, _alpha, _expo)((x, alpha, expo) => internal_bessel_k(x, alpha, expo));
}

export function internal_bessel_k(x: number, alpha: number, expo: boolean = false): number {
  let nb;
  let ize;


  /* NaNs propagated correctly */
  if (ISNAN(x) || ISNAN(alpha)) return x + alpha;

  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_k', printer);
    return NaN;
  }
  ize = expo ? 2 : 1;
  if (alpha < 0)
    alpha = -alpha;
  nb = 1 + floor(alpha); /* nb-1 <= |alpha| < nb */
  alpha -= (nb - 1);




  const rc = K_bessel(x, alpha, nb, ize);
  if (rc.ncalc !== rc.nb) {/* error input */
    if (rc.ncalc < 0)
      printer('bessel_k(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?\n',
        rc.x, rc.ncalc, rc.nb, alpha);
    else
      printer('bessel_k(%d,nu=%d): precision lost in result\n',
        rc.x, alpha + rc.nb - 1);
  }
  x = rc.x; // bk[nb - 1];
  return x;
}

