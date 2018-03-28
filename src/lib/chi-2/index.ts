/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
//
import { Inversion, IRNGNormal } from '../rng/normal';
import { dchisq as _dchisq } from './dchisq';
import { dnchisq as _dnchisq } from './dnchisq';
import { pchisq as _pchisq } from './pchisq';
import { pnchisq as _pnchisq } from './pnchisq';
import { qchisq as _qchisq } from './qchisq';
import { qnchisq as _qnchisq } from './qnchisq';
import { rchisq as _rchisq } from './rchisq';
import { rnchisq as _rnchisq } from './rnchisq';

export function ChiSquared(rng: IRNGNormal = new Inversion()) {
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
