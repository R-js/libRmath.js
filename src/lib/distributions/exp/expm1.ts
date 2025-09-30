import { M_LN2, R_D_Cval, R_D_log, R_D_Lval } from '@lib/r-func';

const { exp, expm1, log, log1p } = Math;

function R_DT_qIv(lower_tail: boolean, log_p: boolean, p: number): number {
    if (log_p) {
        return lower_tail ? exp(p) : -expm1(p);
    }
    /*
    if (lower_tail)
    {
        return p
    }
    return 1 - p;
    */
    return R_D_Lval(lower_tail, p);
}

function R_DT_CIv(lower_tail: boolean, log_p: boolean, p: number): number {
    return log_p ? (lower_tail ? -expm1(p) : exp(p)) : R_D_Cval(lower_tail, p);
}

function R_D_LExp(log_p: boolean, x: number): number {
    return log_p ? R_Log1_Exp(x) : log1p(-x);
}

// log(1 - exp(x))  in more stable form than log1p(- R_D_qIv(x)) :
function R_Log1_Exp(x: number): number {
    if (x > -M_LN2) {
        return log(-expm1(x));
    }
    return log1p(-exp(x));
}

function R_DT_Clog(lower_tail: boolean, log_p: boolean, p: number): number {
    return lower_tail ? R_D_LExp(log_p, p) : R_D_log(log_p, p); /* log(1-p) in qF*/
}

function R_DT_log(lower_tail: boolean, log_p: boolean, p: number): number {
    /* log(p) in qF */
    return lower_tail ? R_D_log(log_p, p) : R_D_LExp(log_p, p);
}

export { R_DT_qIv, R_DT_CIv, R_DT_log, R_DT_Clog, R_Log1_Exp, R_D_LExp };
