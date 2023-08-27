import createNS from '@mangos/debug-frontend';
import { ME, ML_ERROR2 } from '@common/logger';
import { cospi } from '@trig/cospi';
import { sinpi } from '@trig/sinpi';
import BesselJ from '../besselJ';
import { Y_bessel } from './Ybessel';

import { floor } from '@lib/r-func';

const printer = debug('BesselY');

function BesselY(x: number, nu: number): number {
    //double

    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(nu)) return x + nu;

    if (x < 0) {
        ML_ERROR2(ME.ME_RANGE, 'BesselY', printer);
        return NaN;
    }
    const na = floor(nu);
    if (nu < 0) {
        /* Using Abramowitz & Stegun  9.1.2
         * this may not be quite optimal (CPU and accuracy wise) */
        return (nu - na === 0.5 ? 0 : BesselY(x, -nu) * cospi(nu)) - (nu === na ? 0 : BesselJ(x, -nu) * sinpi(nu));
    } else if (nu > 1e7) {
        printer('besselY(x, nu): nu=%d too large for bessel_y() algorithm', nu);
        return NaN;
    }
    const nb = 1 + na; /* nb-1 <= nu < nb */
    nu -= nb - 1;

    const rc = Y_bessel(x, nu, nb);
    if (rc.ncalc !== nb) {
        /* error input */
        if (rc.ncalc === -1) {
            return Infinity;
        } else if (rc.ncalc < -1) {
            printer('bessel_y(%d): ncalc (=%d) != nb (=%d); nu=%d. Arg. out of range?\n', rc.x, rc.ncalc, nb, nu);
        } else {
        /* ncalc >= 0 */
            printer('bessel_y(%d,nu=%d): precision lost in result\n', rc.x, nu + nb - 1);
        }
    }
    return rc.x;
}

export default BesselY;
