module.exports = {
  root: true,

  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  globals: {
    globalThis: false, // means it is not writeable
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  rules: {
    "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }], // off
    "@typescript-eslint/no-var-requires": 0, // off
    "@typescript-eslint/no-loss-of-precision": 0,

    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
};
