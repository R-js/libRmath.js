'use strict'

import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';

import {
  R_DT_0,
  R_DT_1
} from '@lib/r-func';

import { pnorm_both } from './pnorm_both'

const printer = debug('pnorm');

import { NumberW } from '@common/toms708/NumberW';

export function pnorm5(q: number, mean = 0, sd = 1, lowerTail = true, logP = false): number {


  /* Note: The structure of these checks has been carefully thought through.
   * For example, if x == mean and sd == 0, we get the correct answer 1.
   */

  if (isNaN(q) || isNaN(mean) || isNaN(sd)) return NaN;

  if (!isFinite(q) && mean === q) return NaN; /* x-mean is NaN */
  if (sd <= 0) {
    if (sd < 0) return ML_ERR_return_NAN2(printer, lineInfo4);
    /* sd = 0 : */
    return q < mean ? R_DT_0(lowerTail, logP) : R_DT_1(lowerTail, logP);
  }

  const p = new NumberW(0);
  const cp = new NumberW(0);

  p.val = (q - mean) / sd;
  if (!isFinite(p.val))
    return q < mean ? R_DT_0(lowerTail, logP) : R_DT_1(lowerTail, logP);
  q = p.val;

  pnorm_both(q, p, cp, !lowerTail, logP);

  return lowerTail ? p.val : cp.val;
}
