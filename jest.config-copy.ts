

export async function config() {
    return {
        verbose: true,
        automock: false,
        collectCoverage: true,
        maxWorkers: "50%",
        moduleFileExtensions: ['js', 'json', 'cjs', 'ts', 'tsx'],
        collectCoverageFrom: [
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
            'src/lib/distributions/logis/*.ts'
            //'src/lib/distributions/poisson/*.ts'*/
        ],
        coveragePathIgnorePatterns: ['node_modules', 'test', 'doc.ts'],
        coverageDirectory: 'coverage',
        coverageProvider: 'babel', //"v8" is still experimental, but use "v8" for walk through debugging
        //coverageProvider: 'v8', //"v8" is still experimental, but use "v8" for walk through debugging
        coverageReporters: ['json', 'lcov', 'text', 'clover'],
        preset: 'ts-jest',
        testEnvironment: 'node',
     
        cacheDirectory: '.jest-cache',
        testPathIgnorePatterns: ['/es6/', '/browser/'],
        //testMatch: ['**/__tests__/**/*.[t]s?(x)', '**/?(*.)+(spec|test).[t]s?(x)'],
        testRegex: [

            // beta
            '/distributions/beta/__test__/dbeta.test.ts$',
            // ok 
            /*   '/distributions/beta/__test__/dnbeta.test.ts$',
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
       
               // F  Fisher–Snedecor distribution
               //ok
               '/distributions/f-distro/__test__/df.test.ts$',
               //ok
               '/distributions/f-distro/__test__/dnf.test.ts$',
               //ok
               '/distributions/f-distro/__test__/pf.test.ts$',
               //ok
               '/distributions/f-distro/__test__/pnf.test.ts$',
               //ok
               '/distributions/f-distro/__test__/qf.test.ts$',
               //ok
               '/distributions/f-distro/__test__/qnf.test.ts$',
               //ok
               '/distributions/f-distro/__test__/rf.test.ts$',
               //ok
               '/distributions/f-distro/__test__/rnf.test.ts$',
              
               // gamma distribution
               //ok
               '/distributions/gamma/__test__/dgamma.test.ts$',
               //ok
               '/distributions/gamma/__test__/pgamma.test.ts$',
               //ok
               '/distributions/gamma/__test__/qgamma.test.ts$',
               //ok
               '/distributions/gamma/__test__/rgamma.test.ts$',
               
       
               //geometric
               //ok
               '/distributions/geometric/__test__/dgeom.test.ts$',
               //ok
               '/distributions/geometric/__test__/pgeom.test.ts$',
               //ok
               '/distributions/geometric/__test__/qgeom.test.ts$',
               //ok
               '/distributions/geometric/__test__/rgeom.test.ts$',
       
               //hypergeometric
               //ok
               '/distributions/hypergeometric/__test__/dhyper.test.ts$',
               //ok
               '/distributions/hypergeometric/__test__/phyper.test.ts$',
               //ok
               '/distributions/hypergeometric/__test__/qhyper.test.ts$',
               
               '/distributions/hypergeometric/__test__/rhyper.test.ts$',
       
              //logis
              '/distributions/logis/__test__/dlogis.test.ts$',
              '/distributions/logis/__test__/plogis.test.ts$',
              '/distributions/logis/__test__/qlogis.test.ts$',
              '/distributions/logis/__test__/rlogis.test.ts$',
       
               // poisson
               //'/distributions/poisson/__test__/dpois.test.ts$',
       
               // 
       
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
                useESM: true ,
                compiler: 'typescript',
                tsconfig: 'tsconfig-jest.json',
                diagnostics: {
                    ignoreCodes: [151001],
                },
            },
        },
        moduleNameMapper: {
            '^@common/(.*?)(\\.(ts|js))?$': [
                '<rootDir>/src/lib/common/$1.ts',
                '<rootDir>/src/packages/common/$1.ts',
                '<rootDir>/src/packages/__test__/$1.ts',
            ],
            '^@lib/(.*?)\\.(ts|js)$': '<rootDir>/src/lib/$1.ts',
            '^@rng/(.*?)(\\.(ts|js))?$': '<rootDir>/src/lib/rng/$1.ts',
            '^@special/(.*?)(\\.(ts|js))?$': '<rootDir>/src/lib/special/$1.ts',
            '^@trig/(.*?)(\\.(ts|js))?$': '<rootDir>/src/lib/trigonometry/$1.ts',
            '^@dist/(.*?)(\\.(ts|js))?$': '<rootDir>/src/lib/distributions/$1.ts',
        },
        // vscode will pick up the definition files of the extension
        setupFiles: ['<rootDir>/src/packages/__test__/jest-ext.d.ts'],
        setupFilesAfterEnv: [
            '<rootDir>/src/packages/__test__/jest-extension.ts',
            '<rootDir>/src/packages/__test__/mock-of-debug.ts'
        ],
        resolver: '<rootDir>/resolver';
    };
}

