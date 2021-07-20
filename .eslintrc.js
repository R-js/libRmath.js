module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module'
    },
    env: {
        es6: true,
        browser: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    rules: {
        'no-constant-condition': ["error", { "checkLoops": false }]
    },
    overrides: [
        {
            files: ['**/*.ts'],
            'env': { browser: true, es6: true, node: true },
            'extends': [
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:@typescript-eslint/recommended',
            ],
            globals: {
                'Atomics': 'readonly',
                'SharedArrayBuffer': 'readonly',
            },
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
                sourceType: 'module', // Allows for the use of imports
                project: './tsconfig.json'
            },
            plugins: ['@typescript-eslint'],
            rules: {
                '@typescript-eslint/no-explicit-any': ["error", { "ignoreRestArgs": true }],
                '@typescript-eslint/explicit-module-boundary-types': "error",
                '@typescript-eslint/no-namespace': ["error", { allowDeclarations: true }], // off
                '@typescript-eslint/no-var-requires': 0, // off
               
                // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
                // e.g. "@typescript-eslint/explicit-function-return-type": "off",
            }
        }
    ]
};
