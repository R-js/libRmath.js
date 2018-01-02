//
import { INormal, Normal } from '../normal';
import { dchisq as _dchisq } from './dchisq';
import { dnchisq as _dnchisq } from './dnchisq';
import { pchisq as _pchisq } from './pchisq';
import { pnchisq as _pnchisq } from './pnchisq';
import { qchisq as _qchisq } from './qchisq';
import { qnchisq as _qnchisq } from './qnchisq';
import { rchisq as _rchisq } from './rchisq';
import { rnchisq as _rnchisq } from './rnchisq';

export function ChiSquared(rng: INormal = Normal()) {
  function rchisq(n: number = 1, df: number, ncp?: number) {
    return ncp === undefined
      ? _rchisq(n, df, rng)
      : _rnchisq(n, df, ncp, rng);
  }

  function qchisq(
    p: number | number[],
    df: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    return ncp === undefined
      ? _qchisq(p, df, lowerTail, logP)
      : _qnchisq(p, df, ncp, lowerTail, logP);
  }

  function pchisq(
    p: number | number[],
    df: number,
    ncp?: number,
    lowerTail: boolean = true,
    logP: boolean = false
  ) {
    return ncp === undefined
      ? _pchisq(p, df, lowerTail, logP)
      : _pnchisq(p, df, ncp, lowerTail, logP);
  }

  function dchisq(
    x: number | number[],
    df: number,
    ncp?: number,
    log: boolean = false
  ) {
    return ncp === undefined ? _dchisq(x, df, log) : _dnchisq(x, df, ncp, log);
  }

  return {
      dchisq,
      pchisq,
      qchisq,
      rchisq
  };
}
