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
import { debug } from '@mangos/debug';

//tooling
import { ME, ML_ERROR2 } from '@common/logger';

import { cospi } from '@trig/cospi';
import { sinpi } from '@trig/sinpi';
import BesselY from '../besselY';
import { J_bessel } from './Jbessel';

import { floor } from '@lib/r-func'

const printer = debug('BesselJ');

function BesselJ(x: number, nu: number): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(nu)) return x + nu;
    if (x < 0) {
        ML_ERROR2(ME.ME_RANGE, 'BesselJ', printer);
        return NaN;
    }
    // double
    const na = floor(nu);
    if (nu < 0) {
        /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
        let rc;
        // happens when (nu < 0) = -0.5, -1.5, -2.5, -3.5, etc
        if (nu - na === 0.5) {
            rc = 0;
        }
        else {
            // nu not equal to -0.5, -1.5, -2.5 etc
            rc = BesselJ(x, -nu) * cospi(nu);
        }
        // note it is not an assignment but a "rc +=" addition
        if (nu !== na) {
            rc += BesselY(x, -nu) * sinpi(nu);
        }
        return rc;
    } else if (nu > 1e7) {
        printer('besselJ(x, nu): nu=%d too large for bessel_j() algorithm', nu);
        return NaN;
    }
    // nb = 1 + Math.floor(nu);
    const nb = 1 + na; /* nb-1 <= nu < nb */
    // nu = -na 
    nu -= na; // ==> nu' in [0, 1) because na = Math.floor(nu)
    const rc = J_bessel(x, nu, nb);
    printer('debug (nu=%d, na=%d, nb=%d, rc=%j', nu, na, nb, rc);
    
    if (rc.ncalc !== nb) {
        /* error input */
        if (rc.ncalc < 0) {
            printer('bessel_j(%d): ncalc (=%d) != nb (=%d); nu=%d. Arg. out of range?', x, rc.ncalc, rc.nb, nu);
        }
        else {
            printer('bessel_j(%d,nu=%d): precision lost in result', x, nu + nb - 1);
        }
    }
    return rc.x; // bj[nb - 1];
}

export default BesselJ;
