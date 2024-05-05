

import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4, R_Q_P01_boundaries } from '@common/logger';
import { R_DT_CIv, R_DT_qIv } from '@dist/exp/expm1';
import { abs, sqrt, log as _log } from '@lib/r-func';

const printer = debug('qnorm');

export function qnorm(p: number, mean = 0, sd = 1, lowerTail = true, logP = false): number {
    let r;
    let val;

    if (isNaN(p) || isNaN(mean) || isNaN(sd)) return NaN;

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, -Infinity, Infinity);
    if (rc !== undefined) {
        return rc;
    }
    if (sd < 0) return ML_ERR_return_NAN2(printer, lineInfo4);
    if (sd === 0) return mean;

    const p_ = R_DT_qIv(lowerTail, logP, p); /* real lowerTail prob. p */
    const q = p_ - 0.5;

    printer('qnorm(p=%d, m=%d, s=%d, l.t.= %s, log= %s): q = %d', p, mean, sd, lowerTail, logP, q);

    /*-- use AS 241 --- */
    /* double ppnd16_(double *p, long *ifault)*/
    /*      ALGORITHM AS241  APPL. STATIST. (1988) VOL. 37, NO. 3
    
            Produces the normal deviate Z corresponding to a given lower
            tail area of P; Z is accurate to about 1 part in 10**16.
    
            (original fortran code used PARAMETER(..) for the coefficients
             and provided hash codes for checking them...)
    */
    if (abs(q) <= 0.425) {
        /* 0.075 <= p <= 0.925 */
        r = 0.180625 - q * q;
        val =
            (q *
                (((((((r * 2509.0809287301226727 + 33430.575583588128105) * r + 67265.770927008700853) * r +
                    45921.953931549871457) *
                    r +
                    13731.693765509461125) *
                    r +
                    1971.5909503065514427) *
                    r +
                    133.14166789178437745) *
                    r +
                    3.387132872796366608)) /
            (((((((r * 5226.495278852854561 + 28729.085735721942674) * r + 39307.89580009271061) * r +
                21213.794301586595867) *
                r +
                5394.1960214247511077) *
                r +
                687.1870074920579083) *
                r +
                42.313330701600911252) *
                r +
                1);
    } else {
        /* closer than 0.075 from {0,1} boundary */

        /* r = min(p, 1-p) < 0.075 */
        if (q > 0) {
            r = R_DT_CIv(lowerTail, logP, p);
        } else {
            /* 1-p */
            r = p_; /* = R_DT_Iv(p) ^=  p */
        }

        r = sqrt(-(logP && ((lowerTail && q <= 0) || (!lowerTail && q > 0)) ? p : /* else */ _log(r)));
        /* r = sqrt(-log(r))  <==>  min(p, 1-p) = exp( - r^2 ) */

        printer('close to 0 or 1: r = %7d', r);

        if (r <= 5) {
            /* <==> min(p,1-p) >= exp(-25) ~= 1.3888e-11 */
            r += -1.6;
            val =
                (((((((r * 7.7454501427834140764e-4 + 0.0227238449892691845833) * r + 0.24178072517745061177) * r +
                    1.27045825245236838258) *
                    r +
                    3.64784832476320460504) *
                    r +
                    5.7694972214606914055) *
                    r +
                    4.6303378461565452959) *
                    r +
                    1.42343711074968357734) /
                (((((((r * 1.05075007164441684324e-9 + 5.475938084995344946e-4) * r + 0.0151986665636164571966) * r +
                    0.14810397642748007459) *
                    r +
                    0.68976733498510000455) *
                    r +
                    1.6763848301838038494) *
                    r +
                    2.05319162663775882187) *
                    r +
                    1);
        } else {
            /* very close to  0 or 1 */
            r += -5;
            val =
                (((((((r * 2.01033439929228813265e-7 + 2.71155556874348757815e-5) * r + 0.0012426609473880784386) * r +
                    0.026532189526576123093) *
                    r +
                    0.29656057182850489123) *
                    r +
                    1.7848265399172913358) *
                    r +
                    5.4637849111641143699) *
                    r +
                    6.6579046435011037772) /
                (((((((r * 2.04426310338993978564e-15 + 1.4215117583164458887e-7) * r + 1.8463183175100546818e-5) * r +
                    7.868691311456132591e-4) *
                    r +
                    0.0148753612908506148525) *
                    r +
                    0.13692988092273580531) *
                    r +
                    0.59983220655588793769) *
                    r +
                    1);
        }

        if (q < 0.0) val = -val;
        /* return (q >= 0.)? r : -r ;*/
    }
    return mean + sd * val;
}
