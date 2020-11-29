const { abs, sign, max } = Math;
const { isArray } = Array;

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

export const seq = (adjust = 0) => (adjustMin = adjust) => (
  start: number,
  end?: number,
  step: number = 1
): number[] => {
  if (end === undefined) {
    if (start <= 0 || start === undefined) {
      return [];
    }
    end = 1;
  }
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
  printer_seq('step:%d', step);

  const rc: number[] = [];

  do {
    rc.push(cursor);
    cursor += step;
  } while (precision9(cursor) >= s && precision9(cursor) <= e && step !== 0);

  return precision9(rc) as any;
};

export function selector(
  ...rest: (number | number[])[]
): { (val: any, index: number): boolean } {
  const flat = flatten(rest);
  return (val: any, idx: number) => {
    return flat.indexOf(idx) >= 0;
  };
}

export function flatten<T>(...rest: (T | T[])[]): T[] {
  let rc: number[] = [];
  for (const itm of rest) {
    if (isArray(itm)) {
      let rc2: number[] = flatten(...itm) as any;
      rc.push(...rc2);
      continue;
    }
    rc.push(itm as any);
  }
  return rc as any;
}

function* seq_len({ length, base = 1}: { length: number, base?: number } = { length:1, base:0 }): IterableIterator<number> {
  for (let i = 0; i < length; i++) {
    yield base + i;
  };
}

export function multiplex(fn: (...rest: (any | any[])[]) => any) {
  return function(...rest: (any | any[])[]) {
    return multiplexer(...rest)(fn);
  };
}

export function asArray(fn: (...rest: (any | any[])[]) => any) {
  return function(...rest: (any | any[])[]) {
    const ans = fn(...rest);
    return Array.isArray(ans) ? ans : [ans];
  };
}

function possibleScalar<T>(x: T[]): T | T[] {
  return x.length === 1 ? x[0] : x;
}

function* multiplexer(...rest: any[]): IterableIterator<any[]> {
  //
  // Analyze
  //
  const analyzed: _t[] = [];
  type _t = boolean[] | number[] | undefined[] | string[] | null[] | symbol[] | Array<any>;

function coerceToArray(o: any): { key: string | number; val: any }[] {
  if (o === null || o === undefined) {
    throw new TypeError(
      'Illegal argument excepton: input needs to NOT be "null" or "undefined".'
    );
  }
  if (typeof o === 'number') {
    return [{ key: 0, val: o }] as any;
  }
  if (isArray(o)) {
    return o.map((x, idx) => ({ key: idx, val: x } as any));
  }
  if (typeof o === 'string') {
    return o.split('').map((x, idx) => ({ key: idx, val: x } as any));
  }
  if (typeof o === 'object') {
    const names = Object.getOwnPropertyNames(o);
    if (names.length === 0) {
      throw new Error('Input argument is an Object with no properties');
    }
    return names.map(name => ({ key: name, val: o[name] })) as any;
  }
  throw new Error('unreachable code');
}

export function multiplexer(...rest: (any | any[])[]) {
  //analyze
  const analyzed: any[] = [];

  for (let k = 0; k < rest.length; k++) {
    const arg = rest[k];
    // null is special
    if (arg === null) {
      analyzed.push([arg]);
      continue;
    }
    if (['undefined', 'boolean', 'number'].indexOf(typeof arg) >= 0) {
      analyzed.push([arg]);
      continue;
    }
    if (typeof arg === 'string') {
      analyzed.push(arg.split(''));
      continue;
    }
    if (Array.isArray(arg)) {
      analyzed.push(arg);
      continue;
    }
    if (arg instanceof Object) {
      throw new Error('Sorry, looping over properties not yet supported');
    }
    if (arg instanceof Function) {
      throw new Error('Sorry function arguments are not yet supported');
    }
  } //for
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

/**
 *
 *  xx can be an array or a "pojo"-object with properties
 *
 */

type ArrayElt = { key: string | number; val: any };

function iter<T>(wantMap = true) {
  return function(
    xx: T
  ): { (fn: (x: any, idx?: number | string) => any): any | any[] } {
    const fx: ArrayElt[] = coerceToArray(xx) as any;
    return function(fn: (x: any, idx?: number | string) => any): any | any[] {
      return wantMap
        ? possibleScalar(fx.map(o => fn(o.val, o.key)))
        : fx.forEach(o => fn(o.val, o.key));
    };
  };
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

export function sum(x: any[]): number {
  let rc = 0;
  for (let i = 0; i < x.length; i++) {
    if (isArray(x[i])) {
      rc += sum(x[i]);
      continue;
    }
    if (typeof x[i] === 'string') {
      const trial = Number.parseFloat(x[i]);
      if (Number.isFinite(trial)) {
        rc += trial;
        continue;
      }
      throw Error(`${x[i]} is not a number or can be coerced to a number`);
    }
    if (typeof x[i] === 'number' && Number.isFinite(x[i])) {
      rc += x[i];
      continue;
    }
    throw new Error(`${x[i]} is not a number`);
  }
  return rc;
}
/*
for r::stat,not for this
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
  relX; // = x-E(x)
  relX2; // = ( x-E(x) )^2
  stats: {
    min: number; // minimal value from "data"
    '1st Qu.': number; // 1st quantile from "data"
    median: number; // median value from "data
    '3rd Qu.': number; // 3rd quantile from "data"
    max: number; // maximum value in data
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
  if (x.findIndex(v => isNaN(v)) >= 0) {
    throw new Error(`argument Array has NaNs`);
  }

  const N = x.length;
  const mu = sum(x) / N;
  let relX2 = 0;
  for (let i = 0; i < x.length; i++) {
    relX2 += (x[i] - mu) * (x[i] - mu);
  }
  const sampleVariance = relX2 / (N - 1);
  const populationVariance = (sampleVariance * (N - 1)) / N;
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
    // only show first 50 of relX and relX2
    relX: 'depricated',
    relX2: 'depricated',
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
  const elts = flatten(
    map(s)((_s, i) => {
      return (_s * _s) / n[i as number];
    })
  );
  const dom = elts.map((e, i) => (e * e) / (n[i as number] - 1));

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
  else if (n < 0) {
     throw new TypeError(`n argument is negative`)
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

function isIterator<T>(x:any): x is IterableIterator<T> {
  return x && typeof x[Symbol.iterator] === 'function';
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
    
  
    if (isIterator<T>(itm)){
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

//function map<T, S>(data: Slicee<T>): { (fn: (value: T[keyof T], idx: keyof T) => S): S[] } {

function lazyMap<T, S>(fn: (value: T, idx: number) => S)  {
  return function(source: IterableIterator<T>) {
    let cursor = source;
      let idx = 0;
    return ({
      next: function() {
        const step = cursor.next()
        if (step.done) return { value: undefined, done: true }
        const rc = fn(step .value, idx++)
        return { value: rc, done: false }
      },
      [Symbol.iterator]: function() { return this }
    })
  }
}

// note, "flatten" is an fp lazy
//const c = pipe(flatten, Array.from);

