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

import * as debug from 'debug';

const printer_seq = debug('seq');

export {
  Rcycle,
  c,
  compose,
  pipe,
  each,
  flatten,
  forcePrecision,
  isNumber,
  lazyMap,
  lazySeq,
  map,
  multiplexer,
  randomGenHelper,
  range,
  seq_len,
  sequenceFactory,
  sum,
  typeOf
}


export {
  strTypes,
  system
}

function* seq_len({ length, base = 1}: { length: number, base?: number } = { length:1, base:0 }): IterableIterator<number> {
  for (let i = 0; i < length; i++) {
    yield base + i;
  };
}


const sequenceFactory = 
(adjust = 0, adjustMin = adjust) => 
(start: number, end: number, step = 1): number[] => 
Array.from(lazySeq(start, end, step, adjust, adjustMin))

function* lazySeq(start: number, end: number, step: number, adjust, adjustMin) {
  if (step === 0) {
    throw new TypeError(`argument 'step' cannot be zero`)
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


type strTypes = 'bigint' | 'boolean' | 'number' | 'undefined' | 'string' | 'null' | 'symbol' | 'array' | 'function' | 'object';
type system = boolean | number | undefined | string | null | symbol;

function typeOf(v: any): strTypes {
  if (v === null) return 'null';
  if (v instanceof Array) return 'array';
  if (v instanceof Function) return 'function';
  const k = typeof v;
  // @ts-ignore TS2322: Type '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"' is not assignable to type 'strTypes'.
  return k;
}



function* multiplexer(...rest: any[]): IterableIterator<any[]> {
  //
  // Analyze
  //
  const analyzed: _t[] = [];
  type _t = boolean[] | number[] | undefined[] | string[] | null[] | symbol[] | Array<any>;

  function push2AsArr(v) { analyzed.push([v]) }

  function push2AsSc(v) { analyzed.push(v) }

  const select = {
    ['undefined']: push2AsArr,
    ['null']: push2AsArr,
    ['number']: push2AsArr,
    ['string'](v: string) { analyzed.push(v.split('')) },
    ['boolean']: push2AsArr,
    ['array']: push2AsSc,
    ['object'](v: _t) { throw new Error('M001, Looping over properties not yet supported'); },
    ['function'](v: _t) { throw new Error('M002, arguments of type "function" are not yet supported'); }
  };

  for (let k = 0; k < rest.length; k++) {
    const arg = rest[k];
    const to = typeOf(arg);
    const selector = select[to];
    selector(arg);
  }//for
  // find the longest array
  const _max = max(...analyzed.map(a => a.length));
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



function Rcycle(fn: Function) {
  return function(...args: any[]) {
    const gen = multiplexer(...args);
    let rc: any[] = [];
    for (const arg of gen) {
      rc[rc.length] = fn(...arg);
    }
    return rc;
  }
}


function isNumber(x: any): x is number {
  return typeof x === 'number'
}

function forcePrecision(prec: number = 6) {
  return function convert<T>(x: T): T {
    // try to loop over the object
    if (typeof x === 'object' && x !== null) {
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
  }
}

function sum(x: number[]) {
  let sum = 0;
  const gen = flatten(x);
  for (let v = gen.next(); !v.done; v = gen.next()) {
    sum += v.value;
  }
  return sum;
}
/*
for r::stat,not for this
export interface ISummary {
  N: number; // number of samples in "data"
  mu: number; // mean of "data"
  population: {
    variance: number, // population variance (data is seen as finite population)
    sd: number // square root of the population variance
  };
  sample: {
    variance: number, // sample variance (data is seen as a small sample from an very large population)
    sd: number // square root of "sample variance"
  };
  relX; // = x-E(x)
  relX2; // = ( x-E(x) )^2
  stats: {
    min: number, // minimal value from "data"
    '1st Qu.': number, // 1st quantile from "data"
    median: number, // median value from "data
    '3rd Qu.': number, // 3rd quantile from "data"
    max: number // maximum value in data
  };
}
/*
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
  const relX = x.map(v => v - mu);
  const relX2 = relX.map(v => v * v);
  const sampleVariance = sum(relX2) / (N - 1);
  const populationVariance = sampleVariance * (N - 1) / N;
  const sampleSD = Math.sqrt(sampleVariance);
  const populationSD = Math.sqrt(populationVariance);
  // quantiles
  const o = x.sort((a, b) => a - b);
  const min = o[0];
  const max = o[N - 1];
  //isOdd?
  const { q1, median, q3 } = (function () {
    const i = [4, 2, 4 / 3].map(v => (N - 1) / v);
    const q = i.map(index => {
      const f1 = 1 - (index - floor(index));
      const f2 = 1 - f1;
      return o[trunc(index)] * f1 + o[trunc(index) + 1] * f2;
    });
    return {
      q1: q[0],
      median: q[1],
      q3: q[2]
    };
  })();
  return {
    N,
    mu,
    population: {
      variance: populationVariance,
      sd: populationSD
    },
    sample: {
      variance: sampleVariance,
      sd: sampleSD
    },
    relX,
    relX2,
    stats: {
      min,
      '1st Qu.': q1,
      median,
      '3rd Qu.': q3,
      max
    }
  };
}

// https://en.wikipedia.org/wiki/Welch%E2%80%93Satterthwaite_equation

export function Welch_Satterthwaite(s: number[], n: number[]): number {

  const elts = s.map((_s, i) => _s * _s / n[i as number])
  const dom = elts.map((e, i) => e * e / (n[i as number] - 1));

  return Math.pow(sum(elts), 2) / sum(dom);
}
*/

function randomGenHelper<T extends Function>(n: number | number[], fn: T, ...arg: any[]) {

  let result: number[]

  if (n === 0) {
    return []
  }
  else if (n > 0) {
    result = Array.from({ length: <number>n })
  }
  else if (n instanceof Array) {
    result = n
  }
  else {
    throw new TypeError(`n argument is not a number or a number array`)
  }
  for (let i = 0; i < result.length; i++) {
    result[i] = fn(...arg)
  }
  return result
}

export type Slicee<T> = {
  [P in keyof T]: T[P]
}

export type Sliced<T> = {
  key: keyof T;
  value: T[keyof T]
}

function slicer<T>(x: Slicee<T>): Sliced<T>[] {
  const keys: (keyof T)[] = Object.keys(x) as any;
  const map = keys.map(key => ({ key, value: x[key] }));
  return map;
}

function map<T, S>(data: Slicee<T>): { (fn: (value: T[keyof T], idx: keyof T) => S): S[] } {
  const fx = slicer(data);
  return function k(fn) {
    return fx.map(o => fn(o.value, o.key))
  };
}

function each<T>(data: Slicee<T>): { (fn: (value: T[keyof T], idx: keyof T) => void): void } {
  const fx = slicer(data);
  return function k(fn) {
    fx.forEach(o => fn(o.value, o.key));
  };
}

function* flatten<T>(this: any, ...rest: (T | T[] | IterableIterator<T>)[]): IterableIterator<any> {

  for (const itm of rest) {
    if (itm === null || ['undefined', 'string', 'symbol', 'number', 'boolean'].includes(typeof itm)) {
      // @ts-ignore
      yield itm;
      continue;
    }
    if (itm instanceof Map || itm instanceof Set) {
      for (const v of <any>itm) {
        //console.log('v', v)
        yield* flatten.call(this, v);
      }
      continue;
    }
    if (itm instanceof Array) {
      for (const v of itm) {
        yield* flatten.call(this, v);
      }
      continue;
    }
    const isIterator = (typeof itm[Symbol.iterator]) === 'function';
    if (isIterator) {
      //throw new Error('positivly evaluated');
      for (const v of itm) {
        yield* flatten.call(this, v);
      }
      continue;
    }
  }
}

const compose = chain(true);
const pipe = chain(false);

function chain(backwardReduce: boolean) {
  return function(...fns: Function[]): Function {
    //checks
    if (fns.length === 0) {
      throw new TypeError(`specify functions!`)
    }
    for (let i = 0; i < fns.length; i++) {
      if (typeof fns[i] !== 'function') {
        throw new TypeError(`argument ${i + 1} is not a function`)
      }
    }
    return function(...args: any[]) {
      let lastArgs = args
      const [start, stop, incr] = backwardReduce ?
        [fns.length - 1, -1, -1] :
        [0, fns.length, 1]

      for (let i = start; i !== stop; i += incr) {
        const fn = fns[i]
        lastArgs = fn.apply(fn, lastArgs)
        if (!Array.isArray(lastArgs)) {
          lastArgs = [lastArgs]
        }
        //console.log(lastArgs);

      }
      return lastArgs
    }
  }
}

function range(start: number, stop: number, step = 1): IterableIterator<number> {
  let cursor = start;
  return ({
    next: function(): IteratorResult<number> {
      let value: number | undefined = undefined
      let done = true
      if (cursor <= stop) {
        value = cursor
        cursor += step;
        done = false
      }
      return { value, done } as any
    },
    [Symbol.iterator]: function() { return this }
  })
}

function lazyMap<T, S>(fn: (v: T, idx: number) => S) {
  return function(source: IterableIterator<T>) {
    let cursor = source;
    let idx = 0;
    return ({
      next: function() {
        const step = cursor.next()
        if (step.done) return { value: undefined, done: true }
        const rc = fn(step.value, idx++)
        return { value: rc, done: false }
      },
      [Symbol.iterator]: function() { return this }
    })
  }
}

// note, "flatten" is an fp lazy
const c = pipe(flatten, Array.from)
