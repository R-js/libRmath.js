module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': ["error", { "ignoreRestArgs": true }],
        '@typescript-eslint/explicit-module-boundary-types': "error",
        '@typescript-eslint/no-namespace': ["error", { allowDeclarations:true}], // off
        '@typescript-eslint/no-var-requires': 0, // off

        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    }
};