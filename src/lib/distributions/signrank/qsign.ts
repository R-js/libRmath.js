'use strict';

import createNS from '@mangos/debug-frontend';
import { ML_ERR_return_NAN2, lineInfo4, R_Q_P01_check, ML_ERROR2, ME } from '@common/logger';
import { R_DT_qIv } from '@dist/exp/expm1';
import { cpu_csignrank } from './csignrank';

import { R_DT_0, R_DT_1, round, DBL_MIN_VALUE_LN, M_LN2, isNaN, isFinite, DBL_EPSILON, trunc, exp } from '@lib/r-func';
import { growMemory } from './csignrank_wasm';

import type { CSingRank, CSignRankMap } from './csignrank_wasm';

const printer = debug('qsignrank');

const PRECISION_LOWER_LIMIT = -DBL_MIN_VALUE_LN / M_LN2;

let _csignrank: CSingRank = cpu_csignrank;

function registerBackend(fns: CSignRankMap): void {
    _csignrank = fns.csignrank;
}

function unRegisterBackend(): boolean {
    _csignrank = cpu_csignrank;
    return _csignrank === cpu_csignrank ? false : true;
}

export { unRegisterBackend, registerBackend };

export function qsignrank(p: number, n: number, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(n)) {
        return NaN;
    }

    if (logP) {
        if (p === -Infinity) {
            p = 0;
            logP = false;
        } else if (p === 0) {
            p = 1;
            logP = false;
        }
    }

    if (!isFinite(p) || !isFinite(n)) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    // precision check, add this to upstream r-source
    // Note: the calculation of  (see below in source) const f = exp(-n * M_LN2);
    // will be zero if n > -1074
    if (n > PRECISION_LOWER_LIMIT) {
        //
        ML_ERROR2(ME.ME_UNDERFLOW, 'n > 1074', printer);
        return NaN;
    }

    const rc = R_Q_P01_check(logP, p);
    if (rc !== undefined) {
        return rc;
    }

    if (n <= 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (p === R_DT_0(lowerTail, logP)) {
        return 0;
    }

    n = round(n);
    const u = (n * (n + 1)) / 2;
    const c = trunc(u / 2);

    if (p === R_DT_1(lowerTail, logP)) {
        return u;
    }

    if (logP || !lowerTail) {
        p = R_DT_qIv(lowerTail, logP, p); // lower_tail, non-log "p"
    }

    growMemory(c + 1);
    // M_LN2 = 0.693147180559945309417232121458
    const f = exp(-n * M_LN2);
    let _p = 0;
    let q = 0;
    if (p <= 0.5) {
        p = p - 10 * DBL_EPSILON;
        for (;;) {
            _p += _csignrank(q, n, u, c) * f;
            if (_p >= p) break;
            q++;
        }
    } else {
        p = 1 - p + 10 * DBL_EPSILON;
        for (;;) {
            _p += _csignrank(q, n, u, c) * f;
            if (_p > p) {
                q = trunc(u - q);
                break;
            }
            q++;
        }
    }
    return q;
}
