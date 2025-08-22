import createNS from '@common/debug-frontend';

import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_DT_0, R_DT_1 } from '@lib/r-func';
import { pbeta } from '@dist/beta/pbeta';
import { Toms708 } from '@common/toms708/toms708';
import { NumberW } from '@common/toms708/NumberW';

const printer = createNS('pnbinom');

export function pnbinom(x: number, size: number, prob: number, lowerTail: boolean, logP: boolean): number {
    if (isNaN(x) || isNaN(size) || isNaN(prob)) return x + size + prob;
    if (!isFinite(size) || !isFinite(prob)) {
        return ML_ERR_return_NAN2(printer);
    }

    if (size < 0 || prob <= 0 || prob > 1) {
        return ML_ERR_return_NAN2(printer);
    }

    /* limiting case: point mass at zero */
    if (size === 0) return x >= 0 ? R_DT_1(lowerTail, logP) : R_DT_0(lowerTail, logP);

    if (x < 0) return R_DT_0(lowerTail, logP);
    if (!isFinite(x)) return R_DT_1(lowerTail, logP);
    x = Math.floor(x + 1e-7);
    return pbeta(prob, size, x + 1, lowerTail, logP);
}

const printer_pnbinom_mu = createNS('pnbinom_mu');

export function pnbinom_mu(x: number, size: number, mu: number, lowerTail: boolean, logP: boolean): number {
    if (isNaN(x) || isNaN(size) || isNaN(mu)) return x + size + mu;
    if (!isFinite(size) || !isFinite(mu)) {
        return ML_ERR_return_NAN2(printer_pnbinom_mu);
    }

    if (size < 0 || mu < 0) {
        return ML_ERR_return_NAN2(printer_pnbinom_mu);
    }

    /* limiting case: point mass at zero */
    if (size === 0) {
        return x >= 0 ? R_DT_1(lowerTail, logP) : R_DT_0(lowerTail, logP);
    }
    if (x < 0) {
        return R_DT_0(lowerTail, logP);
    }
    if (!isFinite(x)) {
        return R_DT_1(lowerTail, logP);
    }
    x = Math.floor(x + 1e-7);
    /* return
     * pbeta(pr, size, x + 1, lowerTail, logP);  pr = size/(size + mu), 1-pr = mu/(size+mu)
     *
     *= pbeta_raw(pr, size, x + 1, lowerTail, logP)
     *            x.  pin   qin
     *=  bratio (pin,  qin, x., 1-x., &w, &wc, &ierr, logP),  and return w or wc ..
     *=  bratio (size, x+1, pr, 1-pr, &w, &wc, &ierr, logP) */
    {
        const ierr = new NumberW(0);
        const w = new NumberW(0);
        const wc = new NumberW(0);
        Toms708.bratio(size, x + 1, size / (size + mu), mu / (size + mu), w, wc, ierr);
        if (ierr.val) {
            printer('pnbinom_mu() -> bratio() gave error code %d', ierr.val);
        }
        if (logP) {
            w.val = Math.log(w.val);
            wc.val = Math.log(wc.val);
        }
        return lowerTail ? w.val : wc.val;
    }
}
