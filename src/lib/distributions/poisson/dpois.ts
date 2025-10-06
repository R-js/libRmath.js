

// import createNS from '@common/debug-frontend';

// import { ML_ERR_return_NAN2 } from '@common/logger';
import { R_D__0, R_D__1, R_D_exp, R_D_fexp, R_D_nonint_check, DBL_MIN, M_2PI, log, R_D_nonint_checkV2 } from '@lib/r-func';
import { bd0 } from '@lib/deviance';
import { lgammafn_sign as lgammafn } from '@special/gamma/lgammafn_sign';
import { stirlerr } from '@lib/stirling';

// const printer = createNS('dpois');

export function dpois_raw(x: number, lambda: number, give_log: boolean): number {
    /*
        x >= 0 ; integer for dpois(), but not e.g. for pgamma()!
        lambda >= 0
    */
    if (lambda === 0) {
        return x === 0 ? R_D__1(give_log) : R_D__0(give_log);
    }
    if (!isFinite(lambda)) {
        return R_D__0(give_log);
    }
    /*if (x < 0) {
         return R_D__0(give_log);
    }*/
    if (x <= lambda * DBL_MIN) {
        return R_D_exp(give_log, -lambda);
    }
    if (lambda < x * DBL_MIN) {
        if (!isFinite(x)) {
            return R_D__0(give_log);
        }
        const gammafn = lgammafn(x + 1);
        const xlogLambda = x * log(lambda);
        const inp = -lambda + xlogLambda - gammafn;
        return R_D_exp(give_log, inp);
    }
    return R_D_fexp(give_log, M_2PI * x, -stirlerr(x) - bd0(x, lambda));
}

export function dpois(x: number, lambda: number, log = false): number {
    if (isNaN(x) || isNaN(lambda)) {
        return NaN;
    }

    if (lambda < 0) {
        // printer(DomainError);
        return NaN;
    }

    const rc = R_D_nonint_checkV2(log, x);

    if (rc !== undefined) {
        return rc;
    }

    if (x < 0 || !isFinite(x)) {
        return R_D__0(log);
    }

    return dpois_raw(x, lambda, log);
}
