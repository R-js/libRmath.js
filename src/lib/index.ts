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
export { Logistic } from './logis';
export { LogNormal } from './lognormal';
export { MultiNomial } from './multinom';
export { Normal } from './normal';
export { Poisson } from './poisson';
export { rng, IRNG } from './rng';
export { SignRank } from './signrank';
//  stirling, no need to export, it is a util
//  student-t
//  trigonometry
//  tukey
export { Uniform } from './uniform';
//  weibull
//  wilcox

/*
  Class of Special functions collected here.  
*/
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
