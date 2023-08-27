import { defineConfig, configDefaults } from 'vitest/config';
import { join } from 'node:path';

const root = join(__dirname, 'src');

export default defineConfig({
    plugins: [],
    resolve: {
        alias: [
            { find: /^@common\/logger$/, replacement: join(root, 'packages/common/logger.ts') },
            { find: /@lib\/r-func$/, replacement: join(root, 'lib/r-func') },
            { find: /^@common\/(.*)$/, replacement: 'packages/__test__/$1' },
            { find: /^@lib\/(.*)$/, replacement: 'lib/$1' },
            { find: /^@rng\/(.*)$/, replacement: 'lib/rng/$1' },
            { find: /^@special\/(.*)$/, replacement: 'lib/special/$1' },
            { find: /^@trig\/(.*)$/, replacement: 'lib/trigonometry/$1' },
            { find: /@dist\/(.*)$/, replacement: 'lib/distributions/$1' }
        ]
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/packages/__test__/jest-ext.d.ts', './src/packages/__test__/jest-extension.ts'],
        include: ['src/lib/alt/hypot/__test__/test.ts'],
        exclude: [...configDefaults.exclude]
    }
});
