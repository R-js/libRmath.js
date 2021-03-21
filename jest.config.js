/* exslint-disable @typescript-eslint/no-var-requires */
module.exports = {
    automock: false,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/lib/rng/**/*.ts',
        'src/lib/special/gamma/**/*.ts',
        'src/lib/special/beta/**/*.ts',
        'src/lib/special/bessel/**/*.ts',
        'src/lib/distributions/**/*.ts'

    ],
    coveragePathIgnorePatterns: ['node_modules', 'test', 'doc.ts'],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    cacheDirectory: '.jest-cache',
    testPathIgnorePatterns: ['/es6/', '/commonjs/'],
    //testMatch: ['**/__tests__/**/*.[t]s?(x)', '**/?(*.)+(spec|test).[t]s?(x)'],
    testRegex: [
        '/distributions/binomial/__test__/(.*?\\.)?test.ts$',
        '/distributions/beta/__test__/(.*?\\.)?test.ts$',
        //'/distributions/beta/__test__/qbeta.test.ts',
        '/special/bessel/besselJ/__test__/(.*?\\.)?test.ts$',
        '/special/gamma/__test__/(.*?\\.)?test.ts$',
        '/special/beta/__test__/(.*?\\.)?test.ts$',
        '/rng/knuth-taocp/__test__/(.*?\\.)?test.ts$',
        '/rng/knuth-taocp-2002/__test__/(.*?\\.)?test.ts$',
        '/rng/lecuyer-cmrg/__test__/(.*?\\.)?test.ts$',
        '/rng/marsaglia-multicarry/__test__/(.*?\\.)?test.ts$',
        '/rng/mersenne-twister/__test__/(.*?\\.)?test.ts$',
        '/rng/wichmann-hill/__test__/(.*?\\.)?test.ts$',
        '/rng/normal/ahrens-dieter/__test__/(.*?\\.)?test.ts$',
        '/rng/normal/box-muller/__test__/(.*?\\.)?test.ts$',
        '/rng/normal/buggy-kinderman-ramage/__test__/(.*?\\.)?test.ts$',
        '/rng/normal/inversion/__test__/(.*?\\.)?test.ts$',
        '/rng/normal/kinderman-ramage/__test__/(.*?\\.)?test.ts$',
        '/rng/super-duper/__test__/(.*?\\.)?test.ts$',
       
  
  
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
        '^\\$helper$': '<rootDir>/src/lib/r-func.ts'
    },
};