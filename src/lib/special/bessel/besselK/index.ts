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

import { debug } from '@mangos/debug';
import { ME, ML_ERROR2 } from '@common/logger';
import { isNaN, floor } from '@lib/r-func';
import { K_bessel } from './Kbessel';

const printer = debug('BesselK');

function BesselK(x: number, nu: number, exponScaled = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(nu)) return x + nu;

    if (x < 0) {
        ML_ERROR2(ME.ME_RANGE, 'bessel_k', printer);
        return NaN;
    }
    const ize = exponScaled ? 2 : 1;
    if (nu < 0) nu = -nu;
    const nb = 1 + floor(nu); /* nb-1 <= |nu| < nb */
    nu -= nb - 1;

    const rc = K_bessel(x, nu, nb, ize);
    if (rc.ncalc !== rc.nb) {
        /* error input */
        if (rc.ncalc < 0)
            printer(
                'bessel_k(%d): ncalc (=%d) != nb (=%d); nu=%d. Arg. out of range?\n',
                rc.x,
                rc.ncalc,
                rc.nb,
                nu,
            );
        else printer('bessel_k(%d,nu=%d): precision lost in result\n', rc.x, nu + rc.nb - 1);
    }
    x = rc.x; // bk[nb - 1];
    return x;
}

export default BesselK;
