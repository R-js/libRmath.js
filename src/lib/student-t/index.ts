//
import { INormal, Normal } from '~normal';
import { rchisq } from '../chi-2/rchisq';
import { rnorm } from '../normal/rnorm';
import { arrayrify, forceToArray } from '../r-func';
//
import { dnt } from './dnt';
import { dt as _dt } from './dt';
import { pnt } from './pnt';
import { pt as _pt } from './pt';
import { qnt } from './qnt';
import { qt as _qt } from './qt';
//
import { rt as _rt } from './rt';


export function StudentT(rng: INormal = Normal()) {
  function dt(x: number | number[], df: number, ncp?: number, logP = false) {
    if (ncp === undefined) {
      return _dt(x, df, logP);
    }
    return dnt(x, df, ncp, logP);
  }

  function pt(
    q: number | number[],
    df: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP = false
  ) {
    if (ncp === undefined) {
      return _pt(q, df, lowerTail, logP);
    }

    return pnt(q, df, ncp, lowerTail, logP);
  }

  function qt(
    pp: number | number[],
    df: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    if (ncp === undefined) {
      return _qt(pp, df, lowerTail, logP);
    }
    return qnt(pp, df, ncp, lowerTail, logP);
  }

  function rt(n: number, df: number, ncp?: number) {
    if (ncp === undefined) {
      return _rt(n, df, rng);
    } else if (Number.isNaN(ncp)) {
      return new Array(n).fill(NaN);
    } else {
      // array devision and sqrt
      const div = arrayrify((a: number, b: number) => a / b);
      const sqrt = arrayrify(Math.sqrt);

      const norm = forceToArray(rnorm(n, ncp, 1, rng.rng.norm_rand)); // bleed this first from rng
      const chisq = forceToArray(div(sqrt(rchisq(n, df, rng)), df));

      const result = norm.map((n, i) => n / chisq[i]);
      return result.length === 1 ? result[0] : result;
    }
  }

  return {
    dt,
    pt,
    qt,
    rt
  };
}
