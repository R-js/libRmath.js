const { abs, sign, trunc } = Math;

export function seq(start: number, end: number, step: number = 1): number[] {
  let s = start;
  let e = end;
  if (end < start) {
    s = end;
    e = start;
  }
  step = abs(step);
  const nsteps = trunc((e + 1 - s) / step);
  const rc = Array(nsteps)
    .fill(0)
    .map((v, i) => s + step * i);
  return end > start ? rc : rc.reverse();
}

export function integer(len: number): number[]{
    return new Array(len).fill(0);
}

export function filterOnIdx(arr: number[]){
  return (val: any, idx: number) => {
      return arr.indexOf(idx) >= 0;
  };
}

export function flatten<T>(...rest: T[]): T[] {
  let rc = [];
  for (let itm of  rest) {
      if (Array.isArray(itm)) {
          let rc2 = flatten(itm);
          rc.push(...rc2);
          continue;
      }
      rc.push(itm);
  }
  return rc;
}

export function mul(s: number){
  return (...rest: number[]) => {
     return flatten(...rest).map((d) => s * d);
  };
}
