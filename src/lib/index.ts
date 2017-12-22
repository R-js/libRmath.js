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
export { StudentT } from './student-t';
//  trigonometry, no need to export, it is a util
export { Tukey } from './tukey';
export { Uniform } from './uniform';
export { Weibull } from './weibull';
export { Wilcoxon } from './wilcoxon';
/*
  Class of Special functions collected here.  
*/
import { special as betaSpecial } from '~beta';
import { special as gammaSpecial } from '~gamma';
import { special as chooseSpecial } from '~common';
//TODO: bessel equations

export const special = Object.freeze({
  ...gammaSpecial,
  ...betaSpecial,
  ...chooseSpecial
});

import {
  vectorize,
  selector,
  seq,
  flatten,
  arrayrify,
  forceToArray,
  possibleScalar
} from '~R';

export const R = {
  selector,
  seq,
  flatten,
  arrayrify,
  forceToArray,
  vectorize
};
