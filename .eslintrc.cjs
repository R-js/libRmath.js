const tsFilePattern = "**/*.ts";
module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  /* defaults */
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2020,
    requireConfigFile: false,
    sourceType: "module",
    extraFileExtensions: [".mjs", ".cjs"],
    babelOptions: {
      parserOpts: {
        plugins: ["importAssertions"],
      },
    },
  },

  overrides: [
    {
      files: [tsFilePattern],
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
      rules: {
        "@typescript-eslint/no-explicit-any": [
          "error",
          { ignoreRestArgs: true },
        ],
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-namespace": [
          "error",
          { allowDeclarations: true },
        ],
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/no-loss-of-precision": 0,
      },
    },
  ],
};
