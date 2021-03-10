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
import { lgammafn_sign } from '@special/gamma/lgammafn_sign';
import { sumfp } from '$constants';
const { isFinite } = Number;

export interface IdmultinomOptions {
    x: Float32Array;
    size?: number;
    prob: Float32Array;
    asLog?: boolean;
}

export function dmultinom(o: IdmultinomOptions): number {
    // init
    // first prob and x must have the same length
    o.asLog = !!o.asLog;
    let x = o.x;
    let prob = o.prob;
   
    const badProb = !!prob.find((f) => !isFinite(f) || f < 0);
    const s = sumfp(prob);
    if (badProb || s === 0) {
        throw new Error('probabilities must be finite, non-negative and not all 0');
    }
    prob = prob.map((v) => v / s);
    x = x.map(Math.round);
    if (x.find((v) => v < 0)) {
        throw new Error('probabilities must be finite, non-negative and not all 0');
    }
    const N = sumfp(x);
    const size = !!o.size ? o.size : N;
    if (size !== N) {
        throw new Error(`size:${size} != sum(x):${N}, i.e. one is wrong`);
    }
    const i0 = prob.map((p) => p === 0 ? 1: 0);
    if (i0.includes(1)) {
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
        errMsg.push(
            `number of effective quantiles:${x.length} is not equal to number of effective probabilities:${prob.length}.`,
        );
    }
    if (errMsg.length) {
        throw new Error(errMsg.join('\n'));
    }
    const s1 = x.map((v) => v + 1).map((v) => lgammafn_sign(v)); //(x.map(v=>v+1));
    const s2 = prob.map(Math.log);
    const s3 = x.map((v, i) => v * s2[i] - s1[i]);

    const r = lgammafn_sign(size + 1) + sumfp(s3);
    return o.asLog ? r : Math.exp(r);
}
