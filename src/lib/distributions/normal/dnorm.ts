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

import { debug  } from 'debug';
import {
    ML_ERR_return_NAN
} from '@common/logger';

import {
    DBL_MANT_DIG,
    DBL_MIN_EXP,
    ldexp,
    M_1_SQRT_2PI,
    M_LN2,
    M_LN_SQRT_2PI,
    R_D__0
} from '$constants';

const printer = debug('dnorm4');

export function dnorm4(x: number, mu = 0, sigma = 1, give_log = false): number {
    if (isNaN(x) || isNaN(mu) || isNaN(sigma)) {
        return NaN;
    }

    if (!isFinite(sigma)) {
        return R_D__0(give_log);
    }

    if (!isFinite(x) && mu === x) {
        return NaN; /* x-mu is NaN */
    }

    if (sigma <= 0) {
        if (sigma < 0) {
            return ML_ERR_return_NAN(printer);
        }
        /* sigma == 0 */
        return x === mu ? Infinity : R_D__0(give_log);
    }
    x = (x - mu) / sigma;

    if (!isFinite(x)) return R_D__0(give_log);

    x = Math.abs(x);
    if (x >= 2 * Math.sqrt(Number.MAX_VALUE)) return R_D__0(give_log);
    if (give_log) {
        return -(M_LN_SQRT_2PI + 0.5 * x * x + Math.log(sigma));
    }

    if (x < 5) return (M_1_SQRT_2PI * Math.exp(-0.5 * x * x)) / sigma;

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
    if (x > Math.sqrt(-2 * M_LN2 * (DBL_MIN_EXP + 1 - DBL_MANT_DIG))) {
        return 0;
    }

    /* Now, to get full accurary, split x into two parts,
   /* Now, to get full accurary, split x into two parts,
     *  x = x1+x2, such that |x2| <= 2^-16.
     * Assuming that we are using IEEE doubles, that means that
     * x1*x1 is error free for x<1024 (but we have x < 38.6 anyway).

     * If we do not have IEEE this is still an improvement over the naive formula.
     */
    const x1 = ldexp(Math.round(ldexp(x, 16)), -16); //  R_forceint(x * 65536) / 65536 =
    const x2 = x - x1;
    return (M_1_SQRT_2PI / sigma) * (Math.exp(-0.5 * x1 * x1) * Math.exp((-0.5 * x2 - x1) * x2));
}
