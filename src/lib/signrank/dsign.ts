/** 
 * Ported from R (signrank.c) by Jacob Bogers
 * jkfbogers@gmail
 * GNU GENERAL PUBLIC LICENSE
 */

import * as debug from 'debug';
import { ML_ERR_return_NAN, R_D__0, R_D_exp } from '../common/_general';
import { csignrank } from './csignrank';

const { round, trunc, abs: fabs, log, LN2: M_LN2 } = Math;
const { isNaN: ISNAN } = Number;

const printer_dsignrank = debug('dsignrank');

export function dsignrank<T>(xx: T, n: number, logX: boolean = false): T {
  const rn = round(n);
  const u = rn * (rn + 1) / 2;
  const c = trunc(u / 2);
  const w = new Array(c + 1).fill(0);

  const fx: number[] = (Array.isArray(xx) ? xx : [xx]) as any;
  const result = fx.map(x => {
    if (ISNAN(x) || ISNAN(n)) return x + n;

    if (n <= 0) {
      return ML_ERR_return_NAN(printer_dsignrank);
    }
    if (fabs(x - round(x)) > 1e-7) {
      return R_D__0(logX);
    }
    x = round(x);
    if (x < 0 || x > n * (n + 1) / 2) {
      return R_D__0(logX);
    }
    let d = R_D_exp(logX, log(csignrank(trunc(x), n, u, c, w)) - n * M_LN2);
    return d;
  });
  return (result.length === 1 ? result[0] : result) as any;
}
