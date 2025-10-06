import { LoggerEnhanced, decorateWithLogger } from '@common/upstairs';
import interplateDomainErrorTemplate from '@lib/errors/interpolateDomainErrorTemplate';
import { DBL_MAX_EXP, min, max, log } from '@lib/r-func';
import { globalUni } from '@rng/global-rng';

const expmax = DBL_MAX_EXP * Math.LN2; /* = log(DBL_MAX) */

export default decorateWithLogger(function rbeta(this: LoggerEnhanced, shape1: number, shape2: number): number {
    const rng = globalUni();

    if (isNaN(shape1) || isNaN(shape2)) {
        this?.error(interplateDomainErrorTemplate, rbeta.name);
        return NaN;
    }
    if (shape1 < 0 || shape2 < 0) {
        this?.error(interplateDomainErrorTemplate, rbeta.name);
        return NaN;
    }
    if (!isFinite(shape1) && !isFinite(shape2)) {
        // a = b = Inf : all mass at 1/2
        return 0.5;
    }
    if (shape1 === 0 && shape2 === 0) {
        // point mass 1/2 at each of {0,1} :
        return rng.random() < 0.5 ? 0 : 1;
    }
    // now, at least one of a, b is finite and positive
    if (!isFinite(shape1) || shape2 === 0) {
        return 1.0;
    }
    if (!isFinite(shape2) || shape1 === 0) {
        return 0.0;
    }

    let r;
    let s;
    let t;
    let u1 = 0;
    let u2;
    let v = 0;
    let w = 0;
    let y;
    let z;

    /* FIXME:  Keep Globals (properly) for threading */
    /* Uses these GLOBALS to save time when many rv's are generated : */
    let beta = 0;
    let gamma = 0;
    let delta;
    let k1 = 0;
    let k2 = 0;
    let olda = -1.0;
    let oldb = -1.0;

    /* Test if we need new "initializing" */
    const qsame = olda === shape1 && oldb === shape2;
    if (!qsame) {
        olda = shape1;
        oldb = shape2;
    }

    const a = min(shape1, shape2);
    const b = max(shape1, shape2); /* a <= b */
    const alpha = a + b;

    function v_w_from__u1_bet(AA: number) {
        v = beta * log(u1 / (1.0 - u1));
        if (v <= expmax) {
            w = AA * Math.exp(v);
            if (!isFinite(w)) {
                w = Number.MAX_VALUE;
            }
        } else {
            w = Number.MAX_VALUE;
        }
    }

    if (a <= 1.0) {
        /* --- Algorithm BC --- */

        /* changed notation, now also a <= b (was reversed) */

        if (!qsame) {
            /* initialize */
            beta = 1.0 / a;
            delta = 1.0 + b - a;
            k1 = (delta * (0.0138889 + 0.0416667 * a)) / (b * beta - 0.777778);
            k2 = 0.25 + (0.5 + 0.25 / delta) * a;
        }
        /* FIXME: "do { } while()", but not trivially because of "continue"s:*/
        for (; ;) {
            u1 = rng.random();
            u2 = rng.random();
            if (u1 < 0.5) {
                y = u1 * u2;
                z = u1 * y;
                if (0.25 * u2 + z - y >= k1) continue;
            } else {
                z = u1 * u1 * u2;
                if (z <= 0.25) {
                    v_w_from__u1_bet(b);
                    break;
                }
                if (z >= k2) continue;
            }

            v_w_from__u1_bet(b);

            if (alpha * (log(alpha / (a + w)) + v) - 1.3862944 >= log(z)) break;
        }
        return shape1 === a ? a / (a + w) : w / (a + w);
    } else {
        /* Algorithm BB */

        if (!qsame) {
            /* initialize */
            beta = Math.sqrt((alpha - 2.0) / (2.0 * a * b - alpha));
            gamma = a + 1.0 / beta;
        }
        do {
            u1 = rng.random();
            u2 = rng.random();

            v_w_from__u1_bet(a);

            z = u1 * u1 * u2;
            r = gamma * v - 1.3862944;
            s = a + r - w;
            if (s + 2.609438 >= 5.0 * z) break;
            t = log(z);
            if (s > t) break;
        } while (r + alpha * log(alpha / (b + w)) < t);

        return shape1 !== a ? b / (b + w) : w / (b + w);
    }
});
