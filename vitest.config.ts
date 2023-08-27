import { defineConfig, configDefaults } from 'vitest/config';
import { join } from 'node:path';

const root = join(__dirname, 'src');

export default defineConfig({
    plugins: [],
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
            'src/lib/distributions/f-distro/__test__/*.test.ts'
        ],
        exclude: [...configDefaults.exclude]
    }
});
