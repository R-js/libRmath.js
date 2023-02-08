'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
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
export { dsignrank } from './dsign';

export { psignrank } from './psign';
export { qsignrank } from './qsign';
import {  unRegisterBackend as unregister_dsign_backend, registerBackend as register_dsign_backend  } from './dsign';
import {  unRegisterBackend as unregister_qsign_backend, registerBackend as register_qsign_backend  } from './qsign';
import {  unRegisterBackend as unregister_psign_backend, registerBackend as register_psign_backend  } from './psign';
import { rsignrankOne } from './rsign';
import { repeatedCall64 } from '@lib/r-func';

import { initWasm as initSignRankBackend } from './csignrank_wasm';
import type { CSignRankMap } from './csignrank_wasm';

export function rsignrank(nn: number, n: number): Float64Array {
   return repeatedCall64(nn, rsignrankOne,  n);
}

function useWasmBackendSignRank() {
   const fns: CSignRankMap = initSignRankBackend();
   register_dsign_backend(fns);
   register_qsign_backend(fns);
   register_psign_backend(fns);
}

function clearBackendSignRank(): boolean {
   let rc =0;
   if (unregister_dsign_backend()){
      rc++;
   }
   if (unregister_qsign_backend()){
      rc++;
   }
   if (unregister_psign_backend()){
      rc++;
   }
   return (rc === 3) ? true: false;
}

export { useWasmBackendSignRank, clearBackendSignRank, rsignrankOne }
