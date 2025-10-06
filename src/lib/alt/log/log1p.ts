/* want to compile log1p as Rlog1p if HAVE_LOG1P && !HAVE_WORKING_LOG1P */
import chebyshev_eval from '../../chebyshev/chebyshev';
import { abs as fabs, log } from '@lib/r-func';

import {
    NEGATIVE_INFINITY,
    EPSILON,
} from '@lib/r-func';
import interplateDomainErrorTemplate from '@lib/errors/interplateDomainErrorTemplate';
import { LoggerEnhanced, decorateWithLogger } from '@common/upstairs';
import interpolatePrecisionErrorTemplate from '@lib/errors/interpolatePrecisionErrorTemplate';

// series for log1p on the interval -.375 to .375
//				     with weighted error   6.35e-32
//				      log weighted error  31.20
//			    significant figures required  30.93
//				 decimal places required  32.01
//
const alnrcs = [
    +0.10378693562743769800686267719098e1,
    -0.13364301504908918098766041553133,
    +0.1940824913552056335792619937475e-1,
    -0.30107551127535777690376537776592e-2,
    +0.48694614797154850090456366509137e-3,
    -0.81054881893175356066809943008622e-4,
    +0.13778847799559524782938251496059e-4,
    -0.23802210894358970251369992914935e-5,
    +0.41640416213865183476391859901989e-6,
    -0.73595828378075994984266837031998e-7,
    +0.13117611876241674949152294345011e-7,
    -0.23546709317742425136696092330175e-8,
    +0.42522773276034997775638052962567e-9,
    -0.771908941348407968261081074933e-10,
    +0.14075746481359069909215356472191e-10,
    -0.25769072058024680627537078627584e-11,
    +0.47342406666294421849154395005938e-12,
    -0.87249012674742641745301263292675e-13,
    +0.16124614902740551465739833119115e-13,
    -0.29875652015665773006710792416815e-14,
    +0.55480701209082887983041321697279e-15,
    -0.10324619158271569595141333961932e-15,
    +0.19250239203049851177878503244868e-16,
    -0.35955073465265150011189707844266e-17,
    +0.67264542537876857892194574226773e-18,
    -0.12602624168735219252082425637546e-18,
    +0.23644884408606210044916158955519e-19,
    -0.44419377050807936898878389179733e-20,
    +0.83546594464034259016241293994666e-21,
    -0.15731559416479562574899253521066e-21,
    +0.29653128740247422686154369706666e-22,
    -0.55949583481815947292156013226666e-23,
    +0.10566354268835681048187284138666e-23,
    -0.19972483680670204548314999466666e-24,
    +0.37782977818839361421049855999999e-25,
    -0.71531586889081740345038165333333e-26,
    +0.13552488463674213646502024533333e-26,
    -0.25694673048487567430079829333333e-27,
    +0.48747756066216949076459519999999e-28,
    -0.92542112530849715321132373333333e-29,
    +0.1757859784176023923326976e-29,
    -0.33410026677731010351377066666666e-30,
    +0.63533936180236187354180266666666e-31,
];

export default decorateWithLogger(function log1p(this: LoggerEnhanced, x: number): number {
    const nlnrel = 22;
    const xmin = -0.999999985;

    if (x === 0) return 0; // speed
    if (x === -1) return NEGATIVE_INFINITY;
    if (x < -1) {
        this?.error(interplateDomainErrorTemplate, log1p.name);
        return NaN;
    }

    if (fabs(x) <= 0.375) {
        // Improve on speed (only);
        // again give result accurate to IEEE double precision:
        if (fabs(x) < 0.5 * EPSILON) return x;

        if ((0 < x && x < 1e-8) || (-1e-9 < x && x < 0)) return x * (1 - 0.5 * x);
        // else
        return x * (1 - x * chebyshev_eval(x / 0.375, alnrcs, nlnrel));
    }
    // else
    if (x < xmin) {
        // answer less than half precision because x too near -1
        this?.error(interpolatePrecisionErrorTemplate, log1p.name);
    }
    return log(1 + x);
});
