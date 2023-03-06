import { qgamma } from '@dist/gamma/qgamma';

export function qchisq(p: number, df: number, lowerTail: boolean, logP: boolean): number {
    return qgamma(p, 0.5 * df, 2.0, lowerTail, logP);
}
