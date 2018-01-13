const { abs, sign } = Math;

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

export function selector(indexes: number|number[]): { (val: any, index: number): boolean} {
  const ind = forceToArray(indexes);
  return (val: any, idx: number) => {
    return ind.indexOf(idx) >= 0;
  };
}

export function flatten<T>(...rest: (T | T[])[]): T[] {
  let rc: number[] = [];
  for (const itm of rest) {
    if (Array.isArray(itm)) {
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

function possibleScalar<T>(x: T[]): T | T[] {
  return x.length === 1 ? x[0] : x;
}

export { possibleScalar , possibleScalar as possibleReduceDim};

export function forEach<T>(xx: T): { (fn: (x: number) => number): number|number[] } {
  const fx: number[] = forceToArray(xx) as any;
  return function(fn: (x: number) => number): number | number[] {
    const result: number[] = fx.map(fn);
    return possibleScalar(result) as any;
  };
}

export function numberPrecision( prec: number= 6){

  function convert(x: number): number {
    if (isNaN(x)){
      return NaN;
    }
    return Number.parseFloat(x.toPrecision(prec));
  } 

  return arrayrify(convert);
}

export function any<T>(x: T[]) {
  return function(fn: (v: T, i?: number) => boolean) {
    return x.find(fn);
  };
}

export function sum(x: number[]) {
  return x.reduce((sum, v) => (sum += v), 0);
}

export const div = arrayrify((a: number, b) => a / b);
export const mult = arrayrify((a: number, b) => a * b);
