/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
//needed for rf
import { rchisq } from '../chi-2/rchisq';
import { rnchisq } from '../chi-2/rnchisq';
import { seq } from '../r-func';
import { arrayrify, multiplexer, possibleScalar } from '../r-func';
import { Inversion, IRNGNormal } from '../rng/normal';
//
import { df as _df } from './df';
import { dnf } from './dnf';
//
import { pf as _pf } from './pf';
import { pnf } from './pnf';
//
import { qf as _qf } from './qf';
import { qnf } from './qnf';
import { rf as _rf } from './rf';

const sequence = seq()();

export function FDist(rng: IRNGNormal = new Inversion()) {
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
      return possibleScalar(sequence(n).fill(NaN));
    }

    const div = arrayrify((a: number, b: number) => a / b);

    const numerator = div(rnchisq(n, df1, ncp, rng), df1);
    const denominator = div(rchisq(n, df2, rng), df2);

    return multiplexer(numerator, denominator)((x1, d) => x1 / d);
  }

  return {
    df,
    pf,
    qf,
    rf
  };
}
