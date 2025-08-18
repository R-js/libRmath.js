

import createNS from '@common/debug-frontend';

import { fmod } from '@lib/r-func';

import { ML_ERR_return_NAN2 } from '@common/logger';

/* HAVE_COSPI etc will not be defined in standalone-use: the
   intention is to make the versions here available in that case.

   The __cospi etc variants are from OS X (and perhaps other BSD-based systems).
*/

// cos(pi * x)  -- exact when x = k/2  for all integer k
const printer_cospi = createNS('cospi');

export function cospi(x: number): number {
    // NaNs propagated correctly
    if (isNaN(x)) return x;
    if (!isFinite(x)) {
        return ML_ERR_return_NAN2(printer_cospi);
    }

    x = fmod(Math.abs(x), 2); // cos() symmetric; cos(pi(x + 2k)) == cos(pi x) for all integer k
    if (fmod(x, 1) === 0.5) return 0;
    if (x === 1) return -1;
    if (x === 0) return 1;
    // otherwise
    return Math.cos(Math.PI * x);
}
