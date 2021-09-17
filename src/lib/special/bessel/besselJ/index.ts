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
//3rd party
import debug from 'debug';

//tooling
import { ME, ML_ERROR } from '@common/logger.js';

import { cospi } from '@trig/cospi.js';
import { sinpi } from '@trig/sinpi.js';
import bessel_y_scalar from '../besselY/index.js';
import { J_bessel } from './Jbessel.js';

const { isNaN: ISNAN } = Number;
const { floor } = Math;

const printer = debug('bessel_j');

function bessel_j_scalar(x: number, alpha: number): number {
    /* NaNs propagated correctly */
    if (ISNAN(x) || ISNAN(alpha)) return x + alpha;
    if (x < 0) {
        ML_ERROR(ME.ME_RANGE, 'bessel_j_scalar', printer);
        return NaN;
    }
    // double
    const na = floor(alpha);
    if (alpha < 0) {
        /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
        let rc;
        if (alpha - na === 0.5) {
            rc = 0;
        }
        else {
            rc = bessel_j_scalar(x, -alpha) * cospi(alpha);
        }
        if (alpha !== na) {
            rc += bessel_y_scalar(x, -alpha) * sinpi(alpha);
        }
        return rc;
    } else if (alpha > 1e7) {
        printer('besselJ(x, nu): nu=%d too large for bessel_j() algorithm', alpha);
        return NaN;
    }
    //int
    const nb = 1 + na; /* nb-1 <= alpha < nb */
    alpha -= na; // ==> alpha' in [0, 1)
    const rc = J_bessel(x, alpha, nb);

    if (rc.ncalc !== nb) {
        /* error input */
        if (rc.ncalc < 0) {
            printer('bessel_j(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?', x, rc.ncalc, rc.nb, alpha);
        }
        else {
            printer('bessel_j(%d,nu=%d): precision lost in result', x, alpha + nb - 1);
        }
    }
    return rc.x; // bj[nb - 1];
}

export default bessel_j_scalar;
export { bessel_j_scalar as BesselJ };