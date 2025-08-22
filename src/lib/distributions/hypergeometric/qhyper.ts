import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2, R_Q_P01_boundaries } from '@common/logger';
import { lfastchoose } from '@lib/special/choose';
import { R_DT_qIv } from '@dist/exp/expm1';
import { DBL_EPSILON } from '@lib/r-func';

import type { QHyperFunctionMap, CalcQHyper } from './qhyper_wasm';

const printer_qhyper = createNS('qhyper');

const _d = new Float64Array(7);
const ixr = 0;
const isum = 1;
const ixb = 2;
const iterm = 3;
const iNR = 4;
const iNB = 5;

// init
let backendTinyN: CalcQHyper = cpuBackendTinyN;
let backendBigN: CalcQHyper = cpuBackendBigN;

export function registerBackend(fns: QHyperFunctionMap): void {
    backendTinyN = fns.calcTinyN;
    backendBigN = fns.calcBigN;
}

export function unRegisterBackend(): boolean {
    const previous = !!backendTinyN && !!backendBigN;

    backendTinyN = cpuBackendTinyN;
    backendBigN = cpuBackendBigN;

    return previous;
}

function cpuBackendTinyN(
    sum: number,
    term: number,
    p: number,
    xr: number,
    end: number,
    xb: number,
    NB: number,
    NR: number
): number {
    while (sum < p && xr < end) {
        //xr++
        xr++;

        NB++;
        term *= (NR / xr) * (xb / NB);
        sum += term;
        xb--;
        NR--;
    }
    return xr;
}

function cpuBackendBigN(
    sum: number,
    term: number,
    p: number,
    xr: number,
    end: number,
    xb: number,
    NB: number,
    NR: number
): number {
    while (sum < p && xr < end) {
        xr++;
        NB++;
        term += Math.log((NR / xr) * (xb / NB));
        sum += Math.exp(term);
        xb--;
        NR--;
    }
    return xr;
}

export function qhyper(p: number, m: number, n: number, k: number, lowerTail = true, logP = false): number {
    if (isNaN(p) || isNaN(m) || isNaN(n) || isNaN(k)) {
        return NaN;
    }

    if (!isFinite(p) || !isFinite(m) || !isFinite(n) || !isFinite(k)) {
        return ML_ERR_return_NAN2(printer_qhyper);
    }

    _d[iNR] = Math.round(m);
    _d[iNB] = Math.round(n);

    const N = _d[iNR] + _d[iNB];

    k = Math.round(k);
    if (_d[iNR] < 0 || _d[iNB] < 0 || k < 0 || k > N) {
        return ML_ERR_return_NAN2(printer_qhyper);
    }

    /* Goal:  Find  xr (= #{red balls in sample}) such that
     *   phyper(xr,  NR,NB, k) >= p > phyper(xr - 1,  NR,NB, k)
     */

    const xstart = Math.max(0, k - _d[iNB]);
    const xend = Math.min(k, _d[iNR]);

    const rc = R_Q_P01_boundaries(lowerTail, logP, p, xstart, xend);
    if (rc !== undefined) {
        return rc;
    }
    _d[ixr] = xstart;
    _d[ixb] = k - _d[ixr]; /* always ( = #{black balls in sample} ) */

    const small_N = N < 1000; /* won't have underflow in product below */
    /* if N is small,  term := product.ratio( bin.coef );
       otherwise work with its logarithm to protect against underflow */
    _d[iterm] = lfastchoose(_d[iNR], _d[ixr]) + lfastchoose(_d[iNB], _d[ixb]) - lfastchoose(N, k);
    if (small_N) _d[iterm] = Math.exp(_d[iterm]);
    _d[iNR] -= _d[ixr];
    _d[iNB] -= _d[ixb];

    if (!lowerTail || logP) {
        p = R_DT_qIv(lowerTail, logP, p);
    }
    p *= 1 - 1000 * DBL_EPSILON; /* was 64, but failed on FreeBSD sometimes */
    _d[isum] = small_N ? _d[iterm] : Math.exp(_d[iterm]);

    return small_N
        ? backendTinyN(_d[isum], _d[iterm], p, _d[ixr], xend, _d[ixb], _d[iNB], _d[iNR])
        : backendBigN(_d[isum], _d[iterm], p, _d[ixr], xend, _d[ixb], _d[iNB], _d[iNR]);
}
