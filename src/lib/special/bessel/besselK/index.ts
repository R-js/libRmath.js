import createNS from '@mangos/debug-frontend';
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
            printer('bessel_k(%d): ncalc (=%d) != nb (=%d); nu=%d. Arg. out of range?\n', rc.x, rc.ncalc, rc.nb, nu);
        else printer('bessel_k(%d,nu=%d): precision lost in result\n', rc.x, nu + rc.nb - 1);
    }
    x = rc.x; // bk[nb - 1];
    return x;
}

export default BesselK;
