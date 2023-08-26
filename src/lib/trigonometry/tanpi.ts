'use strict';

import createNS from '@mangos/debug-frontend';
import { mapErrV2, ME } from '@common/logger';
import { fmod, atan, tan } from '@lib/r-func';

// tan(pi * x)  -- exact when x = k/2  for all integer k
const printer_tanpi = createNS('tanpi');

export function tanpi(x: number): number {
    if (isNaN(x)) return x;
    if (!isFinite(x)) {
        printer_tanpi(mapErrV2[ME.ME_DOMAIN], printer_tanpi.namespace);
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
