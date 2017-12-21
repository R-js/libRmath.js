import * as debug from 'debug';

import { ME, ML_ERROR, fmod } from '../common/_general';

const { abs: fabs, PI: M_PI } = Math;

const { NaN: ML_NAN, isNaN: ISNAN, isFinite: R_FINITE } = Number;

// sin(pi * x)  -- exact when x = k/2  for all integer k
const printer_sinpi = debug('sinpi');
export function sinpi(x: number): number {
  if (ISNAN(x)) return x;
  if (!R_FINITE(x)) {
    ML_ERROR(ME.ME_DOMAIN, 'sinpi not finite', printer_sinpi);
    return ML_NAN;
  }
  x = fmod(x, 2); // sin(pi(x + 2k)) == sin(pi x)  for all integer k
  // map (-2,2) --> (-1,1] :
  if (x <= -1) x += 2;
  else if (x > 1) x -= 2;
  if (x === 0 || x === 1) return 0;
  if (x === 0.5) return 1;
  if (x === -0.5) return -1;
  // otherwise
  return Math.sin(M_PI * x);
}
