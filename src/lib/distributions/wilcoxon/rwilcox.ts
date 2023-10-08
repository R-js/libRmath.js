'use strict';

import createNS from '@mangos/debug-frontend';
import { mapErrV2, ME } from '@common/logger';
import { round, trunc, floor } from '@lib/r-func';
import { R_unif_index } from '@rng/utils';
import { globalUni, globalSampleKind } from '@rng/global-rng';

const debug = createNS('rwilcox');

const MAXSIZE = 800_000_000;

export function rwilcoxOne(m: number, n: number): number {
    const rng = globalUni();
    const sampleKind = globalSampleKind();
    /* NaNs propagated correctly */
    if (isNaN(m) || isNaN(n)) {
        return m + n;
    }
    m = round(m);
    n = round(n);

    if (m < 0 || n < 0) {
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    if (m === 0 || n === 0) {
        return 0;
    }

    let k = trunc(m + n);

    if (k >= MAXSIZE) {
        debug(mapErrV2[ME.ME_DOMAIN], 'k > MAXSIZE(=2**32)');
        debug(mapErrV2[ME.ME_DOMAIN], debug.namespace);
        return NaN;
    }

    const x = new Uint32Array(k);
    //const s1 = Date.now();
    for (let i = 0; i < k; i++) {
        x[i] = i;
    }
    //const s2 = Date.now();
    //console.log((s2-s1)+" millisec");

    let r = 0.0;
    debug(`------v`);
    for (let i = 0; i < n; i++) {
        //console.log(i);
        const j = floor(R_unif_index(k, rng, sampleKind));
        r += x[j];
        x[j] = x[--k];
        debug('i:%d,\tn:%d\tj:%d\tk:%d\tr:%d\tx:%o', i, n, j, k, x);
    }
    return r - (n * (n - 1)) / 2;
}
