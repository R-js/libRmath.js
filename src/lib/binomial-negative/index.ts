/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import { Inversion, IRNGNormal } from '../rng/normal';
import { dnbinom as _dnbinom, dnbinom_mu } from './dnbinom';
import { pnbinom as _pnbinom, pnbinom_mu } from './pnbinom';
import { qnbinom as _qnbinom, qnbinom_mu } from './qnbinom';
import { rnbinom as _rnbinom, rnbinom_mu } from './rnbinom';

const errText = Object.freeze([
  'at most specify either argument "mu" or  "prob", but not both at the same time!',
  'both arguments "mu" and "prob" are undefined'
]);



function select(
  fs: 'd' | 'p' | 'r' | 'q',
  mu?: number,
  prob?: number
) {
  const selector = {
    mu: {
      d: dnbinom_mu,
      p: pnbinom_mu,
      q: qnbinom_mu,
      r: rnbinom_mu
    },
    p: {
      d: _dnbinom,
      p: _pnbinom,
      q: _qnbinom,
      r: _rnbinom
    }
  };

  if (prob !== undefined && mu !== undefined) {
    throw new Error(errText[0]);
  }
  if (prob === undefined && mu === undefined) {
    throw new Error(errText[1]);
  }
  const s = prob === undefined ? 'mu' : 'p';
  return selector[s][fs] as any;
}

export function NegativeBinomial(rng: IRNGNormal = new Inversion()) {
  function dnbinom(
    x: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    giveLog =  false
  ): number|number[] {
    const val = mu || prob;
    return select('d', mu, prob)(x, size, val, giveLog);
  }

  function pnbinom(
    q: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    lowerTail = true,
    logP = false
  ): number | number[] {
    const val = mu || prob;
    return select('p', mu, prob)(q, size, val, lowerTail, logP);
  }

  function qnbinom(
    q: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    lowerTail = true,
    logP = false
  ): number | number[] {
    const val = mu || prob;
    return select('q', mu, prob)(q, size, val, lowerTail, logP);
  }

  function rnbinom(
    n: number,
    size: number,
    prob?: number,
    mu?: number
  ): number | number[] {
    const val = mu || prob;
    return select('r', mu, prob)(n, size, val, rng);
  }

  return {
    dnbinom,
    pnbinom,
    qnbinom,
    rnbinom
  };
}
