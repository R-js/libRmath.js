'use strict';

import { WilcoxonCache } from './WilcoxonCache';
import { trunc } from '@lib/r-func';

export function cwilcox(k: number, m: number, n: number, w: WilcoxonCache): number {
    let i;
    let j;

    const u = m * n;
    const c = trunc(u / 2);

    if (k < 0 || k > u) {
        return 0;
    }

    if (k > c) {
        k = u - k; /* hence  k <= floor(u / 2) */
    }

    if (m < n) {
        i = m;
        j = n;
    } else {
        i = n;
        j = m;
    } /* hence  i <= j */

    /*if (j === 0) {
    // and hence i == 0 
    console.log(`5. cwilcox: exit with k:${k}`);
    return k === 0 ? 1 : 0;
  }*/

    /*
     We can simplify things if k is small.  Consider the Mann-Whitney 
         definition, and sort y.  Then if the statistic is k, no more 
         than k of the y's can be <= any x[i], and since they are sorted 
         these can only be in the first k.  So the count is the same as
         if there were just k y's. 
  */

    if (j > 0 && k < j) {
        return cwilcox(k, i, k, w);
    }

    /*if (w[i][j] === undefined) {
      w[i][j] = new Array<number>(c + 1).fill(-1); //  (double *) calloc((size_t) c + 1, sizeof(double));
      //#ifdef MATHLIB_STANDALONE
      //if (!w[i][j]) MATHLIB_ERROR(_("wilcox allocation error %d"), 3);
      //#endif
      //NOTE: replaced by "fill" for (l = 0; l <= c; l++) w[i][j][l] = -1;
    }*/

    if (w.get(i, j, k) === undefined) {
        if (j === 0) {
            w.set(i, j, k, k === 0 ? 1 : 0);
        } else {
            const c1 = cwilcox(k - j, i - 1, j, w);
            const c2 = cwilcox(k, i, j - 1, w);
            w.set(i, j, k, c1 + c2);
        }
    }
    const result = w.get(i, j, k);
    if (result === undefined) {
        throw new Error('WilcoxonCache not set');
    }
    return result;
}
