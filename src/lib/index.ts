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
export * from '@dist/beta';
export * from '@dist/binomial';
export * from '@dist/binomial-negative';
export * from '@dist/cauchy';
export * from '@dist/chi-2';
export * from '@dist/exp';
export * from '@dist/f-distro';
export * from '@dist/gamma';
export * from '@dist/geometric';
export * from '@dist/hypergeometric';
export * from '@dist/logis';
export * from '@dist/lognormal';
export * from '@dist/multinom';
export * from '@dist/normal';
export * from '@dist/poisson';
export * from '@dist/signrank';
export * from '@dist/student-t';
export * from '@dist/tukey';
export * from '@dist/uniform';
export * from '@dist/weibull';
export * from '@dist/wilcoxon';

//rng's
export * from '@rng/index';
//special
export * from '@special/bessel';
export * from '@special/gamma';
export * from '@special/beta';
export * from '@special/choose';


export { chebyshev_eval, chebyshev_init } from './chebyshev';
export { hypot, log1p as log1pR } from './alt/log/index';


