

import createNS from '@common/debug-frontend';
import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_DT_0, R_DT_1, R_DT_val, round, trunc, M_LN2, exp, isNaN, isFinite } from '@lib/r-func';
import { cpu_csignrank } from './csignrank';
import { growMemory, memory } from './csignrank_wasm';

import type { CSingRank, CSignRankMap } from './csignrank_wasm';

const printer = createNS('psignrank');

let _csignrank: CSingRank = cpu_csignrank;

function registerBackend(fns: CSignRankMap): void {
    _csignrank = fns.csignrank;
}

function unRegisterBackend(): boolean {
    _csignrank = cpu_csignrank;
    return _csignrank === cpu_csignrank ? false : true;
}

export { unRegisterBackend, registerBackend };

export function psignrank(q: number, n: number, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(n)) {
        return NaN;
    }
    if (!isFinite(n) || n <= 0) {
        return ML_ERR_return_NAN2(printer);
    }

    q = round(q + 1e-7);

    if (q < 0.0) {
        return R_DT_0(lowerTail, logP);
    }

    if (q >= (n * (n + 1)) / 2) {
        return R_DT_1(lowerTail, logP); //returns 1 on the edge case or 0 (because log(1)= 0)
    }

    // ints
    n = round(n);
    const u = (n * (n + 1)) / 2;
    const c = trunc(u / 2);

    growMemory(c + 1);
    new Float64Array(memory.buffer).fill(0, 0, c + 1);

    const f = exp(-n * M_LN2);
    let p = 0;

    if (q <= u / 2) {
        //smaller then mean
        for (let i = 0; i <= q; i++) {
            p += _csignrank(i, n, u, c) * f;
        }
    } else {
        q = (n * (n + 1)) / 2 - q;
        for (let i = 0; i < q; i++) {
            p += _csignrank(i, n, u, c) * f;
        }
        lowerTail = !lowerTail; /* p = 1 - p; */
    }
    return R_DT_val(lowerTail, logP, p);
}
