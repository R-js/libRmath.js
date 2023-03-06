import { dnbinom as _dnb, dnbinom_mu } from './dnbinom';
import { pnbinom as _pnb, pnbinom_mu } from './pnbinom';
import { qnbinom as _qnb, qnbinom_mu } from './qnbinom';
import { rnbinomOne as _rnbinomOne, rnbinom_muOne } from './rnbinom';
import { repeatedCall64 } from '@lib/r-func';

const probAndMuBoth = '"prob" and "mu" both specified';
const probMis = 'argument "prob" is missing, with no default';

export function dnbinom(
  x: number,
  size: number,
  prob?: number,
  mu?: number,
  log = false
): number {
  if (mu !== undefined && prob !== undefined) {
    throw new TypeError(probAndMuBoth);
  }
  if (mu !== undefined) {
    return dnbinom_mu(x, size, mu, log);
  }
  if (prob === undefined) {
    throw new TypeError(probMis);
  }
  return _dnb(x, size, prob, log);
} 

export function pnbinom(
  q: number,
  size: number,
  prob?: number,
  mu?: number,
  lowerTail = true,
  logP = false
): number {
  if (mu !== undefined && prob !== undefined) {
    throw new TypeError(probAndMuBoth);
  }
  if (mu !== undefined) {
    return pnbinom_mu(q, size, mu, lowerTail, logP);
  }
  if (prob === undefined) {
    throw new TypeError(probMis);
  }
  return _pnb(q, size, prob, lowerTail, logP);
}

export function qnbinom(
  p: number,
  size: number,
  prob?: number,
  mu?: number,
  lowerTail = true,
  logP = false
): number {
  if (mu !== undefined && prob !== undefined) {
    throw new TypeError(probAndMuBoth);
  }
  if (mu !== undefined) {
    return qnbinom_mu(p, size, mu, lowerTail, logP);
  }
  if (prob === undefined) {
    throw new TypeError(probMis);
  }
  return _qnb(p, size, prob, lowerTail, logP);
}

export function rnbinom(
  n: number,
  size: number,
  prob?: number,
  mu?: number
): Float64Array {
  if (mu !== undefined && prob !== undefined) {
    throw new TypeError(probAndMuBoth);
  }
  if (mu !== undefined) {
    return repeatedCall64(n, rnbinom_muOne, size, mu);
  }
  if (prob === undefined) {
    throw new TypeError(probMis);
  }
  return repeatedCall64(n, _rnbinomOne, size, prob);
}

export function rnbinomOne(
  size: number,
  prob?: number,
  mu?: number
): number {
  if (mu !== undefined && prob !== undefined) {
    throw new TypeError(probAndMuBoth);
  }
  if (mu !== undefined) {
    return rnbinom_muOne(size, mu);
  }
  if (prob === undefined) {
    throw new TypeError(probMis);
  }
  return _rnbinomOne(size, prob);
}

