'use strict';

export { Beta } from './beta';
export { Binomial } from './binomial';
export { NegativeBinomial } from './binomial-negative';
export { Cauchy } from './cauchy';
export { chebyshev_eval, chebyshev_init } from './chebyshev';
export { ChiSquared } from './chi-2';
export { Exponential } from './exp';
export { FDist } from './f-distro';
export { Gamma } from './gamma';
export { Geometric } from './geometric';
export { HyperGeometric } from './hypergeometric';
export { Logistic } from './logis';
export { LogNormal } from './lognormal';
export { Multinomial, IdmultinomOptions } from './multinom';
export { Normal } from './normal';
export { Poisson } from './poisson';
export { rng, IRNG, IRNGNormal } from './rng';
export { SignRank } from './signrank';
//  stirling, no need to export, it is a util
export { StudentT } from './student-t';
//  trigonometry, no need to export, it is a util
export { Tukey } from './tukey';
export { Uniform } from './uniform';
export { Weibull } from './weibull';
export { Wilcoxon } from './wilcoxon';
export { hypot, log1p as log1pR } from './log';
/*
  Class of Special functions collected here.  
*/
import { special as besselSpecial } from './bessel';
import { special as betaSpecial } from './beta';
import { special as chooseSpecial } from './common';
import { special as gammaSpecial } from './gamma';

export const special = Object.freeze({
  ...gammaSpecial,
  ...betaSpecial,
  ...chooseSpecial,
  ...besselSpecial
});

import {
  any,
  arrayrify,
  //asVector,
  asArray,
  div,
  each,
  // forceToArray,
  flatten,
  flatten as c, //alias
  isOdd,
  ISummary,
  map,
  mult,
  multiplex,
  multiplexer,
  numberPrecision,
  selector,
  seq,
  sum,
  summary,
  Welch_Satterthwaite
} from './r-func';

export { ISummary };

export const R = {
  any,
  arrayrify,
  asArray,
  //asVector,
  div,
  flatten,
  isOdd,
  map,
  each,
  mult,
  multiplex,
  multiplexer,
  numberPrecision,
  selector,
  seq,
  sum,
  summary,
  Welch_Satterthwaite,
  c
};
