'use strict';
export { Uniform } from './uniform';
export { Normal } from './normal';
export { LogNormal } from './lognormal';
export { rng, IRNG } from './rng';
export { Beta } from '~beta';
export { Poisson } from './poisson';
export { Cauchy } from './cauchy';
export { Binomial } from './binomial';
export { NegativeBinomial } from './binomial-negative';
export { ChiSquared } from './chi-2';
import { special as betaSpecial } from '~beta';
import { special as gammaSpecial } from '~gamma';

export const special = Object.freeze({
  ...gammaSpecial,
  ...betaSpecial
});

//export * as rfunc from './r-func';

//https://github.com/Microsoft/TypeScript/pull/19852
//Fix declaration emit for exported export alias specifiers

export * from './bessel';
//export * from './beta';

export * from './chebyshev';
export * from './chi-2';
//export * from './common';
//export * from './deviance';
//export * from './exp';
export * from './f-distro';
//export * from './gamma';
export * from './geometric';
export * from './hypergeometric';
//export * from './rng';
export * from './r-func';
export * from './bessel';
//export * from './beta';
export * from './binomial';
export * from './binomial-negative';

//export * from './poisson';
