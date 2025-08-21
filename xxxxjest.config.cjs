const testRegex = [
    'src/lib/alt/(.*)/__test__/test.ts',
    'src/lib/distributions/beta/__test__/.*.test.ts',
    'src/lib/distributions/binomial/__test__/.*.test.ts',
    'src/lib/distributions/binomial-negative/__test__/.*.test.ts',
    'src/lib/distributions/cauchy/__test__/.*.test.ts',
    'src/lib/distributions/chi-2/__test__/.*.test.ts',
    'src/lib/distributions/exp/__test__/.*.test.ts',
    'src/lib/distributions/f-distro/__test__/.*.test.ts',
    'src/lib/distributions/gamma/__test__/.*.test.ts',
    'src/lib/distributions/geometric/__test__/.*.test.ts',
    'src/lib/distributions/hypergeometric/__test__/.*.test.ts',
    'src/lib/distributions/logis/__test__/.*.test.ts',
    'src/lib/distributions/lognormal/__test__/.*.test.ts',
    'src/lib/distributions/multinom/__test__/.*.test.ts',
    'src/lib/distributions/normal/__test__/.*.test.ts',
    'src/lib/distributions/poisson/__test__/.*.test.ts',
    'src/lib/distributions/signrank/__test__/.*.test.ts',
    'src/lib/distributions/student-t/__test__/.*.test.ts',
    'src/lib/distributions/tukey/__test__/.*.test.ts',
    'src/lib/distributions/uniform/__test__/.*.test.ts',
    'src/lib/distributions/weibull/__test__/.*.test.ts',
     'src/lib/distributions/wilcoxon/__test__/.*.test.ts',
    'src/lib/rng/__test__/test.ts',
    'src/lib/rng/knuth-taocp/__test__/test.ts',
    'src/lib/rng/knuth-taocp-2002/__test__/test.ts',
    'src/lib/rng/lecuyer-cmrg/__test__/test.ts',
    'src/lib/rng/marsaglia-multicarry/__test__/test.ts',
    'src/lib/rng/mersenne-twister/__test__/test.ts',
    'src/lib/rng/normal/(.*)/__test__/test.ts',
    'src/lib/rng/super-duper/__test__/test.ts',
    'src/lib/rng/wichman-hill/__test__/test.ts',
    'src/lib/special/bessel/(.*)/__test__/test.ts',
    'src/lib/special/beta/__test__/.*.test.ts',
    'src/lib/special/choose/__test__/.*.test.ts',
    'src/lib/special/gamma/__test__/.*.test.ts'
];

const collectCoverageFrom = [
    'src/lib/alt/**/*.ts',
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

module.exports = {
    bail: true,
    automock: false,
    collectCoverage: true,
    maxWorkers: '50%',
    collectCoverageFrom,
    coveragePathIgnorePatterns: ['node_modules', 'test', 'doc.ts', 'IRandom.ts', 'IBesselRC.ts'],
    coverageDirectory: 'coverage',
    coverageProvider: 'babel', //"v8" is still experimental, but use "v8" for walk through debugging
    //coverageProvider: 'v8', //"v8" is still experimental, but use "v8" for walk through debugging
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    cacheDirectory: '.jest-cache',
    testPathIgnorePatterns: ['/esm/', '/commonjs/', '/types/'],
    //testMatch: ['**/__tests__/**/*.[t]s?(x)', '**/?(*.)+(spec|test).[t]s?(x)'],
    testRegex,
    transform: {
        '\\.test\\.ts$': [
            'ts-jest',
            {
                compiler: 'typescript',
                tsconfig: 'tsconfig.json',
                diagnostics: {
                    ignoreCodes: [151001]
                }
            }
        ]
    },
    moduleNameMapper: {
        '^@dist/(.*)$': '<rootDir>/src/lib/distributions/$1',
        '^@common/(.*)$': [
            '<rootDir>/src/packages/common/$1',
            '<rootDir>/src/lib/common/$1',
            '<rootDir>/src/packages/__test__/$1'
        ],
        '^@special/(.*)$': '<rootDir>/src/lib/special/$1',
        '^@trig/(.*)$': '<rootDir>/src/lib/trigonometry/$1',
        '^@rng/(.*)$': '<rootDir>/src/lib/rng/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1'
    },
    setupFiles: ['<rootDir>/src/packages/__test__/jest-ext.d.ts'],
    setupFilesAfterEnv: [
        '<rootDir>/src/packages/__test__/jest-extension.ts'
    ]
};
