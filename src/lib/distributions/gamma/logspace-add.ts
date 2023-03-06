
export function logspace_add(logx: number, logy: number): number {
    return Math.max(logx, logy) + Math.log1p(Math.exp(-Math.abs(logx - logy)));
}
