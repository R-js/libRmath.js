const collectCoverageFrom = [
    'src/lib/distributions/beta/*.ts',
    'src/lib/distributions/binomial/*.ts',
    'src/lib/distributions/binomial-negative/*.ts',
    'src/lib/distributions/cauchy/*.ts',
    'src/lib/distributions/chi-2/*.ts',
    'src/lib/distributions/exp/*.ts',
    'src/lib/distributions/f-distro/*.ts',
    'src/lib/distributions/gamma/*.ts',
    'src/lib/distributions/geometric/*.ts',
    'src/lib/distributions/hypergeometric/*.ts',
    'src/lib/distributions/logis/*.ts',
    'src/lib/distributions/lognormal/*.ts',
    'src/lib/distributions/multinom/*.ts',
    'src/lib/distributions/normal/*.ts',
    'src/lib/distributions/poisson/*.ts',
    'src/lib/distributions/signrank/*.ts',
    'src/lib/distributions/student-t/*.ts',
    'src/lib/distributions/tukey/*.ts',
    'src/lib/distributions/uniform/*.ts',
    'src/lib/distributions/weibull/*.ts',
    'src/lib/distributions/wilcoxon/*.ts',
    'src/lib/r-func.ts',
    'src/lib/index.ts',
    'src/lib/trigonometry/*.ts',
    'src/lib/stirling/index.ts',
    'src/lib/special/**/*.ts',
    //
    'src/lib/rng/**/*.ts',
    'src/packages/common/logger.ts'
];

const betaTest = [
    '/distributions/beta/__test__/dbeta.test.ts$',
    '/distributions/beta/__test__/dnbeta.test.ts$',
    '/distributions/beta/__test__/pbeta.test.ts$',
    '/distributions/beta/__test__/pnbeta.test.ts$',
    '/distributions/beta/__test__/qbeta.test.ts$',
    '/distributions/beta/__test__/qnbeta.test.ts$',
    '/distributions/beta/__test__/rbeta.test.ts$'
];

const binomTest = [
    '/distributions/binomial/__test__/dbinom.test.ts$',
    '/distributions/binomial/__test__/pbinom.test.ts$',
    '/distributions/binomial/__test__/qbinom.test.ts$',
    '/distributions/binomial/__test__/rbinom.test.ts$',
];

const binonNegativeTest = [
    '/distributions/binomial-negative/__test__/dnbinom.test.ts$',
    '/distributions/binomial-negative/__test__/pnbinom.test.ts$',
    '/distributions/binomial-negative/__test__/qnbinom.test.ts$',
    '/distributions/binomial-negative/__test__/rnbinom.test.ts$',
];

const cauchyTest = [
    '/distributions/cauchy/__test__/dcauchy.test.ts$',
    '/distributions/cauchy/__test__/pcauchy.test.ts$',
    '/distributions/cauchy/__test__/qcauchy.test.ts$',
    '/distributions/cauchy/__test__/rcauchy.test.ts$'
];

const chisqTest = [
    '/distributions/chi-2/__test__/dchisq.test.ts$',
    '/distributions/chi-2/__test__/dnchisq.test.ts$',
    '/distributions/chi-2/__test__/pchisq.test.ts$',
    '/distributions/chi-2/__test__/pnchisq.test.ts$',
    '/distributions/chi-2/__test__/qchisq.test.ts$',
    '/distributions/chi-2/__test__/qnchisq.test.ts$',
    '/distributions/chi-2/__test__/rchisq.test.ts$',
    '/distributions/chi-2/__test__/rnchisq.test.ts$'
];

const expTest = [
    '/distributions/exp/__test__/dexp.test.ts$',
    '/distributions/exp/__test__/pexp.test.ts$',
    '/distributions/exp/__test__/qexp.test.ts$',
    '/distributions/exp/__test__/rexp.test.ts$'
];

const pfTest = [
    '/distributions/f-distro/__test__/df.test.ts$',
    '/distributions/f-distro/__test__/dnf.test.ts$',
    '/distributions/f-distro/__test__/pf.test.ts$',
    '/distributions/f-distro/__test__/pnf.test.ts$',
    '/distributions/f-distro/__test__/qf.test.ts$',
    '/distributions/f-distro/__test__/qnf.test.ts$',
    '/distributions/f-distro/__test__/rf.test.ts$',
    '/distributions/f-distro/__test__/rnf.test.ts$',
];

const gammaDistributionTest = [
    '/distributions/gamma/__test__/dgamma.test.ts$',
    '/distributions/gamma/__test__/pgamma.test.ts$',
    '/distributions/gamma/__test__/qgamma.test.ts$',
    '/distributions/gamma/__test__/rgamma.test.ts$'
];

const geoMetricTest = [
    '/distributions/geometric/__test__/dgeom.test.ts$',
    '/distributions/geometric/__test__/pgeom.test.ts$',
    '/distributions/geometric/__test__/qgeom.test.ts$',
    '/distributions/geometric/__test__/rgeom.test.ts$'
]

const hyperGeometricTest = [
    '/distributions/hypergeometric/__test__/dhyper.test.ts$',
    '/distributions/hypergeometric/__test__/phyper.test.ts$',
    '/distributions/hypergeometric/__test__/qhyper.test.ts$',
    '/distributions/hypergeometric/__test__/rhyper.test.ts$'
];

const logisTest = [
    '/distributions/logis/__test__/dlogis.test.ts$',
    '/distributions/logis/__test__/plogis.test.ts$',
    '/distributions/logis/__test__/qlogis.test.ts$',
    '/distributions/logis/__test__/rlogis.test.ts$',
];

const lognormalTest = [
    '/distributions/lognormal/__test__/dlnorm.test.ts$',
    '/distributions/lognormal/__test__/plnorm.test.ts$',
    '/distributions/lognormal/__test__/qlnorm.test.ts$',
    '/distributions/lognormal/__test__/rlnorm.test.ts$'
];

const multinomTest = [
    '/distributions/multinom/__test__/dmultinom.test.ts$',
    '/distributions/multinom/__test__/rmultinom.test.ts$',
];

const normalTest = [
    '/distributions/normal/__test__/dnorm.test.ts$',
    '/distributions/normal/__test__/pnorm.test.ts$',
    '/distributions/normal/__test__/qnorm.test.ts$',
    '/distributions/normal/__test__/rnorm.test.ts$',
];

const poissonTest = [
    '/distributions/poisson/__test__/dpois.test.ts$',
    '/distributions/poisson/__test__/ppois.test.ts$',
    '/distributions/poisson/__test__/qpois.test.ts$',
    '/distributions/poisson/__test__/rpois.test.ts$',
];

const signRankTest = [
    '/distributions/signrank/__test__/dsign.test.ts$',
    '/distributions/signrank/__test__/psign.test.ts$',
    '/distributions/signrank/__test__/qsign.test.ts$',
    '/distributions/signrank/__test__/rsign.test.ts$',
];

const studentT = [
    '/distributions/student-t/__test__/rt.test.ts$',
    '/distributions/student-t/__test__/dt.test.ts$',
    '/distributions/student-t/__test__/pt.test.ts$',
    '/distributions/student-t/__test__/qt.test.ts$',
    '/distributions/student-t/__test__/qnt.test.ts$',
];

const tukeyHSD = [
    '/distributions/tukey/__test__/qtukey.test.ts$',
    '/distributions/tukey/__test__/ptukey.test.ts$',
];

const weibullTest = [
    '/distributions/weibull/__test__/dweibull.test.ts$',
    '/distributions/weibull/__test__/pweibull.test.ts$',
    '/distributions/weibull/__test__/qweibull.test.ts$',
    '/distributions/weibull/__test__/rweibull.test.ts$',
];

const uniformTest = [
    '/distributions/uniform/__test__/dunif.test.ts$',
    '/distributions/uniform/__test__/punif.test.ts$',
    '/distributions/uniform/__test__/qunif.test.ts$',
    '/distributions/uniform/__test__/runif.test.ts$',
]

const wilcoxTest = [
    'distributions/wilcoxon/__test__/dwilcox.test.ts$',
    '/distributions/wilcoxon/__test__/pwilcox.test.ts$',
    '/distributions/wilcoxon/__test__/qwilcox.test.ts$',
    '/distributions/wilcoxon/__test__/rwilcox.test.ts$'
];


const uniformRNG = [
    '/rng/knuth-taocp/__test__/(.*?\\.)?test.ts$',
    '/rng/knuth-taocp-2002/__test__/(.*?\\.)?test.ts$',
    '/rng/lecuyer-cmrg/__test__/(.*?\\.)?test.ts$',
    '/rng/marsaglia-multicarry/__test__/(.*?\\.)?test.ts$',
    '/rng/mersenne-twister/__test__/(.*?\\.)?test.ts$',
    '/rng/wichmann-hill/__test__/(.*?\\.)?test.ts$',
    '/rng/super-duper/__test__/(.*?\\.)?test.ts$',
    '/rng/__test__/test.ts$'
];

const normalRNG = [
    '/rng/normal/ahrens-dieter/__test__/(.*?\\.)?test.ts$',
    '/rng/normal/box-muller/__test__/(.*?\\.)?test.ts$',
    '/rng/normal/buggy-kinderman-ramage/__test__/(.*?\\.)?test.ts$',
    '/rng/normal/inversion/__test__/(.*?\\.)?test.ts$',
    '/rng/normal/kinderman-ramage/__test__/(.*?\\.)?test.ts$',
];

const specialFunctions = [
    '/special/bessel/besselJ/__test__/(.*?\\.)?test.ts$',
    '/special/gamma/__test__/(.*?\\.)?test.ts$',
    '/special/choose/__test__/(.*?\\.)?test.ts$',
    '/special/beta/__test__/(.*?\\.)?test.ts$'
]

const testRegex = [
   /* ...betaTest,
    ...binomTest,
    ...binonNegativeTest,
    ...cauchyTest,
    ...chisqTest,
    ...expTest,
    ...pfTest,
    ...gammaDistributionTest,
    ...geoMetricTest,
    ...hyperGeometricTest,
    ...logisTest,
    ...lognormalTest,
    ...multinomTest,
    ...normalTest,
    ...poissonTest,
    ...signRankTest,
    ...studentT,
    ...tukeyHSD,
    ...uniformTest,
    ...weibullTest,
    ...wilcoxTest,*/
    //
    ...uniformRNG,
    //...normalRNG,
    //
    //...specialFunctions
];

module.exports = {
    automock: false,
    collectCoverage: true,
    maxWorkers: "1",
    collectCoverageFrom,
    coveragePathIgnorePatterns: ['node_modules', 'test', 'doc.ts'],
    coverageDirectory: 'coverage',
    coverageProvider: 'babel', //"v8" is still experimental, but use "v8" for walk through debugging
   // coverageProvider: 'v8', //"v8" is still experimental, but use "v8" for walk through debugging
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    cacheDirectory: '.jest-cache',
    testPathIgnorePatterns: ['/es6/', '/commonjs/'],
    //testMatch: ['**/__tests__/**/*.[t]s?(x)', '**/?(*.)+(spec|test).[t]s?(x)'],
    testRegex,
 
    moduleNameMapper: {
        '^@dist/(.*)$': '<rootDir>/src/lib/distributions/$1',
        '^@common/(.*)$': [
            '<rootDir>/src/packages/common/$1',
            '<rootDir>/src/lib/common/$1',
            '<rootDir>/src/packages/__test__/$1',
        ],
        '^@special/(.*)$': '<rootDir>/src/lib/special/$1',
        '^@trig/(.*)$': '<rootDir>/src/lib/trigonometry/$1',
        '^@rng/(.*)$': '<rootDir>/src/lib/rng/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1',
        '^lib/(.*)$': '<rootDir>/src/lib/$1'

    },
    setupFiles: ['<rootDir>/src/packages/__test__/jest-ext.d.ts'],
    setupFilesAfterEnv: [
        '<rootDir>/src/packages/__test__/jest-extension.ts',
        '<rootDir>/src/packages/__test__/mock-of-debug.ts'
    ],
};


