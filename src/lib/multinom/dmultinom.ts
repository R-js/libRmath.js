/* GNUv3 License

Copyright (c) Jacob K. F. Bogers <jkfbogers@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
import { special } from '../gamma';
import { any, arrayrify, flatten, sum } from '../r-func';
const { isFinite } = Number;

const div = arrayrify((a: number, b: number) => a / b);
const { lgamma } = special;
const add = arrayrify((a: number, b: number) => a + b);
const log = arrayrify(Math.log);

export interface IdmultinomOptions {
  x: number[];
  size?: number;
  prob: number[];
  asLog?: boolean;
}

export function dmultinom(
  o: IdmultinomOptions
): number {
  // init
  // first prob and x must have the same length
  o.asLog = !!o.asLog;
  let x: number[] = flatten(o.x).filter(f => !!f) as any;
  //
  let prob: number[] = flatten(o.prob) as any;
  let badProb = !!prob.find(f => !isFinite(f) || f < 0);
  let s = sum(prob);
  if (badProb || s === 0) {
    throw new Error('probabilities must be finite, non-negative and not all 0');
  }
  prob = flatten(div(prob, s));
  x = x.map(Math.round);
  if (any(x)(v => v < 0)) {
    throw new Error('probabilities must be finite, non-negative and not all 0');
  }
  const N = sum(x);
  const size = !!o.size ? o.size : N;
  if (size !== N) {
    throw new Error(`size:${size} != sum(x):${N}, i.e. one is wrong`);
  }
  const i0 = prob.map(p => p === 0);
  if (any(i0)(v => !!v)) {
    if (i0.find((_v, i) => x[i] !== 0)) {
      return o.asLog ? -Infinity : 0;
    }
    x = x.filter((_v, i) => i0[i]);
    prob = prob.filter((_v, i) => i0[i]);
  }
  // checks after cleaning
  const errMsg: string[] = [];
  if (prob.length <= 1) {
    errMsg.push(`number of propabilities need to be at least 2, it is:${prob.length}`);
  }
  if (x.length <= 1) {
    errMsg.push(`number of quantiles need to be at least 2, it is :${x.length}`);
  }
  if (x.length !== prob.length) {
    errMsg.push(`number of effective quantiles:${x.length} is not equal to number of effective probabilities:${prob.length}.`);
  }
  if (errMsg.length) {
    throw new Error(errMsg.join('\n'));
  }
  const s1 = lgamma(add(x, 1));
  const s2 = log(prob);
  const s3 = x.map((v, i) => v * s2[i] - s1[i]);

  const r = lgamma(size + 1) + sum(s3);
  return o.asLog ? r : Math.exp(r);
}
