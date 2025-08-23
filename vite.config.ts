import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: "node",
        include: [
            'src/lib/alt/**/__test__/*test.ts',
            'src/lib/distributions/beta/__test__/*test.ts',
            'src/lib/distributions/binomial/__test__/*test.ts',
            'src/lib/distributions/binomial-negative/__test__/*test.ts',
            'src/lib/distributions/cauchy/__test__/*test.ts',
            'src/lib/distributions/chi-2/__test__/*test.ts',
            'src/lib/distributions/exp/__test__/*test.ts',
            'src/lib/distributions/f-distro/__test__/*test.ts',
            'src/lib/distributions/gamma/__test__/**/*test.ts',
            'src/lib/distributions/geometric/**/__test__/*test.ts',
            'src/lib/distributions/hypergeometric/__test__/dhyper.test.ts',
            'src/lib/distributions/hypergeometric/__test__/phyper.test.ts',
            'src/lib/distributions/hypergeometric/__test__/rhyper.test.ts',
            'src/lib/distributions/hypergeometric/__test__/qhyper.test.ts',
            'src/lib/distributions/logis/**/__test__/*test.ts',
            'src/lib/distributions/lognormal/**/__test__/*test.ts',
            'src/lib/distributions/multinom/**/__test__/*test.ts',
            'src/lib/distributions/normal/**/__test__/*test.ts',
            'src/lib/distributions/poisson/**/__test__/*test.ts',
            'src/lib/distributions/signrank/**/__test__/*test.ts',
            'src/lib/distributions/student-t/**/__test__/*test.ts',
            'src/lib/distributions/tukey/**/__test__/*test.ts',
            'src/lib/distributions/uniform/**/__test__/*test.ts',
            'src/lib/distributions/weibull/**/__test__/*test.ts',
            'src/lib/distributions/wilcoxon/**/__test__/*test.ts',
            'src/lib/rng/__test__/**/*test.ts',
            'src/lib/rng/knuth-taocp/**/__test__/*test.ts',
            'src/lib/rng/knuth-taocp-2002/**/__test__/*test.ts',
            'src/lib/rng/lecuyer-cmrg/**/__test__/*test.ts',
            'src/lib/rng/marsaglia-multicarry/**/__test__/*test.ts',
            'src/lib/rng/mersenne-twister/**/__test__/*test.ts',
            'src/lib/rng/normal/**/__test__/*test.ts',
            'src/lib/rng/super-duper/**/__test__/*test.ts',
            'src/lib/rng/wichman-hill/**/__test__/*test.ts',
            'src/lib/special/bessel/**/__test__/*test.ts',
            'src/lib/special/beta/**/__test__/*test.ts',
            'src/lib/special/choose/**/__test__/*test.ts',
            'src/lib/special/gamma/**/__test__/*test.ts'
        ],
        coverage: {
            enabled: true,
            provider: 'v8',
            reporter: ['json', 'lcov', 'text', 'clover'],
            include: [
                'src/lib/alt/**/*.ts',
                'src/lib/chebyshev/**/*.ts',
                'src/lib/common/**/*.ts',
                'src/lib/deviance/**/*.ts',
                'src/lib/distributions/**/*.ts',
                'src/lib/rng/**/*.ts',
                'src/lib/special/**/*.ts',
                'src/lib/stirling/**/*.ts',
                'src/lib/trigonometry/**/*.ts',
                'src/lib/r-func.ts',
                'logger.ts',
            ],
            exclude: [
                // anything in a local test directory including helpers
                'src/lib/**/__test__/*.ts',
                '**/rng-types.ts',
                '**/sample-kind-type.ts',
                'src/lib/rng/IRandom.ts',
                'src/lib/special/bessel/IBesselRC.ts',
                'src/lib/index.ts' // the bootstrap
            ]
        },
        maxWorkers: '50%',
        setupFiles: ['src/packages/test-helpers/jest-extension.ts'],
    }
});
