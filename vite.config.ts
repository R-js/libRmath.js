import { defineConfig, configDefaults } from 'vitest/config';
import { join } from 'node:path';
import terser from '@rollup/plugin-terser';

const root = join(__dirname, 'src');

export default defineConfig({
    build: {
        //minify: 'terser',
        target: 'esnext',
        lib: {
            // you have to specify the input 2x also in rollupOptions
            entry: join(__dirname, 'index.ts')
        },
        rollupOptions: {
            input: {
                // you have to specify the input 2x also in lib
                index: 'src/index.ts'
            },
            output: [
                {
                    compact: true,
                    minifyInternalExports: true,
                    format: 'es',
                    dir: 'dist/esm',
                    entryFileNames: '[name].mjs',
                    plugins: [terser()]
                }
            ]
        },
        plugins: []
    },
    resolve: {
        alias: [
            { find: /^@common\/logger$/, replacement: join(root, 'packages/common/logger.ts') },
            { find: /^@common\/load$/, replacement: join(root, 'packages/__test__/load.ts') },
            { find: /^@lib\/r-func$/, replacement: join(root, 'lib/r-func.ts') },
            { find: /^@common\/debug-backend$/, replacement: join(root, 'packages/__test__/debug-backend.ts') },
            { find: /^@dist\/(.*)$/, replacement: join(root, 'lib/distributions/$1') },
            { find: /^@lib\/(.*)$/, replacement: join(root, 'lib/$1') },
            { find: /^@special\/(.*)$/, replacement: join(root, 'lib/special/$1') },
            { find: /^@trig\/(.*)$/, replacement: join(root, 'lib/trigonometry/$1') },
            { find: /^@common\/(.*)$/, replacement: join(root, 'lib/common/$1') },
            { find: /^@rng\/(.*)$/, replacement: join(root, 'lib/rng/$1') },

            { find: /^@special\/(.*)$/, replacement: 'lib/special/$1' },
            { find: /^@trig\/(.*)$/, replacement: 'lib/trigonometry/$1' },
            { find: /@dist\/(.*)$/, replacement: 'lib/distributions/$1' }
        ]
    },
    test: {
        // minThreads: ,
        // maxThreads: 1,
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/packages/__test__/jest-ext.d.ts', './src/packages/__test__/jest-extension.ts'],
        include: [
            'src/lib/alt/**/*.test.ts',
            'src/lib/chebyshev/**/*.test.ts',
            'src/lib/distributions/beta/__test__/*.test.ts',
            'src/lib/distributions/binomial/**/*.test.ts',
            'src/lib/distributions/binomial-negative/**/*.test.ts',
            'src/lib/distributions/cauchy/__test__/*.test.ts',
            'src/lib/distributions/chi-2/__test__/*.test.ts',
            'src/lib/distributions/exp/__test__/*.test.ts',
            'src/lib/distributions/f-distro/__test__/*.test.ts',
            'src/lib/distributions/gamma/__test__/*.test.ts',
            'src/lib/distributions/geometric/__test__/*.test.ts',

            'src/lib/distributions/hypergeometric/__test__/*.test.ts',

            'src/lib/distributions/logis/__test__/*.test.ts',
            'src/lib/distributions/lognormal/__test__/*.test.ts',
            'src/lib/distributions/multinom/__test__/*.test.ts',
            'src/lib/distributions/normal/__test__/*.test.ts',
            'src/lib/distributions/poisson/__test__/*.test.ts',
            'src/lib/distributions/signrank/__test__/*.test.ts',
            'src/lib/distributions/student-t/__test__/*.test.ts',
            'src/lib/distributions/tukey/__test__/*.test.ts',
            'src/lib/distributions/uniform/__test__/*.test.ts',
            'src/lib/distributions/weibull/__test__/*.test.ts',
            'src/lib/distributions/wilcoxon/__test__/*.test.ts',
            'src/lib/rng/**/*test.ts',
            'src/lib/special/bessel/**/*test.ts',
            'src/lib/special/beta/**/*test.ts',
            'src/lib/special/choose/**/*test.ts',
            'src/lib/special/gamma/**/*test.ts'
        ],
        exclude: [...configDefaults.exclude]
    }
});
