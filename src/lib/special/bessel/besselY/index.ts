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

import { debug } from 'debug';
import { ME, ML_ERROR } from '@common/logger.js';
import { cospi } from '@trig/cospi.js';
import { sinpi } from '@trig/sinpi.js';
import BesselJ from '../besselJ/index.js';
import { Y_bessel } from './Ybessel.js';

import {
    floor,
} from '@lib/r-func.js';


const printer = debug('BesselY');

function BesselY(x: number, alpha: number): number {
    //double

    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(alpha)) return x + alpha;

    if (x < 0) {
        ML_ERROR(ME.ME_RANGE, 'BesselY', printer);
        return NaN;
    }
    const na = floor(alpha);
    if (alpha < 0) {
        /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
        return (
            (alpha - na === 0.5 ? 0 : BesselY(x, -alpha) * cospi(alpha)) -
            (alpha === na ? 0 : BesselJ(x, -alpha) * sinpi(alpha))
        );
    } else if (alpha > 1e7) {
        printer('besselY(x, nu): nu=%d too large for bessel_y() algorithm', alpha);
        return NaN;
    }
    const nb = 1 + na; /* nb-1 <= alpha < nb */
    alpha -= nb - 1;

    const rc = Y_bessel(x, alpha, nb);
    if (rc.ncalc !== nb) {
        /* error input */
        if (rc.ncalc === -1) {
            return Infinity;
        } else if (rc.ncalc < -1) {
            printer('bessel_y(%d): ncalc (=%d) != nb (=%d); alpha=%d. Arg. out of range?\n', rc.x, rc.ncalc, nb, alpha);
        }
        /* ncalc >= 0 */ else {
            printer('bessel_y(%d,nu=%d): precision lost in result\n', rc.x, alpha + nb - 1);
        }
    }
    return rc.x;
}

export default BesselY;
