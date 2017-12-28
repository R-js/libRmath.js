import { df as _df } from './df';
import { dnf } from './dnf';
import { pf as _pf } from './pf';
import { pnf } from './pnf';
import { qf as _qf } from './qf';
import { qnf } from './qnf';
import { rf } from './rf';

import { INormal, Normal } from '~normal';

export function FDist(rng: INormal = Normal()) {
  function df(
    x: number | number[],
    df1: number,
    df2: number,
    ncp?: number,
    log: boolean = false
  ) {
    if (ncp === undefined) {
      return _df(x, df1, df2, log);
    }
    return dnf(x, df1, df2, ncp, log);
  }
  function pf(
    q: number[] | number,
    df1: number,
    df2: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP = false
  ) {
    /*  if (missing(ncp)) 
        .Call(C_pf, q, df1, df2, lower.tail, log.p)
    else .Call(C_pnf, q, df1, df2, ncp, lower.tail, log.p)
*/
    if (ncp === undefined) {
      return _pf(q, df1, df2, lowerTail, logP, rng);
    }
    return pnf(q, df1, df2, ncp, lowerTail, logP, rng);
  }

  function qf(
    p: number | number[],
    df1: number,
    df2: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    if (ncp === undefined) {
      return _qf(p, df1, df2, lowerTail, logP, rng);
    }
    return qnf(p, df1, df2, ncp, lowerTail, logP, rng);
  }

  return {
    df,
    pf,
    qf,
    rf
  };
}
