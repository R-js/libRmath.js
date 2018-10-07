/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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
  
