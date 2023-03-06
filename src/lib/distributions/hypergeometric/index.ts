
export { dhyper } from './dhyper';
export { phyper } from './phyper';
export { qhyper } from './qhyper';
import { registerBackend, unRegisterBackend } from './qhyper';
import { rhyperOne } from './rhyper';
import { repeatedCall64 } from '@lib/r-func';
import { initWasm as initWasmQhyper } from './qhyper_wasm';
import type { QHyperFunctionMap } from './qhyper_wasm';

export function rhyper(nn: number, m: number, n: number, k: number): Float64Array {
   return repeatedCall64(nn, rhyperOne, m, n, k);
}

export function useWasmBackendHyperGeom(): void {
   const fns: QHyperFunctionMap = initWasmQhyper();
   registerBackend(fns);
}

export function clearBackendHyperGeom(): boolean {
   return unRegisterBackend();
}

export  { rhyperOne };
