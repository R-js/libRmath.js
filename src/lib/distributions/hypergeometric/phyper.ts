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

import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_D_Lval, R_DT_0, R_DT_1 } from '@lib/r-func';
import { R_DT_log } from '@dist/exp/expm1';
import { dhyper } from './dhyper';

//NOTE: p[d]hyper is not  typo!!
//const printer_pdhyper = debug('pdhyper');

function pdhyper(x: number, NR: number, NB: number, n: number, logP: boolean): number {
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
    return logP ? Math.log1p(ss) : 1 + ss;
}

/* FIXME: The old phyper() code was basically used in ./qhyper.c as well
 * -----  We need to sync this again!
 */
const printer_phyper = debug('phyper');

export function phyper(x: number, nr: number, nb: number, nn: number, lowerTail = true, logP = false): number {
    /* Sample of  n balls from  NR red  and	 NB black ones;	 x are red */
    let lower_tail = lowerTail; //copy it gets changed

        
    if (isNaN(x)
        ||
        isNaN(nr)
        ||
        isNaN(nb)
        ||
        isNaN(nn)
    ) return NaN;

    x = Math.floor(x + 1e-7);
    nr = Math.round(nr);
    nb = Math.round(nb);
    nn = Math.round(nn);

    if (
        nr < 0
        ||
        nb < 0
        ||
        !isFinite(nr + nb)
        ||
        nn < 0
        ||
        nn > nr + nb) {
        return ML_ERR_return_NAN2(printer_phyper, lineInfo4);
    }

    /*

    (x * (nr + nb) > nn * nr)

    view below like this
    
    with k == nn
    
    x/k > nr/(nr+nb) (here we devided away nr = 0 from the original equation)
    hence  nr/(nr+nb) alwaus < 1 unless nr=0 or nb=0 (but not both) then nr/(nr+nb) == 1
        
    */
    // condition A
    const ox = x;
    const onn = nn;
    const onr = nr;
    const onb = nb;
    if (x * (nr + nb) > nn * nr) {
        /* Swap tails.	*/
        const oldnb = nb;
        nb = nr;
        nr = oldnb;
        x = nn - x - 1;
        lower_tail = !lower_tail;
    }

    if (x < 0 || x < nn - nb) return R_DT_0(lower_tail, logP);
    // if x>=nr then also x>=nn (this is true at the same time because of condition A)
    // these clauses cannot be true at the same time:
    //   1. condition A ot be not true
    //   2. (x >= k AND x < nr) 
    if (x >= nr){
        return R_DT_1(lower_tail, logP);
    }

    if(x >= nn) { // this condition does not happen? (see above)
        printer_phyper('trace x>=nn x=%d nr=%d nb=%d nn=%d', ox, onr, onb, onn);
        return R_DT_1(lower_tail, logP);
    }

    const d = dhyper(x, nr, nb, nn, logP);

    if (
        (!logP && d == 0.)
        ||
        (logP && d == -Infinity)
    ) {
        return R_DT_0(lowerTail, logP);
    }

    const pd = pdhyper(x, nr, nb, nn, logP);

    return logP ? R_DT_log(lower_tail, logP, d + pd) : R_D_Lval(lower_tail, d * pd);
}
