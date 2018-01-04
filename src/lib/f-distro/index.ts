//needed for rf
import { rchisq } from '../chi-2/rchisq';
import { rnchisq } from '../chi-2/rnchisq';
//
import { df as _df } from './df';
import { dnf } from './dnf';
//
import { pf as _pf } from './pf';
import { pnf } from './pnf';
//
import { qf as _qf } from './qf';
import { qnf } from './qnf';
//
import { rf as _rf } from './rf';

import { INormal, Normal } from '~normal';

import { arrayrify, forceToArray, possibleScalar } from '../r-func';
export function FDist(rng: INormal = Normal()) {
  function df(
    x: number | number[],
    df1: number,
    df2: number,
    ncp?: number,
    log: boolean = false
  ) {
    /*
    function (x, df1, df2, ncp, log = FALSE) 
      {
    if (missing(ncp)) 
        .Call(C_df, x, df1, df2, log)
    else .Call(C_dnf, x, df1, df2, ncp, log)
      }
    */
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
      return _pf(q, df1, df2, lowerTail, logP);
    }
    return pnf(q, df1, df2, ncp, lowerTail, logP);
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
      return _qf(p, df1, df2, lowerTail, logP);
    }
    return qnf(p, df1, df2, ncp, lowerTail, logP);
  }

  function rf(n: number, df1: number, df2: number, ncp?: number) {
    /* function (n, df1, df2, ncp) 
{
    if (missing(ncp)) 
        .Call(C_rf, n, df1, df2)
    else if (is.na(ncp)) {
        warning("NAs produced")
        rep(NaN, n)
    }
    else (
      rchisq(n, df1, ncp = ncp)/df1
    )
    /
    ( rchisq(n, df2) 
    / df2
    );
}
*/
    if (ncp === undefined) {
      return _rf(n, df1, df2, rng);
    }

    if (Number.isNaN(ncp)) {
      return possibleScalar(new Array(n).fill(NaN));
    }
    
    const div = arrayrify((a: number, b: number) => a / b);

    const numerator = forceToArray(div(rnchisq(n, df1, ncp, rng), df1));
    const denominator = forceToArray(div(rchisq(n, df2, rng), df2));

    return possibleScalar(numerator.map((x1, i) => x1 / denominator[i]));
  }

  return {
    df,
    pf,
    qf,
    rf
  };
}
