'use strict';

import { debug } from '@mangos/debug';
import { ML_ERR_return_NAN2, lineInfo4, } from '@common/logger';
import { cpu_csignrank } from './csignrank';
import { R_D__0, R_D_exp, isNaN, trunc, abs, log as _log, M_LN2, round } from '@lib/r-func';
import { growMemory, memory } from './csignrank_wasm';

import type { CSingRank, CSignRankMap } from './csignrank_wasm';

let _csignrank: CSingRank  = cpu_csignrank; 

function registerBackend(fns: CSignRankMap): void {
    _csignrank = fns.csignrank;
}

function unRegisterBackend(): boolean {
    _csignrank = cpu_csignrank
    return _csignrank === cpu_csignrank ? false: true
}

export { unRegisterBackend, registerBackend };

const printer = debug('dsignrank');

export function dsignrank(x: number, n: number, log = false): number {

    if (isNaN(x) || isNaN(n)) {
        return x + n;
    }

    if (n <= 0) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (abs(x - round(x)) > 1e-7) {
        return R_D__0(log);
    }

    // both "n" and "x" are typecasted to (int) 32bit signed integer 
    // so in original source they came into this function as doubles
    // this means that it makes no sense that n or x are greater then 
    // MAX_INT (about 2.7 billion)    

    n = trunc(n);
    x = round(x);

    if (x < 0 || x > (n * (n + 1)) / 2) {
        return R_D__0(log);
    }

    // int
    const u = n * (n + 1) / 2;
    // int
    const c = Math.trunc(u / 2)
    growMemory(c+1);
    new Float64Array(memory.buffer).fill(0, 0, c+1);
    
    const d = R_D_exp(log, _log(_csignrank(trunc(x), n, u, c)) - n * M_LN2);
    return d;
}


