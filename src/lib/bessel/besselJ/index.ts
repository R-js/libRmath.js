/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import * as debug from 'debug';
import { ME, ML_ERROR } from '../../common/_general';
import { multiplexer } from '../../r-func';
import { cospi } from '../../trigonometry/cospi';
import { sinpi } from '../../trigonometry/sinpi';
import { numVector } from '../../types';
import { internal_bessel_y } from '../besselY';
import { J_bessel } from './Jbessel';

const { isNaN: ISNAN }  = Number;
const { floor, trunc } = Math;

const printer = debug('bessel_j');

export function bessel_j(_x: numVector, _alpha: numVector): numVector {
   return multiplexer(_x, _alpha)((x, alpha) => internal_bessel_j(x, alpha));
}

export function internal_bessel_j(x: number, alpha: number): number  {
    //int
    let nb; 
    //double
    let na; // , *bj;
  
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
    if (x < 0) {
      ML_ERROR(ME.ME_RANGE, 'bessel_j', printer);
        return NaN;
    }
    na = floor(alpha);
    if (alpha < 0) {
      /* Using Abramowitz & Stegun  9.1.2
       * this may not be quite optimal (CPU and accuracy wise) */
      return(((alpha - na === 0.5) ? 0 : internal_bessel_j(x, -alpha) * cospi(alpha)) +
        ((alpha === na) ? 0 : internal_bessel_y(x, -alpha) * sinpi(alpha)));
    }
    else if (alpha > 1e7) {
      printer(
        'besselJ(x, nu): nu=%d too large for bessel_j() algorithm',
        alpha);
      return NaN;
    }
  
    nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
    alpha -= (nb - 1); // ==> alpha' in [0, 1)
    const rc = J_bessel(x, alpha, nb);
  
    if (rc.ncalc !== nb) {/* error input */
      if (rc.ncalc < 0)
        printer('bessel_j(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?',
          x, rc.ncalc, rc.nb, alpha);
      else
        printer('bessel_j(%d,nu=%d): precision lost in result',
          x, alpha + nb - 1);
    }
    x = rc.x; // bj[nb - 1];
    return x;
  }
  
  
