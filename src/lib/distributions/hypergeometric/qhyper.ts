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
import { debug } from 'debug';
import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '@common/logger';
import { lfastchoose } from '@special/choose';
import { R_DT_qIv } from '@distributions/exp/expm1';

const printer_qhyper = debug('qhyper');

export function qhyper(p: number, nr: number, nb: number, n: number, lowerTail = true, logP = false): number {
    /* This is basically the same code as  ./phyper.c  *used* to be --> FIXME! */
    //let N;
    //let xstart;
    //let xend;
    let xr;
    let xb;
    let sum;
    let term;
    //let small_N;

    if (isNaN(p) || isNaN(nr) || isNaN(nb) || isNaN(n)) return NaN;

    if (/*!isFinite(p) ||*/ !isFinite(nr) || !isFinite(nb) || !isFinite(n)) return ML_ERR_return_NAN(printer_qhyper);

    let NR = Math.round(nr);
    let NB = Math.round(nb);
    const N = NR + NB;
    n = Math.round(n);
    if (NR < 0 || NB < 0 || n < 0 || n > N) return ML_ERR_return_NAN(printer_qhyper);

    /* Goal:  Find  xr (= #{red balls in sample}) such that
     *   phyper(xr,  NR,NB, n) >= p > phyper(xr - 1,  NR,NB, n)
     */

    const xstart = Math.max(0, n - NB);
    const xend = Math.min(n, NR);

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, xstart, xend);
    if (rc !== undefined) {
        return rc;
    }
    xr = xstart;
    xb = n - xr; /* always ( = #{black balls in sample} ) */

    const small_N = N < 1000; /* won't have underflow in product below */
    /* if N is small,  term := product.ratio( bin.coef );
       otherwise work with its logarithm to protect against underflow */
    term = lfastchoose(NR, xr) + lfastchoose(NB, xb) - lfastchoose(N, n);
    if (small_N) term = Math.exp(term);
    NR -= xr;
    NB -= xb;

    if (!lowerTail || logP) {
        p = R_DT_qIv(lowerTail, logP, p);
    }
    p *= 1 - 1000 * Number.EPSILON; /* was 64, but failed on FreeBSD sometimes */
    sum = small_N ? term : Math.exp(term);

    while (sum < p && xr < xend) {
        xr++;
        NB++;
        if (small_N) term *= (NR / xr) * (xb / NB);
        else term += Math.log((NR / xr) * (xb / NB));
        sum += small_N ? term : Math.exp(term);
        xb--;
        NR--;
    }
    return xr;
}
