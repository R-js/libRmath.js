import * as debug from 'debug';

import { ME, ML_ERROR, fmod } from '../common/_general';
const { NaN: ML_NAN, isNaN: ISNAN, isFinite: R_FINITE } = Number;

const { abs: fabs, PI: M_PI } = Math;

// tan(pi * x)  -- exact when x = k/2  for all integer k
const printer_tanpi = debug('tanpi');
export function tanpi(x: number): number {
  if (ISNAN(x)) return x;
  if (!R_FINITE(x)) {
    ML_ERROR(ME.ME_DOMAIN, '', printer_tanpi);
    return ML_NAN;
  }
  x = fmod(x, 1); // tan(pi(x + k)) == tan(pi x)  for all integer k
  // map (-1,1) --> (-1/2, 1/2] :
  if (x <= -0.5) {
    x++;
  } else if (x > 0.5) {
    x--;
  }
  return x === 0 ? 0 : x === 0.5 ? ML_NAN : Math.tan(M_PI * x);
}

export function atanpi(x: number) {
  return Math.atan(x) / Math.PI;
}
