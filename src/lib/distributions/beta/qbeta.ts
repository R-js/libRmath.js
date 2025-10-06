import { LoggerEnhanced, decorateWithLogger } from '@common/upstairs';
import qbeta_raw from './qbeta_raw';
import interplateDomainErrorTemplate from '@lib/errors/interpolateDomainErrorTemplate';


const USE_LOG_X_CUTOFF = -5;
//                       --- based on some testing; had = -10
const n_NEWTON_FREE = 4;
//                   --- based on some testing; had = 10

const MLOGICAL_NA = -1;

export default decorateWithLogger(function qbeta(this: LoggerEnhanced, p: number, shape1: number, shape2: number, lower_tail: boolean, log_p: boolean): number {
    /* test for admissibility of parameters */

    if (isNaN(shape1) || isNaN(shape2) || isNaN(p)) {
        return shape1 + shape2 + p;
    }

    if (shape1 < 0 || shape2 < 0) {
        this?.error(interplateDomainErrorTemplate, qbeta.name);
        return NaN;
    }
    // allowing p==0 and q==0  <==> treat as one- or two-point mass

    const qbet = new Float64Array(2); // = { qbeta(), 1 - qbeta() }

    qbeta_raw(p, shape1, shape2, lower_tail, log_p, MLOGICAL_NA, USE_LOG_X_CUTOFF, n_NEWTON_FREE, qbet);
    return qbet[0];
});
