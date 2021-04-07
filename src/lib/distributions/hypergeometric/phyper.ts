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
import { ML_ERR_return_NAN } from '@common/logger';
import { R_D_Lval, R_DT_0, R_DT_1 } from '$constants';
import { R_DT_log } from '@dist/exp/expm1';
import { dhyper } from './dhyper';

//NOTE: p[d]hyper is not  typo!!
//const printer_pdhyper = debug('pdhyper');

function pdhyper(x: number, NR: number, NB: number, n: number, log_p: boolean): number {
    /*
     * Calculate
     *
     *	    phyper (x, NR, NB, n, TRUE, FALSE)
     *   [log]  ----------------------------------
     *	       dhyper (x, NR, NB, n, FALSE)
     *
     * without actually calling phyper.  This assumes that
     *
     *     x * (NR + NB) <= n * NR
     *
     */

    let sum = 0;
    let term = 1;

    while (x > 0 && term >= Number.EPSILON * sum) {
        term *= (x * (NB - n + x)) / (n + 1 - x) / (NR + 1 - x);
        sum += term;
        x--;
    }

    const ss = sum;
    return log_p ? Math.log1p(ss) : 1 + ss;
}

/* FIXME: The old phyper() code was basically used in ./qhyper.c as well
 * -----  We need to sync this again!
 */
const printer_phyper = debug('phyper');

export function phyper(x: number, nr: number, nb: number, nn: number, lowerTail = true, logP = false): number {
    /* Sample of  n balls from  NR red  and	 NB black ones;	 x are red */
    let lower_tail = lowerTail; //copy it gets changed
    const log_p = logP;
    let NR = nr;
    let NB = nb;
    let n = nn;
    if (isNaN(x)
        ||
        isNaN(NR)
        ||
        isNaN(NB)
        ||
        isNaN(n)
    ) return NaN;

    x = Math.floor(x + 1e-7);
    NR = Math.round(NR);
    NB = Math.round(NB);
    n = Math.round(n);

    if (
        NR < 0
        ||
        NB < 0
        ||
        !isFinite(NR + NB)
        ||
        n < 0
        ||
        n > NR + NB) {
        return ML_ERR_return_NAN(printer_phyper);
    }

    if (x * (NR + NB) > n * NR) {
        /* Swap tails.	*/
        const oldNB = NB;
        NB = NR;
        NR = oldNB;
        x = n - x - 1;
        lower_tail = !lower_tail;
    }

    if (x < 0 || x < n - NB) return R_DT_0(lower_tail, log_p);
    if (x >= NR || x >= n) return R_DT_1(lower_tail, log_p);

    const d = dhyper(x, NR, NB, n, log_p);

    if (
        (!log_p && d == 0.)
        ||
        (log_p && d == -Infinity)
    ) {
        return R_DT_0(lowerTail, log_p);
    }

    const pd = pdhyper(x, NR, NB, n, log_p);

    return log_p ? R_DT_log(lower_tail, log_p, d + pd) : R_D_Lval(lower_tail, d * pd);
}
