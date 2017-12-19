'use strict';
export { Beta } from '~beta';
export { Binomial } from './binomial';
export { NegativeBinomial } from './binomial-negative';
export { Cauchy } from './cauchy';
export { ChebyshevSeries } from './chebyshev';
export { ChiSquared } from './chi-2';
export { Exponential } from './exp';
export { FDist } from './f-distro';
export { Gamma } from './gamma';
export { Geometric } from './geometric';
export { HyperGeometric } from './hypergeometric';
export { Logistic} from './logis';
export { LogNormal } from './lognormal';
export { MultiNomial } from './multinom';
//
export { Uniform } from './uniform';
export { Normal } from './normal';

export { rng, IRNG } from './rng';

export { Poisson } from './poisson';








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


