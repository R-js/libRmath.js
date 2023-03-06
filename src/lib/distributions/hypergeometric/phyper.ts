
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

export function phyper(q: number, m: number, n: number, k: number, lowerTail = true, logP = false): number {
    /* Sample of  n balls from  NR red  and	 NB black ones;	 q are red */
    let lower_tail = lowerTail; //copy it gets changed

        
    if (isNaN(q)
        ||
        isNaN(m)
        ||
        isNaN(n)
        ||
        isNaN(k)
    ) return NaN;

    q = Math.floor(q + 1e-7);
    m = Math.round(m);
    n = Math.round(n);
    k = Math.round(k);

    if (
        m < 0
        ||
        n < 0
        ||
        !isFinite(m + n)
        ||
        k < 0
        ||
        k > m + n) {
        return ML_ERR_return_NAN2(printer_phyper, lineInfo4);
    }

    /*

    (q * (m + n) > k * m)

    view below like this
    
    with k == k
    
    q/k > m/(m+n) (here we devided away m = 0 from the original equation)
    hence  m/(m+n) alwaus < 1 unless m=0 or n=0 (but not both) then m/(m+n) == 1
        
    */
    // condition A
    const ox = q;
    const onn = k;
    const onr = m;
    const onb = n;
    if (q * (m + n) > k * m) {
        /* Swap tails.	*/
        const oldnb = n;
        n = m;
        m = oldnb;
        q = k - q - 1;
        lower_tail = !lower_tail;
    }

    if (q < 0 || q < k - n) return R_DT_0(lower_tail, logP);
    // if q>=m then also q>=k (this is true at the same time because of condition A)
    // these clauses cannot be true at the same time:
    //   1. condition A ot be not true
    //   2. (q >= k AND q < m) 
    if (q >= m){
        return R_DT_1(lower_tail, logP);
    }

    if(q >= k) { // this condition does not happen? (see above)
        printer_phyper('trace q>=k q=%d m=%d n=%d k=%d', ox, onr, onb, onn);
        return R_DT_1(lower_tail, logP);
    }

    const d = dhyper(q, m, n, k, logP);

    if (
        (!logP && d == 0.)
        ||
        (logP && d == -Infinity)
    ) {
        return R_DT_0(lowerTail, logP);
    }

    const pd = pdhyper(q, m, n, k, logP);

    return logP ? R_DT_log(lower_tail, logP, d + pd) : R_D_Lval(lower_tail, d * pd);
}
