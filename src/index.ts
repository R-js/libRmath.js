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

// distributions
export * from '@dist/beta/index.js';
export * from '@dist/binomial/index.js';
export * from '@dist/binomial-negative/index.js';
export * from '@dist/cauchy/index.js';
export * from '@dist/chi-2/index.js';
export * from '@dist/exp/index.js';
export * from '@dist/f-distro/index.js';
export * from '@dist/gamma/index.js';
export * from '@dist/geometric/index.js';
export * from '@dist/hypergeometric/index.js';
export * from '@dist/logis/index.js';
export * from '@dist/lognormal/index.js';
export * from '@dist/multinom/index.js';
export * from '@dist/normal/index.js';
export * from '@dist/poisson/index.js';
export { 
    useWasmBackend as useSignRankBackend, 
    clearBackend as clearSignRankBackend,
    dsignrank,
    psignrank,
    qsignrank,
    rsignrank
} from '@dist/signrank/index.js';
export * from '@dist/student-t/index.js';
export * from '@dist/tukey/index.js';
export * from '@dist/uniform/index.js';
export * from '@dist/weibull/index.js';
export * from '@dist/wilcoxon/index.js';

//rng's
export * from '@rng/index.js';
//special
export * from '@special/bessel/index.js';
export * from '@special/gamma/index.js';
export * from '@special/beta/index.js';
export * from '@special/choose/index.js';


export { chebyshev_eval, chebyshev_init } from './lib/chebyshev/index.js';
export { hypot, log1p as log1pR } from './lib/alt/log/index.js';


