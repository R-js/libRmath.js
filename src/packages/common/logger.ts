import createNs from '@mangos/debug-frontend';

const debug_R_Q_P01_boundaries = createNs('R_Q_P01_boundaries');
const debug_R_Q_P01_check = createNs('R_Q_P01_check');

export const ME = {
    ME_NONE: 0, // no error
    ME_DOMAIN: 1, // argument out of domain
    ME_RANGE: 2, //  value out of range
    ME_NOCONV: 4, //process did not converge
    ME_PRECISION: 8, //does not have "full" precision
    ME_UNDERFLOW: 16 // and underflow occured (important for IEEE)
};

export const mapErrV2 = {
    [ME.ME_NONE]: 'No error',
    [ME.ME_DOMAIN]: "argument out of domain in '%s'",
    [ME.ME_RANGE]: "argument out of range in '%s'",
    [ME.ME_NOCONV]: "convergence failed in '%s'",
    [ME.ME_PRECISION]: "full precision may not have been achieved in '%s'",
    [ME.ME_UNDERFLOW]: "underflow occurred in '%s'"
};

export function R_Q_P01_boundaries(
    lower_tail: boolean,
    log_p: boolean,
    p: number,
    _LEFT_: number,
    _RIGHT_: number
): number | undefined {
    if (log_p) {
        if (p > 0) {
            debug_R_Q_P01_boundaries(mapErrV2[ME.ME_DOMAIN], debug_R_Q_P01_boundaries.namespace);
            return NaN;
        }
        if (p === 0)
            /* upper bound*/
            return lower_tail ? _RIGHT_ : _LEFT_;
        if (p === -Infinity) return lower_tail ? _LEFT_ : _RIGHT_;
    } else {
        /* !log_p */
        if (p < 0 || p > 1) {
            debug_R_Q_P01_boundaries(mapErrV2[ME.ME_DOMAIN], debug_R_Q_P01_boundaries.namespace);
            return NaN;
        }
        if (p === 0) return lower_tail ? _LEFT_ : _RIGHT_;
        if (p === 1) return lower_tail ? _RIGHT_ : _LEFT_;
    }
    return undefined;
}

export function R_Q_P01_check(logP: boolean, p: number): number | undefined {
    if ((logP && p > 0) || (!logP && (p < 0 || p > 1))) {
        debug_R_Q_P01_check(mapErrV2[ME.ME_DOMAIN], debug_R_Q_P01_check.namespace);
        return NaN;
    }
    return undefined;
}
