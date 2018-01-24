const { abs, sign, floor, trunc } = Math;
const { isNaN } = Number;
const { isArray } = Array;

import * as debug from 'debug';

const printer_seq = debug('seq');
const precision9 = numberPrecision(9);

export const seq = (adjust = 0) => (adjustMin = adjust) => (
  start: number,
  end: number = 1,
  step: number = 1
): number[] => {
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
  indexes: number | number[]
): { (val: any, index: number): boolean } {
  const ind = forceToArray(indexes);
  return (val: any, idx: number) => {
    return ind.indexOf(idx) >= 0;
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

export function arrayrify<T, R>(fn: (x: T, ...rest: any[]) => R) {
  return function(x: T | T[], ...rest: any[]): R | R[] {
    const fp = Array.isArray(x) ? x : [x];
    const result = fp.map(p => fn(p, ...rest));
    return result.length === 1 ? result[0] : result;
  };
}

export function forceToArray<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x.slice(0) : [x];
}
export { forceToArray as asVector };

function possibleScalar<T>(x: T[]): T | T[] {
  return x.length === 1 ? x[0] : x;
}

export { possibleScalar, possibleScalar as possibleReduceDim };

function coerceToArray(o: any): { key: string | number, val: any }[] {
  if (o === null || o === undefined) {
    throw new TypeError('Illegal argument excepton: input needs to NOT be "null" or "undefined".');
  }
  if (typeof o === 'number') {
    return [{ key: 0, val: o }] as any;
  }
  if (isArray(o)) {
    return o.map((x, idx) => ({ key: idx, val: x }) as any);
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
    if (arg === undefined || arg === null) {
      continue; //skip
    }
    if (typeof arg === 'number') {
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
  }//for
  // find the longest array
  const max = Math.max(...analyzed.map(a => a.length));

  return function(fn: (...rest: any[]) => void) {
    for (let k = 0; k < max; k++) {
      const result: any[] = [];
      for (let j = 0; j < analyzed.length; j++) {
        const arr: any[] = analyzed[j];
        const idx = k % arr.length;
        result.push(arr[idx]);
      }
      fn(...result);
    }
  };
}

/**
 * 
 *  xx can be an array or a "pojo"-object with properties
 * 
 */

export function map<T>(
  xx: T
): { (fn: (x: any, idx?: number | string) => any): any | any[] } {
  //let i = 0;
  type ArrayElt = { key: string | number, val: any };

  const fx: ArrayElt[] = coerceToArray(xx) as any;
  //TODO: create looping like in R
  //const fy: ArrayElt[] | undefined = yy && coerceToArray(yy) as any;
  return function(fn: (x: any, idx?: number | string) => any): any | any[] {
    //console.log({id:i++});
    const result = fx.map(o => fn(o.val, o.key));
    return possibleScalar(result) as any;
  };
}

export function numberPrecision(prec: number = 6) {
  function convert(x: number): number {
    if (isNaN(x)) {
      return NaN;
    }
    return Number.parseFloat(x.toPrecision(prec));
  }

  return arrayrify(convert);
}

export function any<T>(x: T[]) {
  return function(fn: any | ((v: T, i?: number) => boolean)) {
    if (fn instanceof Function) {
      return x.find(fn);
    }
    return x.find(d => d === fn);
  };
}

export function sum(x: number[]) {
  return forceToArray(x).reduce((sum, v) => (sum += v), 0);
}

export const div = arrayrify((a: number, b) => a / b);
export const mult = arrayrify((a: number, b) => a * b);

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

export function summary(x: number[]): ISummary {
  if (!Array.isArray(x)) {
    throw new Error(`Illigal argument, not an array`);
  }
  if (x.length === 0) {
    throw new Error(`argument Array is empty`);
  }
  if (any(x)(v => isNaN(v))) {
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
  const { q1, median, q3 } = (function() {
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

  const elts = forceToArray(map(s)((_s, i) => {
    return _s * _s / n[i as number];
  }));
  const dom = elts.map((e, i) => e * e / (n[i as number] - 1));

  return Math.pow(sum(elts), 2) / sum(dom);
}
