
'use strict'
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
const { floor, trunc, max } = Math;
const { isArray } = Array;

export const precision9 = numberPrecision(9);
/*
export function isOdd(n: number): boolean {
  if (isFinite(n)) {
    return n % 2 !== 0;
  }
  throw new Error(`Not a finite Number: ${n}`);
}*/

export function* seq_len({ length, base = 1 }: { length: number, base: number }): IterableIterator<number> {
  for (let i = 0; i < length; i++) {
    yield base + i;
  };
}

export const seq = (adjust = 0) => (adjustMin = adjust) => (
  start: number,
  end?: number,
  step: number = 1
): number[] => {
  const { abs, sign } = Math; 
  if (end === undefined) {
    if (start <= 0 || start === undefined) {
      return []
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
  

  const rc: number[] = [];
  let cursor9;
  do {
    cursor9 = precision9(cursor);
    rc.push(cursor9);
    cursor += step;
  } while (cursor9 >= s && cursor9 <= e && step !== 0);

  return rc;
}

export function flatten<T>(...rest: (T | T[])[]): T[] {
  let rc: T[] = [];
  for (const itm of rest) {
    if (isArray(itm)) {
      let rc2: T[] = flatten(...itm);
      rc.push(...rc2);
      continue;
    }
    rc.push(itm);
  }
  return rc as any;
}

export function Rcycle(fn: (...rest: (any | any[])[]) => any) {

  return function(...rest: (any | any[])[]) {
    return multiplexer(...rest)(fn);
  };
}

export type strTypes = 'boolean'| 'number'| 'undefined'| 'string' | 'null' | 'symbol' | 'array' | 'function' | 'object';
export type system = boolean | number | undefined | string | null | symbol|  Array<any>;

function _typeOf(v: any): strTypes {
   if (v === null) return 'null';
   if (v instanceof Array) return 'array';
   if (v instanceof Function) return 'function';
   const k = typeof v;
   return k;
}


export function multiplexer(...rest: (system| system)[]) {
  //
  // Analyze
  //  
  const analyzed: _t[] = [];
  type _t = boolean[]| number[]| undefined[]| string[] | null[] | symbol[]|  Array<any>;
  
  function  simplePush<T extends _t>(v: T){ analyzed.push(v) };

  const select = {
    ['undefined'](v: null){ simplePush([v]); },
    ['null'](v: null){ simplePush([v]); },
    ['number'](v: null){ simplePush([v]); },
    ['string'](v: string){  simplePush(v.split(''))},
    ['boolean'](v: boolean){ simplePush([v]) },
    ['array'](v: _t){ simplePush(v)},
    ['object'](v: _t){ throw new Error('Sorry, looping over properties not yet supported'); },
    ['function'](v: _t){ throw new Error('Sorry function arguments are not yet supported'); }
  };
  
  
  for (let k = 0; k < rest.length; k++) {
    const arg = rest[k];
    const to = _typeOf(arg);
    const selector = select[to];
    selector(arg);
  }//for
  // find the longest array
  const _max = max(...analyzed.map(a => a.length));
  return function(fn: (...rest: system[]) => any): any[] {
    const rc: any[] = [];

    for (let k = 0; k < _max; k++) {
      const result: any[] = [];
      for (let j = 0; j < analyzed.length; j++) {
        const arr: any[] = analyzed[j];
        const idx = k % arr.length;
        result.push(arr[idx]);
      }
      rc.push(fn(...result));
    }
    return rc;
  };
}

export function numberPrecision(prec: number = 6) {

  let runner: Function;
  function convert(x?: number | any): number {
      // try to loop over the object
      if (typeof x === 'object' && x !== null) {
          for (const key in x) {
              //recursion
              x[key] = runner(x[key]);
          }
          return x;
      }
      // this is a number!!
      if (typeof x === 'number') {
          return Number.parseFloat(x.toPrecision(prec));
      }
      //dont change the object, whatever it is
      return x;
  }
  runner = Rcycle(convert);
  return runner;
}

export function sum(x: number[]) {
  return flatten(x).reduce((sum, v) => (sum += v), 0);
}

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

  const elts = s.map((_s, i) => _s * _s / n[i as number])
  const dom = elts.map((e, i) => e * e / (n[i as number] - 1));

  return Math.pow(sum(elts), 2) / sum(dom);
}


export function randomGenHelper<T extends Function>(n: number | number[], fn: T, ...arg: any[]) {

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
