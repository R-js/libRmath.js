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

/* want to compile log1p as Rlog1p if HAVE_LOG1P && !HAVE_WORKING_LOG1P */
import debug from 'debug';

import { chebyshev_eval } from '../../chebyshev/index.js';
import { ME, ML_ERR_return_NAN, ML_ERROR } from '@common/logger.js';

const { abs: fabs, max: fmax2, min: fmin2 } = Math;
const printer = debug('log1p');
const {
    NEGATIVE_INFINITY: ML_NEGINF,
    POSITIVE_INFINITY: ML_POSINF,
    EPSILON: DBL_EPSILON,
    isNaN: ISNAN,
    isFinite: R_FINITE,
} = Number;

export function log1p(x: number): number {
    // series for log1p on the interval -.375 to .375
    //				     with weighted error   6.35e-32
    //				      log weighted error  31.20
    //			    significant figures required  30.93
    //				 decimal places required  32.01
    //
    const alnrcs = [
        +0.10378693562743769800686267719098e1,
        -0.13364301504908918098766041553133,
        +0.1940824913552056335792619937475e-1,
        -0.30107551127535777690376537776592e-2,
        +0.48694614797154850090456366509137e-3,
        -0.81054881893175356066809943008622e-4,
        +0.13778847799559524782938251496059e-4,
        -0.23802210894358970251369992914935e-5,
        +0.41640416213865183476391859901989e-6,
        -0.73595828378075994984266837031998e-7,
        +0.13117611876241674949152294345011e-7,
        -0.23546709317742425136696092330175e-8,
        +0.42522773276034997775638052962567e-9,
        -0.771908941348407968261081074933e-10,
        +0.14075746481359069909215356472191e-10,
        -0.25769072058024680627537078627584e-11,
        +0.47342406666294421849154395005938e-12,
        -0.87249012674742641745301263292675e-13,
        +0.16124614902740551465739833119115e-13,
        -0.29875652015665773006710792416815e-14,
        +0.55480701209082887983041321697279e-15,
        -0.10324619158271569595141333961932e-15,
        +0.19250239203049851177878503244868e-16,
        -0.35955073465265150011189707844266e-17,
        +0.67264542537876857892194574226773e-18,
        -0.12602624168735219252082425637546e-18,
        +0.23644884408606210044916158955519e-19,
        -0.44419377050807936898878389179733e-20,
        +0.83546594464034259016241293994666e-21,
        -0.15731559416479562574899253521066e-21,
        +0.29653128740247422686154369706666e-22,
        -0.55949583481815947292156013226666e-23,
        +0.10566354268835681048187284138666e-23,
        -0.19972483680670204548314999466666e-24,
        +0.37782977818839361421049855999999e-25,
        -0.71531586889081740345038165333333e-26,
        +0.13552488463674213646502024533333e-26,
        -0.25694673048487567430079829333333e-27,
        +0.48747756066216949076459519999999e-28,
        -0.92542112530849715321132373333333e-29,
        +0.1757859784176023923326976e-29,
        -0.33410026677731010351377066666666e-30,
        +0.63533936180236187354180266666666e-31,
    ];
    //
    //#ifdef NOMORE_FOR_THREADS
    //    static int nlnrel = 0;
    //    static double xmin = 0.0;

    //    if (xmin == 0.0) xmin = -1 + sqrt(DBL_EPSILON);// was sqrt(d1mach(4));
    //    if (nlnrel == 0) // initialize chebychev coefficients
    //    nlnrel = chebyshev_init(alnrcs, 43, DBL_EPSILON/20);//was .1*d1mach(3)
    //#else
    //
    const nlnrel = 22;
    const xmin = -0.999999985;
    // 22: for IEEE double precision where DBL_EPSILON =  2.22044604925031e-16
    //#endif

    if (x === 0) return 0; // speed
    if (x === -1) return ML_NEGINF;
    if (x < -1) return ML_ERR_return_NAN(printer);

    if (fabs(x) <= 0.375) {
        // Improve on speed (only);
        // again give result accurate to IEEE double precision:
        if (fabs(x) < 0.5 * DBL_EPSILON) return x;

        if ((0 < x && x < 1e-8) || (-1e-9 < x && x < 0)) return x * (1 - 0.5 * x);
        // else
        return x * (1 - x * chebyshev_eval(x / 0.375, alnrcs, nlnrel));
    }
    // else
    if (x < xmin) {
        // answer less than half precision because x too near -1
        ML_ERROR(ME.ME_PRECISION, 'log1p', printer);
    }
    return Math.log(1 + x);
}

/* Used as a substitute for the C99 function hypot, which all currently
   known platforms have */

/* hypot(a,b)	finds sqrt(a^2 + b^2)
 *		without overflow or destructive underflow.
 */

export function hypot(a: number, b: number): number {
    let p: number;
    let r: number;
    let s: number;
    let t: number;
    let tmp: number;
    let u: number;

    if (ISNAN(a) || ISNAN(b)) {
        //* propagate Na(N)s:
        return a + b;
    }
    if (!R_FINITE(a) || !R_FINITE(b)) {
        return ML_POSINF;
    }
    p = fmax2(fabs(a), fabs(b));
    if (p !== 0.0) {
        // r = (min(|a|,|b|) / p) ^2
        tmp = fmin2(fabs(a), fabs(b)) / p;
        r = tmp * tmp;
        while (true) {
            t = 4.0 + r;
            // This was a test of 4.0 + r == 4.0, but optimizing
            //      compilers nowadays infinite loop on that.
            if (fabs(r) < 2 * DBL_EPSILON) break;
            s = r / t;
            u = 1 + 2 * s;
            p *= u;

            // r = (s / u)^2 * r
            tmp = s / u;
            r *= tmp * tmp;
        }
    }
    return p;
}
