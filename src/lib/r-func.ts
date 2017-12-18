const { abs, sign, trunc } = Math;

export const seq = (adjust = 0) => (adjustMin = adjust) => 
(start: number, end: number, step: number = 1): number[] => {
  let s = start + adjust;
  let e = end + adjust;
  let cursor = s;
  if (end < start) {
    e = start + adjustMin;
    s = end + adjustMin;
    cursor = e;
  }
  
  step = abs(step) * sign(end - start);
  const rc = [];

  do {
    rc.push( cursor );
    cursor += step;
  } while ( cursor >= s && cursor <= e);
  return rc;
};

export function selector(indexes: number[]) {
  return (val: any, idx: number) => {
    return indexes.indexOf(idx) >= 0;
  };
}

export function flatten<T>(...rest: (T | T[])[]): T[] {
  let rc = [];
  for (let itm of rest) {
    if (Array.isArray(itm)) {
      let rc2 = flatten(itm);
      rc.push(...rc2);
      continue;
    }
    rc.push(itm);
  }
  return rc;
}
