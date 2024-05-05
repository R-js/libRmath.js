

import { debug } from '@mangos/debug';

import { fmod, atan, tan } from '@lib/r-func';

import { ME, ML_ERROR2, lineInfo4 } from '@common/logger';
// tan(pi * x)  -- exact when x = k/2  for all integer k
const printer_tanpi = debug('tanpi');

export function tanpi(x: number): number {
    if (isNaN(x)) return x;
    if (!isFinite(x)) {
        ML_ERROR2(ME.ME_DOMAIN, lineInfo4, printer_tanpi);
        return NaN;
    }
    x = fmod(x, 1); // tan(pi(x + k)) == tan(pi x)  for all integer k
    // map (-1,1) --> (-1/2, 1/2] :
    if (x <= -0.5) {
        x++;
    } else if (x > 0.5) {
        x--;
    }
    return x === 0 ? 0 : x === 0.5 ? NaN : tan(Math.PI * x);
}

export function atanpi(x: number): number {
    return atan(x) / Math.PI;
}
