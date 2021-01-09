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
const { max, abs, sign } = Math;

const precision9 = (9);

export function* seq_len({ length, base = 1 }: { length: number; base: number }): IterableIterator<number> {
    for (let i = 0; i < length; i++) {
        yield base + i;
    }
}

export const seq = (adjust = 0) => (adjustMin = adjust) => (start: number, end = 1, step = 1): number[] => {
    let s = start + adjust;
    let e = end + adjust;
    let cursor = s;

    if (end < start) {
        e = start + adjustMin;
        s = end + adjustMin;
        cursor = e;
    }
    // wow: Chrome and FireFox give
    // 0.4+0.2 = 0.6000000000000001
    // so we use precision to have it make sense
    // sometimes rounding effects try something diff
    step = abs(step) * sign(end - start);

    const rc: number[] = [];

    do {
        rc.push(cursor);
        cursor += step;
    } while (precision9(cursor) >= s && precision9(cursor) <= e && step !== 0);

    return precision9(rc) as any;
};

export const sequenceFactory = (adjust = 0, adjustMin = adjust) => (start: number, end: number, delta = 1) =>
    Array.from(lazySeq(start, end, delta, adjust, adjustMin));

export function* lazySeq(start: number, end = 1, step = 1, adjust = -1, adjustMin = adjust) {
    if (step === 0) {
        throw new TypeError(`argument 'delta' cannot be zero`);
    }
    if (end > start && step < 0) {
        throw new TypeError(`'end' > 'start' so delta must be positive`);
    }
    if (end < start && step > 0) {
        throw new TypeError(`'end' < 'start' so delta must be negative`);
    }
    const adj = step > 0 ? adjust : adjustMin;
    do {
        yield start + adj;
        start = start + step;
    } while ((step > 0 && start <= end) || (step < 0 && start >= end));
}

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

function _typeOf(v: any): strTypes {
    if (v === null) return 'null';
    if (v instanceof Array) return 'array';
    if (v instanceof Function) return 'function';
    const k = typeof v;
    // @ts-ignore TS2322: Type '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"' is not assignable to type 'strTypes'.
    return k;
}

export function* multiplexer(...rest: any[]): IterableIterator<any[]> {
    //
    // Analyze
    //
    const analyzed: _t[] = [];
    type _t = boolean[] | number[] | undefined[] | string[] | null[] | symbol[] | any[];

    function simplePush<T extends _t>(v: T) {
        analyzed.push(v);
    }

    const select = {
        ['undefined'](v: null) {
            simplePush([v]);
        },
        ['null'](v: null) {
            simplePush([v]);
        },
        ['number'](v: null) {
            simplePush([v]);
        },
        ['string'](v: string) {
            simplePush(v.split(''));
        },
        ['boolean'](v: boolean) {
            simplePush([v]);
        },
        ['array'](v: _t) {
            simplePush(v);
        },
        ['object'](v: _t) {
            throw new Error('M001, Looping over properties not yet supported');
        },
        ['function'](v: _t) {
            throw new Error('M002, arguments of type "function" are not yet supported');
        },
    };

    for (let k = 0; k < rest.length; k++) {
        //TODO: new in typescript you can pick types of function argument, use that
        const arg = rest[k];
        const to: keyof typeof select = _typeOf(arg) as any;
        const selector = select[to];
        selector(arg as never);
    } //for
    // find the longest array
    const _max = max(...analyzed.map((a) => a.length));
    for (let k = 0; k < _max; k++) {
        const result: any[] = [];
        for (let j = 0; j < analyzed.length; j++) {
            const arr: any[] = analyzed[j];
            const idx = k % arr.length;
            result.push(arr[idx]);
        }
        yield result;
    }
}

export const c = chain(Array.from, flatten);

export function Rcycle(fn: Function) {
    return function (...args: any[]) {
        const gen = multiplexer(...args);
        const rc: any[] = [];
        for (const arg of gen) {
            rc[rc.length] = fn(...arg);
        }
        return rc;
    };
}

function isNumber(x: any): x is number {
    return typeof x === 'number';
}

// typeguards

function isObject(o: any): o is Object {
    return o && typeof o === 'object' && !Array.isArray(o);
}

export function (prec = 6) {
    return function convert(x: any): typeof x {
        // try to loop over the object
        if (isObject(x)) {
            for (const [prop, value] of Object.entries(x)) {
                //recursion
                x[prop] = convert(value);
            }
            return x;
        }
        // this is a number!!
        if (isNumber(x)) {
            x = Number.parseFloat(x.toPrecision(prec)) as any;
        }
        return x;
    };
}

export function sum(x: number[]) {
    let sum = 0;
    const gen = flatten(x);
    for (let v = gen.next(); !v.done; v = gen.next()) {
        sum += v.value;
    }
    return sum;
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
    const mu = sum(x) / N;
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

export function randomGenHelper<T extends Function>(n: number | number[], fn: T, ...arg: any[]) {
    let result: number[];

    if (n === 0) {
        return [];
    } else if (n > 0) {
        result = Array.from({ length: <number>n });
    } else if (n instanceof Array) {
        result = n;
    } else {
        throw new TypeError(`n argument is not a number or a number array`);
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

function slicer<T>(x: Slicee<T>): Sliced<T>[] {
    const keys: (keyof T)[] = Object.keys(x) as any;
    const map = keys.map((key) => ({ key, value: x[key] }));
    return map;
}

export function map<T, S>(data: Slicee<T>): { (fn: (value: T[keyof T], idx: keyof T) => S): S[] } {
    const fx = slicer(data);
    return function k(fn) {
        return fx.map((o) => fn(o.value, o.key));
    };
}

export function each<T>(data: Slicee<T>): { (fn: (value: T[keyof T], idx: keyof T) => void): void } {
    const fx = slicer(data);
    return function k(fn) {
        fx.forEach((o) => fn(o.value, o.key));
    };
}

export function array_flatten<T = unknown>(...rest: (T | IterableIterator<T> | T[])[]) {
    return Array.from(flatten(...rest));
}

function isIterator<T>(it: any): it is IterableIterator<T> {
    return it && it[Symbol.iterator] === 'function';
}

export function* flatten<T>(...rest: (T | IterableIterator<T> | T[])[]): IterableIterator<T> {
    for (const itm of rest) {
        if (itm === null || ['undefined', 'string', 'symbol', 'number', 'boolean'].includes(typeof itm)) {
            // @ts-ignore
            yield itm;
            continue;
        }
        if (itm instanceof Map || itm instanceof Set) {
            for (const v of <any>itm) {
                yield* flatten(v);
            }
            continue;
        }
        if (itm instanceof Array) {
            for (const v of itm) {
                yield* flatten(v);
            }
            continue;
        }

        if (isIterator(itm)) {
            for (const v of <any>itm) {
                yield* flatten(v);
            }
            continue;
        }
    }
}

export function chain<F0 extends (...argv: any[]) => any, F extends (...argv: any[]) => any>(fn0: F0, ...fns: F[]) {
    // @ts-ignore
    fns.push(fn0);
    if (fns.length === 0) {
        throw new TypeError(`specifiy functions to chain`);
    }
    for (let i = 0; i < fns.length; i++) {
        if (typeof fns[i] !== 'function') {
            throw new TypeError(`argument ${i + 1} is not a function`);
        }
    }

    return function (...args: Parameters<F>): ReturnType<F0> {
        let lastArgs: unknown[] = args;
        if (args)
            for (let i = fns.length - 1; i >= 0; i--) {
                const fn = fns[i];
                lastArgs = [fn.apply(fn, lastArgs)];
                //console.log(lastArgs);
            }
        return lastArgs[0] as ReturnType<F0>;
    };
}
