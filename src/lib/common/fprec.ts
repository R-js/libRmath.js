/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import {
    R_pow_di
} from '../common/_general';

const { floor, abs: fabs, log10, round, round: R_rint } = Math;
const { isFinite: R_FINITE, isNaN: ISNAN } = Number;

/* Improvements by Martin Maechler, May 1997;
   further ones, Feb.2000:
   Replace  pow(x, (double)i) by  R_pow_di(x, i) {and use  int dig} */

const MAX_DIGITS = 22;
/* was till R 0.99: DBL_DIG := digits of precision of a double, usually 15 */
/* FIXME: Hmm, have quite a host of these:

       1) ./fround.c   uses much more (sensibly!) ``instead''
       2) ../main/coerce.c   & ../main/deparse.c have  DBL_DIG	directly
       3) ../main/options.c has	  #define MAX_DIGITS 22	 for options(digits)

       Really should decide on a (config.h dependent?) global MAX_DIGITS.
       --MM--
     */


export function fprec(x: number, digits: number): number {

    let l10: number;
    let pow10: number;
    let sgn: number;
    let p10: number;
    let P10: number;

    let e10: number;
    let e2: number;
    let do_round: boolean;
    let dig: number;

    /* Max.expon. of 10 (=308.2547) */
    const max10e = Math.log10(Number.MAX_VALUE);

    if (ISNAN(x) || ISNAN(digits))
        return x + digits;
    if (!R_FINITE(x)) return x;
    if (!R_FINITE(digits)) {
        if (digits > 0.0) return x;
        else digits = 1.0;
    }
    if (x === 0) return x;
    dig = round(digits);
    if (dig > MAX_DIGITS) {
        return x;
    } else if (dig < 1)
        dig = 1;

    sgn = 1.0;
    if (x < 0.0) {
        sgn = -sgn;
        x = -x;
    }
    l10 = log10(x);
    e10 = (dig - 1 - floor(l10));
    if (fabs(l10) < max10e - 2) {
        p10 = 1.0;
        if (e10 > max10e) { /* numbers less than 10^(dig-1) * 1e-308 */
            p10 = R_pow_di(10., e10 - max10e);
            e10 = max10e;
        }
        if (e10 > 0) { /* Try always to have pow >= 1
             and so exactly representable */
            pow10 = R_pow_di(10., e10);
            return (sgn * (R_rint((x * pow10) * p10) / pow10) / p10);
        } else {
            pow10 = R_pow_di(10., -e10);
            return (sgn * (R_rint((x / pow10)) * pow10));
        }
    } else { /* -- LARGE or small -- */
        do_round = max10e - l10 >= R_pow_di(10., -dig);
        e2 = dig + ((e10 > 0) ? 1 : -1) * MAX_DIGITS;
        p10 = R_pow_di(10., e2); x *= p10;
        P10 = R_pow_di(10., e10 - e2); x *= P10;
        /*-- p10 * P10 = 10 ^ e10 */
        if (do_round) x += 0.5;
        x = floor(x) / p10;
        return (sgn * x / P10);
    }
}
