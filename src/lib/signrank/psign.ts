import * as debug from 'debug';
import {
  ML_ERR_return_NAN,
  R_DT_0,
  R_DT_1,
  R_DT_val
} from '../common/_general';
import { map } from '../r-func';
import { csignrank } from './signrank';

const { round, trunc, LN2: M_LN2, exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE } = Number;

const printer_psignrank = debug('psignrank');

export function psignrank<T>(
  xx: T,
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  const roundN = round(n);
  const u = roundN * (roundN + 1) / 2;
  const c = trunc(u / 2);
  const w = new Array(c + 1).fill(0);

  return map(xx)(x => {
    x = round(x + 1e-7);
    let lowerT = lowerTail; // temp copy on each iteration
    if (ISNAN(x) || ISNAN(n)) return NaN;
    if (!R_FINITE(n)) return ML_ERR_return_NAN(printer_psignrank);
    if (n <= 0) return ML_ERR_return_NAN(printer_psignrank);

    if (x < 0.0) {
      return R_DT_0(lowerTail, logP);
    }

    if (x >= u) {
      return R_DT_1(lowerTail, logP); //returns 1 on the edge case or 0 (because log(1)= 0)
    }
    let f = exp(-roundN * M_LN2);
    let p = 0;
    if (x <= u / 2) {
      //smaller then mean
      for (let i = 0; i <= x; i++) {
        p += csignrank(i, roundN, u, c, w) * f;
      }
    } else {
      x = n * (n + 1) / 2 - x;
      for (let i = 0; i < x; i++) {
        p += csignrank(i, roundN, u, c, w) * f;
      }
      lowerT = !lowerT; /* p = 1 - p; */
    }
    return R_DT_val(lowerT, logP, p);
  }) as any;
} /* psignrank() */
