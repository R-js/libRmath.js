

// R versions of log1p and hypot
import { default as log1p } from '././lib/alt/log/log1p';
import { default as hypot } from './lib/alt/hypot/hypot';

// trigonometry
import { cospi } from './lib/trigonometry/cospi';
import { sinpi } from './lib/trigonometry/sinpi';
import { tanpi } from './lib/trigonometry/tanpi';

// distributions
import { rbetaOne, dbeta, pbeta, qbeta, rbeta } from './lib/distributions/beta';
import { dbinom, pbinom, qbinom, rbinom, rbinomOne } from './lib/distributions/binomial';

import { dnbinom, pnbinom, qnbinom, rnbinom, rnbinomOne } from './lib/distributions/binomial-negative';

import { dcauchy, pcauchy, qcauchy, rcauchy, rcauchyOne } from './lib/distributions/cauchy';

import { dchisq, pchisq, qchisq, rchisq, rchisqOne } from './lib/distributions/chi-2';

import { dexp, pexp, qexp, rexp, rexpOne } from './lib/distributions/exp';

import { df, pf, qf, rf, rfOne } from './lib/distributions/f-distro';

import { dgamma, pgamma, qgamma, rgamma, rgammaOne } from './lib/distributions/gamma';

import { dgeom, pgeom, qgeom, rgeom, rgeomOne } from './lib/distributions/geometric';

import {
    dhyper,
    phyper,
    qhyper,
    rhyper,
    rhyperOne,
    useWasmBackendHyperGeom,
    clearBackendHyperGeom
} from './lib/distributions/hypergeometric';

import { dlogis, plogis, qlogis, rlogis, rlogisOne } from './lib/distributions/logis';

import { dlnorm, plnorm, qlnorm, rlnorm, rlnormOne } from './lib/distributions/lognormal';

import { dmultinom, dmultinomLikeR, rmultinom } from './lib/distributions/multinom';

import { dnorm, pnorm, qnorm, rnorm, rnormOne } from './lib/distributions/normal';

import { dpois, ppois, qpois, rpois, rpoisOne } from './lib/distributions/poisson';

import {
    useWasmBackendSignRank,
    clearBackendSignRank,
    dsignrank,
    psignrank,
    qsignrank,
    rsignrank,
    rsignrankOne
} from './lib/distributions/signrank';

import { dt, pt, qt, rt, rtOne } from './lib/distributions/student-t';

import { ptukey, qtukey } from './lib/distributions/tukey';

import { dunif, punif, qunif, runif, runifOne } from './lib/distributions/uniform';

import { dweibull, pweibull, qweibull, rweibull, rweibullOne } from './lib/distributions/weibull';

import { dwilcox, pwilcox, qwilcox, rwilcox, rwilcoxOne } from './lib/distributions/wilcoxon';

//rng (uniform)
/*import { KnuthTAOCP } from './lib/rng/knuth-taocp';

import { KnuthTAOCP2002 } from './lib/rng/knuth-taocp-2002';
import { LecuyerCMRG } from './lib/rng/lecuyer-cmrg';
import { MersenneTwister } from './lib/rng/mersenne-twister';
import { SuperDuper } from './lib/rng/super-duper';
import { MarsagliaMultiCarry } from './lib/rng/marsaglia-multicarry';
import { WichmannHill } from './lib/rng/wichmann-hill';
*/
//rng (normal)
/*import { AhrensDieter } from './lib/rng/normal/ahrens-dieter';
import { Inversion } from './lib/rng/normal/inversion';
import { BoxMuller } from './lib/rng/normal/box-muller';
import { BuggyKindermanRamage } from './lib/rng/normal/buggy-kinderman-ramage';
import { KindermanRamage } from './lib/rng/normal/kinderman-ramage';
*/
import { default as seed } from './lib/rng/seed';
// stubs
import { IRNG, MessageType } from './lib/rng/irng';
import { IRNGNormal } from './lib/rng/normal/normal-rng';
import type { IRNGNormalType } from './lib/rng/normal/rng-types';

// globalRNG
import { RNGkind, setSeed, randomSeed } from './lib/rng/global-rng';

// special
import { BesselJ, BesselI, BesselK, besselY } from './lib/special/bessel';

import { beta, lbeta } from './lib/special/beta';
import { lchoose, choose } from './lib/special/choose';
import { gamma, digamma, pentagamma, psigamma, tetragamma, trigamma, lgamma } from './lib/special/gamma';

export type { IRNGNormalType };

const defaultObservableNoteBook = {
    // R versions of log1p and hypot
    log1p,
    hypot,
    // trigonometry
    cospi,
    sinpi,
    tanpi,
    // beta distribution
    rbetaOne,
    dbeta,
    pbeta,
    qbeta,
    rbeta,
    // Binomial distribution
    dbinom,
    pbinom,
    qbinom,
    rbinom,
    rbinomOne,
    //
    dnbinom,
    pnbinom,
    qnbinom,
    rnbinom,
    rnbinomOne,
    //
    dcauchy,
    pcauchy,
    qcauchy,
    rcauchy,
    rcauchyOne,
    //
    dchisq,
    pchisq,
    qchisq,
    rchisq,
    rchisqOne,
    //
    dexp,
    pexp,
    qexp,
    rexp,
    rexpOne,
    //
    df,
    pf,
    qf,
    rf,
    rfOne,
    //
    dgamma,
    pgamma,
    qgamma,
    rgamma,
    rgammaOne,
    //
    dgeom,
    pgeom,
    qgeom,
    rgeom,
    rgeomOne,
    //
    dhyper,
    phyper,
    qhyper,
    rhyper,
    rhyperOne,
    useWasmBackendHyperGeom,
    clearBackendHyperGeom,
    //
    useWasmBackendSignRank,
    clearBackendSignRank,
    dsignrank,
    psignrank,
    qsignrank,
    rsignrank,
    rsignrankOne,
    //
    dlogis,
    plogis,
    qlogis,
    rlogis,
    rlogisOne,
    //
    dlnorm,
    plnorm,
    qlnorm,
    rlnorm,
    rlnormOne,
    //
    dmultinom,
    dmultinomLikeR,
    rmultinom,
    //
    dnorm,
    pnorm,
    qnorm,
    rnorm,
    rnormOne,
    //
    dpois,
    ppois,
    qpois,
    rpois,
    rpoisOne,
    //
    dt,
    pt,
    qt,
    rt,
    rtOne,
    //
    ptukey,
    qtukey,
    //
    dunif,
    punif,
    qunif,
    runif,
    runifOne,
    //
    dweibull,
    pweibull,
    qweibull,
    rweibull,
    rweibullOne,
    //
    dwilcox,
    pwilcox,
    qwilcox,
    rwilcox,
    rwilcoxOne,
    // uniform rngs
    /*KnuthTAOCP,
    KnuthTAOCP2002,
    MersenneTwister,
    SuperDuper,
    MarsagliaMultiCarry,
    WichmannHill,
    // normal rngs
    AhrensDieter,
    Inversion,
    BoxMuller,
    BuggyKindermanRamage,
    KindermanRamage,
    */
    //
    seed,
    // infrastructure
    // abstract class IRNG
    IRNG,
    // enum
    MessageType,
    // abstract class IRNGNormal
    IRNGNormal,
    // enums
    //
    //globalUni,
    //globalNorm,
    RNGkind,
    setSeed,
    randomSeed,
    //
    BesselJ,
    BesselI,
    BesselK,
    besselY,
    //
    beta,
    lbeta,
    //
    lchoose,
    choose,
    //
    gamma,
    digamma,
    pentagamma,
    psigamma,
    tetragamma,
    trigamma,
    lgamma
};

export {
    // R versions of log1p and hypot
    log1p,
    hypot,
    cospi,
    sinpi,
    tanpi,
    // beta distribution
    rbetaOne,
    dbeta,
    pbeta,
    qbeta,
    rbeta,
    // binomial distribution
    dbinom,
    pbinom,
    qbinom,
    rbinom,
    rbinomOne,
    //
    dnbinom,
    pnbinom,
    qnbinom,
    rnbinom,
    rnbinomOne,
    //
    dcauchy,
    pcauchy,
    qcauchy,
    rcauchy,
    rcauchyOne,
    //
    dchisq,
    pchisq,
    qchisq,
    rchisq,
    rchisqOne,
    //
    dexp,
    pexp,
    qexp,
    rexp,
    rexpOne,
    //
    df,
    pf,
    qf,
    rf,
    rfOne,
    //
    dgamma,
    pgamma,
    qgamma,
    rgamma,
    rgammaOne,
    //
    dgeom,
    pgeom,
    qgeom,
    rgeom,
    rgeomOne,
    //
    dhyper,
    phyper,
    qhyper,
    rhyper,
    rhyperOne,
    useWasmBackendHyperGeom,
    clearBackendHyperGeom,
    //
    useWasmBackendSignRank,
    clearBackendSignRank,
    dsignrank,
    psignrank,
    qsignrank,
    rsignrank,
    rsignrankOne,
    //
    dlogis,
    plogis,
    qlogis,
    rlogis,
    rlogisOne,
    //
    dlnorm,
    plnorm,
    qlnorm,
    rlnorm,
    rlnormOne,
    //
    dmultinom,
    dmultinomLikeR,
    rmultinom,
    //
    dnorm,
    pnorm,
    qnorm,
    rnorm,
    rnormOne,
    //
    dpois,
    ppois,
    qpois,
    rpois,
    rpoisOne,
    //
    dt,
    pt,
    qt,
    rt,
    rtOne,
    //
    ptukey,
    qtukey,
    //
    dunif,
    punif,
    qunif,
    runif,
    runifOne,
    //
    dweibull,
    pweibull,
    qweibull,
    rweibull,
    rweibullOne,
    //
    dwilcox,
    pwilcox,
    qwilcox,
    rwilcox,
    rwilcoxOne,
    // uniforms rngs
    /*KnuthTAOCP,
    KnuthTAOCP2002,
    LecuyerCMRG,
    MersenneTwister,
    SuperDuper,
    MarsagliaMultiCarry,
    WichmannHill,
    // normal rngs
    AhrensDieter,
    Inversion,
    BoxMuller,
    BuggyKindermanRamage,
    KindermanRamage,
    */
    //
    seed,
    // infrastructure
    // abstract class IRNG
    IRNG,
    // enum
    MessageType,
    // abstract class IRNGNormal
    IRNGNormal,
    // enums
    //
    //globalUni,
    //globalNorm,
    RNGkind,
    setSeed,
    randomSeed,
    //
    BesselJ,
    BesselI,
    BesselK,
    besselY,
    //
    beta,
    lbeta,
    //
    lchoose,
    choose,
    //
    gamma,
    digamma,
    pentagamma,
    psigamma,
    tetragamma,
    trigamma,
    lgamma
};
export { defaultObservableNoteBook as default };
