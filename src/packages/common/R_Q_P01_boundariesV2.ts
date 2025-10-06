import interplateDomainErrorTemplate from "@lib/errors/interpolateDomainErrorTemplate";
import { LoggerEnhanced, decorateWithLogger } from "./upstairs";

export default decorateWithLogger(function R_Q_P01_boundaries(
    this: LoggerEnhanced,
    lower_tail: boolean,
    log_p: boolean,
    p: number,
    _LEFT_: number,
    _RIGHT_: number
): number | undefined {
    if (log_p) {
        if (p > 0) {
            this?.error?.(interplateDomainErrorTemplate, R_Q_P01_boundaries.name)
            return NaN;
        }
        if (p === 0) {
            /* upper bound*/
            return lower_tail ? _RIGHT_ : _LEFT_;
        }
        if (p === -Infinity) {
            return lower_tail ? _LEFT_ : _RIGHT_;
        }
    } else {
        /* !log_p */
        if (p < 0 || p > 1) {
            this?.error?.(interplateDomainErrorTemplate, R_Q_P01_boundaries.name)
            return NaN;
        }
        if (p === 0) {
            return lower_tail ? _LEFT_ : _RIGHT_;
        }
        if (p === 1) {
            return lower_tail ? _RIGHT_ : _LEFT_;
        }
    }
});
