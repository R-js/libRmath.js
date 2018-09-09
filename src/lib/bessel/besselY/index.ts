/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';
import { ME, ML_ERROR } from '../../common/_general';
import { cospi } from '../../trigonometry/cospi';
import { sinpi } from '../../trigonometry/sinpi';
import { bessel_j } from '../besselJ';
import { Y_bessel } from './Ybessel';

const { floor } = Math;
const { isNaN:ISNAN, POSITIVE_INFINITY: ML_POSINF } = Number;

const printer = debug('bessel_y');

export function bessel_y(x: number, alpha: number): number {
  //double
  
  /* NaNs propagated correctly */
  if (ISNAN(x) || ISNAN(alpha)) return x + alpha;

  if (x < 0) {
    ML_ERROR(ME.ME_RANGE, 'bessel_y', printer);
    return NaN;
  }
  const na = floor(alpha);
  if (alpha < 0) {
    /* Using Abramowitz & Stegun  9.1.2
     * this may not be quite optimal (CPU and accuracy wise) */
    return (((alpha - na === 0.5) ? 0 : bessel_y(x, -alpha) * cospi(alpha)) -
      ((alpha === na) ? 0 : bessel_j(x, -alpha) * sinpi(alpha)));
  }
  else if (alpha > 1e7) {
    printer('besselY(x, nu): nu=%d too large for bessel_y() algorithm',
      alpha);
    return NaN;
  }
  const nb = 1 + na; /* nb-1 <= alpha < nb */
  alpha -= (nb - 1);


  const rc = Y_bessel(x, alpha, nb);
  if (rc.ncalc !== nb) {/* error input */
    if (rc.ncalc === -1) {
      return ML_POSINF;
    }
    else if (rc.ncalc < -1)
      printer('bessel_y(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?\n',
        rc.x, rc.ncalc, nb, alpha);
    else /* ncalc >= 0 */
      printer('bessel_y(%d,nu=%d): precision lost in result\n',
        rc.x, alpha + nb - 1);
  }
  x = rc.x;
  return x;
}
  
