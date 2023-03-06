import { dchisq as _dchisq } from './dchisq';
import { dnchisq as _dnchisq } from './dnchisq';
import { pchisq as _pchisq } from './pchisq';
import { pnchisq as _pnchisq } from './pnchisq';
import { qchisq as _qchisq } from './qchisq';
import { qnchisq as _qnchisq } from './qnchisq';
import { rchisqOne as _rchisqOne } from './rchisq';
import { rnchisqOne as _rnchisqOne } from './rnchisq';
import { repeatedCall64 } from '@lib/r-func';

export function rchisq(n: number, df: number, ncp?: number): Float64Array {
  return ncp === undefined
    ? repeatedCall64(n, _rchisqOne, df)
    : repeatedCall64(n, _rnchisqOne, df, ncp);
}

export function rchisqOne(df: number, ncp?: number): number {
  return ncp === undefined
    ? _rchisqOne(df)
    : _rnchisqOne(df, ncp);
}

export function qchisq(
  p: number,
  df: number,
  ncp?: number,
  lowerTail = true,
  logP = false
): number {
  return ncp === undefined
    ? _qchisq(p, df, lowerTail, logP)
    : _qnchisq(p, df, ncp, lowerTail, logP);
}

export function pchisq(
  p: number,
  df: number,
  ncp?: number,
  lowerTail = true,
  logP = false
): number {
  return ncp === undefined
    ? _pchisq(p, df, lowerTail, logP)
    : _pnchisq(p, df, ncp, lowerTail, logP);
}

export function dchisq(
  x: number,
  df: number,
  ncp?: number,
  log = false
): number {
  return ncp === undefined
    ? _dchisq(x, df, log)
    : _dnchisq(x, df, ncp, log);
}

