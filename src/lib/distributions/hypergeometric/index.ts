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
export { dhyper } from './dhyper.js';
export { phyper } from './phyper.js';
export { qhyper } from './qhyper.js';
import { registerBackend as registerQHyperBackend, unRegisterBackend as unRegisterQHyperBackend } from './qhyper.js';
import { rhyperOne } from './rhyper.js';
import { globalUni } from '@rng/global-rng.js';
import { repeatedCall64 } from '@lib/r-func.js';
import { initWasm as initWasmQhyper } from './qhyper_wasm.js';
import type { QHyperFunctionMap } from './qhyper_wasm.js'

//rhyper(nn, m, n, k)
export function rhyper(N: number, nn1in: number, nn2in: number, kkin: number, rng = globalUni()): Float64Array {
   return repeatedCall64(N, rhyperOne, nn1in, nn2in, kkin, rng);
}

export async function useWasmBackends(): Promise<void> {
   const fns: QHyperFunctionMap = await initWasmQhyper();
   registerQHyperBackend(fns);
   //  accellerate more functions ??
}

export function clearBackends(): boolean {
   return unRegisterQHyperBackend(); // && unRegisterPHyperBackend etc
}
