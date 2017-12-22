import { imax2 } from '../common/_general';

const WILCOX_MAX = 50;

export function initw(n: number, m: number): number[][][] {
  let [m1, n1] = [m, n].map(v => imax2(v, WILCOX_MAX)).sort((a, b) => a - b);
  const u = m1 * n1;
  const c = u / 2;
  // we specify undefined for documentation purpose
  // it is checked explicity later
  return new Array(m + 1).fill(
    new Array(n + 1).fill(new Array(c + 1).fill(-1))
  );
}
