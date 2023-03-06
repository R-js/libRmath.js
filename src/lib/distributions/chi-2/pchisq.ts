import { pgamma } from '@dist/gamma/pgamma';

export function pchisq(x: number, df: number, lowerTail: boolean, logP: boolean): number {
    return pgamma(x, df / 2, 2, lowerTail, logP);
}
