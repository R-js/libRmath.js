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

export { chebyshev_eval, chebyshev_init } from './lib/chebyshev/chebyshev';
export { hypot, log1p as log1pR } from './lib/alt/log/log1p';


// distributions
export * from './lib/distributions/beta';
export * from './lib/distributions/binomial';
export * from './lib/distributions/binomial-negative';
export * from './lib/distributions/cauchy';
export * from './lib/distributions/chi-2';
export * from './lib/distributions/exp';
export * from './lib/distributions/f-distro';
export * from './lib/distributions/gamma';
export * from './lib/distributions/geometric';
export * from './lib/distributions/hypergeometric';
export * from './lib/distributions/logis';
export * from './lib/distributions/lognormal';
export * from './lib/distributions/multinom';
export * from './lib/distributions/normal';
export * from './lib/distributions/poisson';
export * from './lib/distributions/signrank';
export * from './lib/distributions/student-t';
export * from './lib/distributions/tukey';
export * from './lib/distributions/uniform';
export * from './lib/distributions/weibull';
export * from './lib/distributions/wilcoxon';

export { 
    useWasmBackend as useSignRankBackend, 
    clearBackend as clearSignRankBackend,
    dsignrank,
    psignrank,
    qsignrank,
    rsignrank
} from './lib/distributions/signrank';

//rng (uniform)
export * from './lib/rng/knuth-taocp';
export * from './lib/rng/knuth-taocp-2002';
export * from './lib/rng/lecuyer-cmrg';
export * from './lib/rng/mersenne-twister';
export * from './lib/rng/super-duper';
export * from './lib/rng/marsaglia-multicarry';
export * from './lib/rng/wichmann-hill';
//rng (normal)
export * from './lib/rng/normal/ahrens-dieter';
export * from './lib/rng/normal/inversion';
export * from './lib/rng/normal/box-muller';
export * from './lib/rng/normal/buggy-kinderman-ramage';
export * from './lib/rng/normal/kinderman-ramage';

export { seed } from './lib/rng/timeseed';
// stubs
export { IRNG, MessageType } from './lib/rng/irng';
export { IRNGNormal } from './lib/rng/normal/normal-rng';
export { IRNGTypeEnum } from './lib/rng/irng-type';
export { IRNGNormalTypeEnum } from './lib/rng/normal/in01-type';
// globalRNG
export { globalUni, globalNorm, RNGKind } from './lib/rng/global-rng';
export { IRNGSampleKindTypeEnum } from './lib/rng/sample-kind-type';


// special
export * from './lib/special/bessel';
export * from './lib/special/beta';
export * from './lib/special/choose';
export * from './lib/special/gamma';

// trigonometry
export * from './lib/stirling';
export * from './lib/trigonometry/cospi';
export * from './lib/trigonometry/sinpi';
export * from './lib/trigonometry/tanpi';
