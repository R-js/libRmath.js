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

import debug from 'debug';
import { ME, ML_ERROR } from '@common/logger.js';
import { sinpi } from '@trig/sinpi.js';
import { BesselK as bessel_k } from '../besselK/index.js';
import { I_bessel } from './IBessel.js';

const { isNaN: ISNAN } = Number;
const { exp, trunc, floor, PI: M_PI } = Math;

const printer = debug('bessel_i');

// Modified Bessel function of the first kind

/* .Internal(besselI(*)) : */
function bessel_i(x: number, alpha: number, expo = false): number {
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
    if (x < 0) {
        ML_ERROR(ME.ME_RANGE, 'bessel_i', printer);
        return NaN;
    }
    const ize = expo ? 2 : 1;
    const na = floor(alpha);
    if (alpha < 0) {
        /* Using Abramowitz & Stegun  9.6.2 & 9.6.6
         * this may not be quite optimal (CPU and accuracy wise) */
        return (
            bessel_i(x, -alpha, expo) +
            (alpha === na
                ? /* sin(pi * alpha) = 0 */ 0
                : ((bessel_k(x, -alpha, expo) * (ize === 1 ? 2 : 2 * exp(-2 * x))) / M_PI) * sinpi(-alpha))
        );
    }
    const nb = 1 + trunc(na); /* nb-1 <= alpha < nb */
    alpha -= nb - 1;

    const rc = I_bessel(x, alpha, nb, ize);
    if (rc.ncalc !== rc.nb) {
        /* error input */
        if (rc.ncalc < 0)
            printer('bessel_i(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?', x, rc.ncalc, rc.nb, alpha);
        else printer('bessel_i(%d,nu=%d): precision lost in result\n', rc.x, alpha + rc.nb - 1);
    }
    x = rc.x; // bi[nb - 1];

    return x;
}

export default bessel_i;
export { bessel_i as BesselI }