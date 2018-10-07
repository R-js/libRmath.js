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

