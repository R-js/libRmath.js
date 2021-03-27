import { emptyFloat32Array, emptyFloat64Array } from "$constants";

/* This is a conversion from libRmath.so to Typescript/Javascript
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

export type strTypes =
    | 'boolean'
    | 'number'
    | 'undefined'
    | 'string'
    | 'null'
    | 'symbol'
    | 'array'
    | 'function'
    | 'object';

export type system = boolean | number | undefined | string | null | symbol;

export function sum(x: number[]): number {
    const rc = x.reduce((pv: number, v: number) => pv + v, 0);
    return rc;
}

export function sumfp(x: Float32Array): number {
    return x.reduce((pv: number, v: number) => pv + v, 0);
}

export interface ISummary {
    N: number; // number of samples in "data"
    mu: number; // mean of "data"
    population: {
        variance: number; // population variance (data is seen as finite population)
        sd: number; // square root of the population variance
    };
    sample: {
        variance: number; // sample variance (data is seen as a small sample from an very large population)
        sd: number; // square root of "sample variance"
    };
    relX: number[]; // = x-E(x)
    relX2: number[]; // = ( x-E(x) )^2
    stats: {
        min: number; // minimal value from "data"
        '1st Qu.': number; // 1st quantile from "data"
        median: number; // median value from "data
        '3rd Qu.': number; // 3rd quantile from "data"
        max: number; // maximum value in data
    };
}

export function summary(x: number[]): ISummary {
    if (!Array.isArray(x)) {
        throw new Error(`Illigal argument, not an array`);
    }
    if (x.length === 0) {
        throw new Error(`argument Array is empty`);
    }
    if (x.includes(NaN)) {
        throw new Error(`argument Array has NaNs`);
    }

    const N = x.length;
    const mu = sum(x) / N; // population mean
    const relX = x.map((v) => v - mu);
    const relX2 = relX.map((v) => v * v);
    const sampleVariance = sum(relX2) / (N - 1);
    const populationVariance = (sampleVariance * (N - 1)) / N;
    const sampleSD = Math.sqrt(sampleVariance);
    const populationSD = Math.sqrt(populationVariance);
    // quantiles
    const o = x.sort((a, b) => a - b);
    const min = o[0];
    const max = o[N - 1];
    //isOdd?
    const { q1, median, q3 } = (function () {
        const i = [4, 2, 4 / 3].map((v) => (N - 1) / v);
        const q = i.map((index) => {
            const f1 = 1 - (index - Math.floor(index));
            const f2 = 1 - f1;
            return o[Math.trunc(index)] * f1 + o[Math.trunc(index) + 1] * f2;
        });
        return {
            q1: q[0],
            median: q[1],
            q3: q[2],
        };
    })();
    return {
        N,
        mu,
        population: {
            variance: populationVariance,
            sd: populationSD,
        },
        sample: {
            variance: sampleVariance,
            sd: sampleSD,
        },
        relX,
        relX2,
        stats: {
            min,
            '1st Qu.': q1,
            median,
            '3rd Qu.': q3,
            max,
        },
    };
}

// https://en.wikipedia.org/wiki/Welch%E2%80%93Satterthwaite_equation

export function Welch_Satterthwaite(s: number[], n: number[]): number {
    const elts = s.map((_s, i) => (_s * _s) / n[i as number]);
    const dom = elts.map((e, i) => (e * e) / (n[i as number] - 1));

    return Math.pow(sum(elts), 2) / sum(dom);
}

export function repeatedCall(n: number, fn: (...arg: any[]) => number, ...arg: unknown[]): Float32Array {
    let result: Float32Array;

    if (n === 0) {
        result = emptyFloat32Array;
    } else if (n > 0) {
        result = new Float32Array(n);
    } else {
        throw new TypeError(`"n" argument is not a number or negative`);
    }
    for (let i = 0; i < result.length; i++) {
        result[i] = fn(...arg);
    }
    return result;
}

export function repeatedCall64(n: number, fn: (...arg: any[]) => number, ...arg: unknown[]): Float64Array {
    let result: Float64Array;

    if (n === 0) {
        result = emptyFloat64Array;
    } else if (n > 0) {
        result = new Float64Array(n);
    } else {
        throw new TypeError(`"n" argument is not a number or negative`);
    }
    for (let i = 0; i < result.length; i++) {
        result[i] = fn(...arg);
    }
    return result;
}

export type Slicee<T> = {
    [P in keyof T]: T[P];
};

export type Sliced<T> = {
    key: keyof T;
    value: T[keyof T];
};


