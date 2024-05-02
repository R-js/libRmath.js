

export { dsignrank } from './dsign';

export { psignrank } from './psign';
export { qsignrank } from './qsign';
import { unRegisterBackend as unregister_dsign_backend, registerBackend as register_dsign_backend } from './dsign';
import { unRegisterBackend as unregister_qsign_backend, registerBackend as register_qsign_backend } from './qsign';
import { unRegisterBackend as unregister_psign_backend, registerBackend as register_psign_backend } from './psign';
import { rsignrankOne } from './rsign';
import { repeatedCall64 } from '@lib/r-func';

import { initWasm as initSignRankBackend } from './csignrank_wasm';
import type { CSignRankMap } from './csignrank_wasm';

export function rsignrank(nn: number, n: number): Float64Array {
    return repeatedCall64(nn, rsignrankOne, n);
}

function useWasmBackendSignRank(): void {
    const fns: CSignRankMap = initSignRankBackend();
    register_dsign_backend(fns);
    register_qsign_backend(fns);
    register_psign_backend(fns);
}

function clearBackendSignRank(): boolean {
    let rc = 0;
    if (unregister_dsign_backend()) {
        rc++;
    }
    if (unregister_qsign_backend()) {
        rc++;
    }
    if (unregister_psign_backend()) {
        rc++;
    }
    return rc === 3 ? true : false;
}

export { useWasmBackendSignRank, clearBackendSignRank, rsignrankOne };
