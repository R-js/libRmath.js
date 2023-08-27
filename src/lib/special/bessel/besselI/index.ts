import createNS from '@mangos/debug-frontend';
import { ME, ML_ERROR2 } from '@common/logger';
import { sinpi } from '@trig/sinpi';
import BesselK from '../besselK';
import { I_bessel } from './IBessel';

import { exp, trunc, floor, PI } from '@lib/r-func';

const printer = debug('besselI');

// Modified Bessel function of the first kind

/* .Internal(besselI(*)) : */
function BesselI(x: number, nu: number, exponScaled = false): number {
    /* NaNs propagated correctly */
    if (isNaN(x) || isNaN(nu)) return x + nu;
    if (x < 0) {
        ML_ERROR2(ME.ME_RANGE, 'bessel_i', printer);
        return NaN;
    }
    const ize = exponScaled ? 2 : 1;
    const na = floor(nu);
    if (nu < 0) {
        /* Using Abramowitz & Stegun  9.6.2 & 9.6.6
         * this may not be quite optimal (CPU and accuracy wise) */
        return (
            BesselI(x, -nu, exponScaled) +
            (nu === na
                ? /* sin(pi * nu) = 0 */ 0
                : ((BesselK(x, -nu, exponScaled) * (ize === 1 ? 2 : 2 * exp(-2 * x))) / PI) * sinpi(-nu))
        );
    }
    const nb = 1 + trunc(na); /* nb-1 <= nu < nb */
    nu -= nb - 1;

    const rc = I_bessel(x, nu, nb, ize);
    if (rc.ncalc !== rc.nb) {
        /* error input */
        if (rc.ncalc < 0)
            printer('bessel_i(%d): ncalc (=%d) != nb (=%d); nu=%d. Arg. out of range?', x, rc.ncalc, rc.nb, nu);
        else printer('bessel_i(%d,nu=%d): precision lost in result\n', rc.x, nu + rc.nb - 1);
    }
    x = rc.x; // bi[nb - 1];

    return x;
}

export default BesselI;
