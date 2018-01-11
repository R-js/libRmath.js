
import * as debug from 'debug';
import { R_DT_qIv } from '~exp-utils';
import {
  ML_ERR_return_NAN,
  R_DT_0,
  R_DT_1,
  R_Q_P01_check
} from '../common/_general';

import { forEach } from '../r-func';
import { csignrank } from './signrank';

const { round, trunc, LN2: M_LN2, exp } = Math;
const { isNaN: ISNAN, isFinite: R_FINITE, EPSILON:DBL_EPSILON } = Number;
const printer_qsignrank = debug('qsignrank');

export function qsignrank<T>(
    xx: T,
    n: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ): T {
  
    const roundN = round(n);
    const u = roundN * (roundN + 1) / 2;
    const c = trunc(u / 2);
    const w = new Array(c + 1).fill(0);
   
    return forEach(xx)(x => {
      if (ISNAN(x) || ISNAN(n)) {
        return NaN;
      }
  
      if (/*!R_FINITE(x) ||*/ !R_FINITE(n)) {
        return ML_ERR_return_NAN(printer_qsignrank);
      }
      let rc = R_Q_P01_check(logP, x);
      if (rc !== undefined) {
        return rc;
      }
  
      if (roundN <= 0) {return ML_ERR_return_NAN(printer_qsignrank); }
  
      if (x === R_DT_0(lowerTail, logP)) {
        return 0;
      }
      if (x === R_DT_1(lowerTail, logP)) {
        return u;
      }
  
      if (logP || !lowerTail)
        x = R_DT_qIv(lowerTail, logP, x); // lower_tail, non-log "p" 
  
      //this.w_init_maybe(n);
      let f = exp(-n * M_LN2);
      let p = 0;
      let q = 0;
      if (x <= 0.5) {
        x = x - 10 * DBL_EPSILON;
        while (true) {
          p += csignrank(q, roundN, u, c, w) * f;
          if (p >= x) break;
          q++;
        }
      } else {
        x = 1 - x + 10 * DBL_EPSILON;
        while (true) {
          p += csignrank(q, roundN, u, c, w) * f;
          if (p > x) {
            q = trunc(u - q);
            break;
          }
          q++;
        }
      }
      return q;
    }) as any;
  }
  
