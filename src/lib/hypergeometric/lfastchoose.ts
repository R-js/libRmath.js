import { internal_lbeta } from '../beta/lbeta';
const { log } = Math;
// used by "qhyper"
export function lfastchoose(n: number, k: number) {
  return -log(n + 1) - internal_lbeta(n - k + 1, k + 1);
}
