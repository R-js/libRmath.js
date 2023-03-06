import { dgamma } from '@dist/gamma/dgamma';

export function dchisq(x: number, df: number, log: boolean): number {
    return dgamma(x, df / 2, 2, log);
}
