import { special } from '../gamma';
import { any, arrayrify, forceToArray, sum } from '../r-func';
const { isFinite } = Number;

const div = arrayrify((a: number, b: number) => a / b);
const { lgamma } = special;
const add = arrayrify((a: number, b: number) => a + b);
const log = arrayrify(Math.log);

export interface IdmultinomOptions<T extends number | number[]> {
  x: T;
  size?: number;
  prob: T;
  asLog: boolean;
}

export function dmultinom<T extends number | number[]>(
  o: IdmultinomOptions<T>
): number | number[] {
  // init
  // first prob and x must have the same length
  o.asLog = !!o.asLog;
  let x: number[] = forceToArray(o.x).filter(f => !!f) as any;
  //
  let prob: number[] = forceToArray(o.prob) as any;
  let badProb = !!prob.find(f => !isFinite(f) || f < 0);
  let s = sum(prob);
  if (badProb || s === 0) {
    throw new Error('probabilities must be finite, non-negative and not all 0');
  }
  prob = div(prob, s) as any;
  x = x.map(Math.round);
  if (any(x)(v => v < 0)) {
    throw new Error('probabilities must be finite, non-negative and not all 0');
  }
  const N = sum(x);
  const size = o.size && N;
  if (size !== N) {
    throw new Error('size != sum(x), i.e. one is wrong');
  }
  const i0 = prob.map(p => p === 0);
  if (any(i0)(v => !!v)) {
    if (i0.find((_v, i) => x[i] !== 0)) {
      return o.asLog ? -Infinity : 0;
    }
    x = x.filter((_v, i) => i0[i]);
    prob = prob.filter((_v, i) => i0[i]);
  }
  const s1 = lgamma(add(x, 1));
  const s2 = log(prob);
  const s3 = x.map((v, i) => v * s2[i] - s1[i]);

  const r = lgamma(size + 1) + sum(s3);
  return o.asLog ? r : Math.exp(r);
}
