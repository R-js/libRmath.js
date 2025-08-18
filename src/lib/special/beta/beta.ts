import createNS from '@common/debug-frontend';

import { ME, ML_ERR_return_NAN2, ML_ERROR3 } from '@common/logger';
import { gamma } from '@special/gamma';
import lbeta from './lbeta';
import { exp } from '@lib/r-func';

// not used const xmin = -170.5674972726612;
const xmax = 171.61447887182298;
const lnsml = -708.39641853226412;

const printer_beta = createNS('beta');

function beta(a: number, b: number): number {
    if (isNaN(a) || isNaN(b)) return a + b;

    if (a < 0 || b < 0) return ML_ERR_return_NAN2(printer_beta);
    else if (a === 0 || b === 0) return Infinity;
    else if (!isFinite(a) || !isFinite(b)) return 0;

    if (a + b < xmax) {
        //
        // ~= 171.61 for IEEE
        //	return gammafn(a) * gammafn(b) / gammafn(a+b);
        // All the terms are positive, and all can be large for large
        //   or small arguments.  They are never much less than one.
        //   gammafn(x) can still overflow for x ~ 1e-308,
        //   but the result would too.
        //
        return (1 / gamma(a + b)) * gamma(a) * gamma(b);
    } else {
        const val: number = lbeta(a, b);
        // underflow to 0 is not harmful per se;  exp(-999) also gives no warning
        //#ifndef IEEE_754
        if (val < lnsml) {
            // a and/or b so big that beta underflows
            ML_ERROR3(printer_beta, ME.ME_UNDERFLOW, 'beta');
            // return ML_UNDERFLOW; pointless giving incorrect value
        }
        //#endif
        return exp(val);
    }
}

export default beta;
