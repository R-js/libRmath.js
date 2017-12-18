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
export { Exponential } from './exp';
export { Gamma } from './gamma';
export {FDist} from './f-distro';

import { special as betaSpecial } from '~beta';
import { special as gammaSpecial } from '~gamma';


export const special = Object.freeze({
  ...gammaSpecial,
  ...betaSpecial
});

import { selector, seq, flatten } from '~R';

export const R = {
  selector,
  seq,
  flatten
};

export * from './bessel';
export * from './chebyshev';

export * from './geometric';
export * from './hypergeometric';

