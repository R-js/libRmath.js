import { abs, max, log1p, exp } from '@lib/r-func';
export function logspace_add(logx: number, logy: number): number {
    return max(logx, logy) + log1p(exp(-abs(logx - logy)));
}
