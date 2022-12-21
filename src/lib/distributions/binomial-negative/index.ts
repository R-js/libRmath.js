/* This is a conversion from LIB-R-MATH to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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
  giveLog = false
): number {
  if (mu !== undefined && prob !== undefined) {
    throw new TypeError(probAndMuBoth);
  }
  if (mu !== undefined) {
    return dnbinom_mu(x, size, mu, giveLog);
  }
  if (prob === undefined) {
    throw new TypeError(probMis);
  }
  return _dnb(x, size, prob, giveLog);
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

