/* exslint-disable @typescript-eslint/no-var-requires */
module.exports = {
    automock: false,
    collectCoverage: true,
    collectCoverageFrom: [
        /*'src/lib/distributions/beta/*.ts',
        'src/lib/distributions/binomial/*.ts',
        'src/lib/distributions/binomial-negative/*.ts',
        'src/lib/distributions/cauchy/*.ts',
        'src/lib/distributions/chi-2/*.ts',
        'src/lib/distributions/exp/*.ts',*/
        'src/lib/distributions/f-distro/*.ts'
    ],
    coveragePathIgnorePatterns: ['node_modules', 'test', 'doc.ts'],
    coverageDirectory: 'coverage',
    coverageProvider: 'babel', //"v8" is still experimental
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    cacheDirectory: '.jest-cache',
    testPathIgnorePatterns: ['/es6/', '/commonjs/'],
    //testMatch: ['**/__tests__/**/*.[t]s?(x)', '**/?(*.)+(spec|test).[t]s?(x)'],
    testRegex: [
        // beta
      /*  // ok
        '/distributions/beta/__test__/dbeta.test.ts$',
        // ok 
        '/distributions/beta/__test__/dnbeta.test.ts$',
        // ok 
        '/distributions/beta/__test__/pbeta.test.ts$',
        // ok 
        '/distributions/beta/__test__/pnbeta.test.ts$',
        // ok 
        '/distributions/beta/__test__/qbeta.test.ts$',
        // ok 
        '/distributions/beta/__test__/qnbeta.test.ts$',
        // ok 
        '/distributions/beta/__test__/rbeta.test.ts$',


        // binom
        // ok 
        '/distributions/binomial/__test__/dbinom.test.ts$',
        // ok 
        '/distributions/binomial/__test__/pbinom.test.ts$',
        // ok 
        '/distributions/binomial/__test__/qbinom.test.ts$',
        // ok 
        '/distributions/binomial/__test__/rbinom.test.ts$',

        // binom-negative
        // ok
        '/distributions/binomial-negative/__test__/dnbinom.test.ts$',
        // ok
        '/distributions/binomial-negative/__test__/pnbinom.test.ts$',
        // ok
        '/distributions/binomial-negative/__test__/qnbinom.test.ts$',
        //ok
        '/distributions/binomial-negative/__test__/rnbinom.test.ts$',

        // cauchy
        // ok
        '/distributions/cauchy/__test__/dcauchy.test.ts$',
        // ok
        '/distributions/cauchy/__test__/pcauchy.test.ts$',
        // ok
        '/distributions/cauchy/__test__/qcauchy.test.ts$',
        //ok
        '/distributions/cauchy/__test__/rcauchy.test.ts$',

        //chisq
        //ok
        '/distributions/chi-2/__test__/dchisq.test.ts$',
        //ok
        '/distributions/chi-2/__test__/dnchisq.test.ts$',
        //ok
        '/distributions/chi-2/__test__/pchisq.test.ts$',
        //ok
        '/distributions/chi-2/__test__/pnchisq.test.ts$',
        //ok
        '/distributions/chi-2/__test__/qchisq.test.ts$',
        //ok
        '/distributions/chi-2/__test__/qnchisq.test.ts$',
        //ok
        '/distributions/chi-2/__test__/rchisq.test.ts$',
        //ok
        '/distributions/chi-2/__test__/rnchisq.test.ts$',

        // exponential
        //ok
        '/distributions/exp/__test__/dexp.test.ts$',
        //ok
        '/distributions/exp/__test__/pexp.test.ts$',
        //ok
        '/distributions/exp/__test__/qexp.test.ts$',
        //ok
        '/distributions/exp/__test__/rexp.test.ts$',
*/
        // F  Fisher–Snedecor distribution
        //ok
        '/distributions/f-distro/__test__/df.test.ts$',
        //ok
        '/distributions/f-distro/__test__/dnf.test.ts$',
        //
        '/distributions/f-distro/__test__/pf.test.ts$',

       

        /*'/special/bessel/besselJ/__test__/(.*?\\.)?test.ts$',
        '/special/gamma/__test__/(.*?\\.)?test.ts$',
        '/special/beta/__test__/(.*?\\.)?test.ts$',
        '/rng/knuth-taocp/__test__/(.*?\\.)?test.ts$',
        '/rng/knuth-taocp-2002/__test__/(.*?\\.)?test.ts$',
        '/rng/lecuyer-cmrg/__test__/(.*?\\.)?test.ts$',
        '/rng/marsaglia-multicarry/__test__/(.*?\\.)?test.ts$',*/
        // '/rng/mersenne-twister/__test__/(.*?\\.)?test.ts$',
        /* '/rng/wichmann-hill/__test__/(.*?\\.)?test.ts$',
         '/rng/normal/ahrens-dieter/__test__/(.*?\\.)?test.ts$',
         '/rng/normal/box-muller/__test__/(.*?\\.)?test.ts$',
         '/rng/normal/buggy-kinderman-ramage/__test__/(.*?\\.)?test.ts$',
         '/rng/normal/inversion/__test__/(.*?\\.)?test.ts$',
         '/rng/normal/kinderman-ramage/__test__/(.*?\\.)?test.ts$',
         '/rng/super-duper/__test__/(.*?\\.)?test.ts$',
        
   */

    ],
    globals: {
        'ts-jest': {
            compiler: 'typescript',
            tsconfig: 'tsconfig-jest.json',
            diagnostics: {
                ignoreCodes: [151001],
            },
        },
    },
    moduleNameMapper: {
        '^\\$jest-extension$': '<rootDir>/src/packages/jest-extension.ts',
        '^@distributions/(.*)$': '<rootDir>/src/lib/distributions/$1',
        '^@dist/(.*)$': '<rootDir>/src/lib/distributions/$1',
        '^@common/(.*)$': '<rootDir>/src/packages/common/$1',
        '^\\$constants$': '<rootDir>/src/lib/common/_general.ts',
        '^\\$chebyshev$': '<rootDir>/src/lib/chebyshev',
        '^@special/(.*)$': '<rootDir>/src/lib/special/$1',
        '^@trig/(.*)$': '<rootDir>/src/lib/trigonometry/$1',
        '^\\$toms708$': '<rootDir>/src/lib/common/toms708',
        '^\\$test-helpers/(.*)$': '<rootDir>/src/packages/test-helpers/$1',
        '^\\$deviance$': '<rootDir>/src/lib/deviance/index.ts',
        '^\\$stirling$': '<rootDir>/src/lib/stirling/index.ts',
        '^@rng/(.*)$': '<rootDir>/src/lib/rng/$1',
        '^\\$helper$': '<rootDir>/src/lib/r-func.ts',
        '^\\$mock-of-debug$': '<rootDir>/src/packages/test-helpers/mock-of-debug'
    },
};