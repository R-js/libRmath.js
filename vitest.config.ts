import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        hookTimeout: 90000,
        teardownTimeout: 90000,
        detectOpenHandles: true,
        globals: true,   // ✅ enables describe/it/expect globally
        environment: "node", // or "jsdom" if you’re testing browser code
        include: [
            // 'src/lib/alt/**/__test__/*test.ts',
            // 'src/lib/distributions/beta/__test__/.*.test.ts',
            // 'src/lib/distributions/binomial/__test__/.*.test.ts',
            // 'src/lib/distributions/binomial-negative/__test__/.*.test.ts',
            // 'src/lib/distributions/cauchy/__test__/.*.test.ts',
            // 'src/lib/distributions/chi-2/__test__/.*.test.ts',
            // 'src/lib/distributions/exp/__test__/.*.test.ts',
            // 'src/lib/distributions/f-distro/__test__/.*.test.ts',
            // 'src/lib/distributions/gamma/__test__/.*.test.ts',
            // 'src/lib/distributions/geometric/__test__/.*.test.ts',
            // 'src/lib/distributions/hypergeometric/__test__/.*.test.ts',
            // 'src/lib/distributions/logis/__test__/.*.test.ts',
            // 'src/lib/distributions/lognormal/__test__/.*.test.ts',
            // 'src/lib/distributions/multinom/__test__/.*.test.ts',
            // 'src/lib/distributions/normal/__test__/.*.test.ts',
            // 'src/lib/distributions/poisson/__test__/.*.test.ts',
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
        exclude: [
            'node_modules',
            'test',
            'doc.ts',
            'IRandom.ts',
            'IBesselRC.ts',
            '/esm/',
            '/commonjs/',
            '/types/',
            './dist/'
        ],
        coverage: {
            enabled: false,
            provider: 'v8',
            reporter: ['json', 'lcov', 'text', 'clover'],
            include: [
                'src/lib/alt/**/*.ts',
                'src/lib/distributions/**/*.ts',
                'src/lib/r-func.ts',
                'src/lib/index.ts',
                'src/lib/trigonometry/*.ts',
                'src/lib/stirling/index.ts',
                'src/lib/special/**/*.ts',
                'src/lib/rng/**/*.ts',
                'src/packages/common/logger.ts'
            ],
            exclude: [
                'node_modules',
                'test',
                'doc.ts',
                'IRandom.ts',
                'IBesselRC.ts'
            ]
        },
        maxWorkers: '50%',
        environment: 'node',
        setupFiles: [
            //'src/packages/__test__/jest-ext.d.ts',
             'src/packages/test-helpers/jest-extension.ts'],
        // : ['src/packages/__test__/jest-extension.ts']
    }
});
