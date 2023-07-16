import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { exp, round, log as _log, sqrt, abs } from '@lib/r-func';

import { DBL_MANT_DIG, DBL_MIN_EXP, ldexp, M_1_SQRT_2PI, M_LN2, M_LN_SQRT_2PI, R_D__0 } from '@lib/r-func';

const printer = debug('dnorm');

const PRECISION_LIMIT = sqrt(-2 * M_LN2 * (DBL_MIN_EXP + 1 - DBL_MANT_DIG));

export function dnorm4(x: number, mean = 0, sd = 1, log = false): number {
    if (isNaN(x) || isNaN(mean) || isNaN(sd)) {
        return NaN;
    }

    if (!isFinite(sd)) {
        return R_D__0(log);
    }

    if (!isFinite(x) && mean === x) {
        return NaN; /* x-mean is NaN */
    }

    if (sd <= 0) {
        if (sd < 0) {
            return ML_ERR_return_NAN2(printer, lineInfo4);
        }
        /* sd == 0 */
        return x === mean ? Infinity : R_D__0(log);
    }

    x = (x - mean) / sd;

    if (!isFinite(x)) return R_D__0(log);

    x = abs(x);
    if (x >= 2 * sqrt(Number.MAX_VALUE)) {
        return R_D__0(log);
    }
    if (log) {
        return -(M_LN_SQRT_2PI + 0.5 * x * x + _log(sd));
    }

    if (x < 5) return (M_1_SQRT_2PI * exp(-0.5 * x * x)) / sd;

    /* ELSE:

     * x*x  may lose upto about two digits accuracy for "large" x
     * Morten Welinder's proposal for PR#15620
     * https://bugs.r-project.org/bugzilla/show_bug.cgi?id=15620

     * -- 1 --  No hoop jumping when we underflow to zero anyway:

     *  -x^2/2 <         log(2)*.Machine$double.min.exp  <==>
     *     x   > sqrt(-2*log(2)*.Machine$double.min.exp) =IEEE= 37.64031
     * but "thanks" to denormalized numbers, underflow happens a bit later,
     *  effective.D.MIN.EXP <- with(.Machine, double.min.exp + double.ulp.digits)
     * for IEEE, DBL_MIN_EXP is -1022 but "effective" is -1074
     * ==> boundary = sqrt(-2*log(2)*(.Machine$double.min.exp + .Machine$double.ulp.digits))
     *              =IEEE=  38.58601
     * [on one x86_64 platform, effective boundary a bit lower: 38.56804]
     */
    if (x > PRECISION_LIMIT) {
        return 0;
    }

    /* Now, to get full accurary, split x into two parts,
   /* Now, to get full accurary, split x into two parts,
     *  x = x1+x2, such that |x2| <= 2^-16.
     * Assuming that we are using IEEE doubles, that means that
     * x1*x1 is error free for x<1024 (but we have x < 38.6 anyway).

     * If we do not have IEEE this is still an improvement over the naive formula.
     */
    const x1 = ldexp(round(ldexp(x, 16)), -16); //  R_forceint(x * 65536) / 65536 =
    const x2 = x - x1;
    return (M_1_SQRT_2PI / sd) * (exp(-0.5 * x1 * x1) * exp((-0.5 * x2 - x1) * x2));
}
