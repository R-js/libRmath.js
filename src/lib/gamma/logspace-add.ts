/*
 * Compute the log of a sum from logs of terms, i.e.,
 *
 *     log (exp (logx) + exp (logy))
 *
 * without causing overflows and without throwing away large handfuls
 * of accuracy.
 */

const { max: fmax2, log1p, exp, abs: fabs } = Math;

export function logspace_add(logx: number, logy: number) {
  return fmax2(logx, logy) + log1p(exp(-fabs(logx - logy)));
}
