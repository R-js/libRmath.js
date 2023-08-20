import createNS from '@mangos/debug-frontend';

import { fmod } from '@lib/r-func';

import { ME, mapErrV2 } from '@common/logger';

// sin(pi * x)  -- exact when x = k/2  for all integer k
const printer_sinpi = createNS('sinpi');

export function sinpi(x: number): number {
    if (isNaN(x)) return x;
    if (!isFinite(x)) {
        printer_sinpi(mapErrV2[ME.ME_DOMAIN], 'sinpi not finite');
        return NaN;
    }
    x = fmod(x, 2); // sin(pi(x + 2k)) == sin(pi x)  for all integer k
    // map (-2,2) --> (-1,1] :
    if (x <= -1) x += 2;
    else if (x > 1) x -= 2;
    if (x === 0 || x === 1) return 0;
    if (x === 0.5) return 1;
    if (x === -0.5) return -1;
    // otherwise
    return Math.sin(Math.PI * x);
}
