# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## version 3.0.0 - 2025-08-22

### improved (Jacob Bogers <jkfbogers@gmail.com>)
- moved from jest to vitest, faster!!!
- removed @mangos/debug dependency
- removed @mangos/jxpath development dependency
- logging split into thin log-client (noop if logging turned off) and consuming back-end part
- removed eslint

## version 2.0.2 - 2024-05-7

### fixed (Jacob Bogers <jkfbogers@gmail.com>)

- [ISSUE 192](https://github.com/R-js/libRmath.js/issues/192): esm module `export from` files not appended with `.mjs`

## version 2.0.1 - 2024-05-05

### fixed (Maddison Hellstrom [github](https://github.com/b0o)) 

- [PR 190](https://github.com/R-js/libRmath.js/pull/190)

- `./types`  added to package.json "exports" property

### improved (Jacob Bogers <jkfbogers@gmail.com>)

-   removed `ts-patch`
-   removed `ts-node`
-   removed `prettier`
-   removed `eslint`
-   removed `babel`
-   removed `typescript-eslint`
-   removed `typescript-eslint/parser`
-   updated `typescript` to v4.5.2
-   removed `typescript-eslint-language-service`
-   removed  `typescript-transform-paths/register`




## version 2.0.0 - 2023-03-03

### improved (Jacob Bogers <jkfbogers@gmail.com>)

-   `./scripts/build.mjs`,`./scripts/rollup.build.mjs`, `./.eslintrc.cjs` and `jest.config.cjs` will now be linted using `@babel/eslint-parser`
-   import statements using `assert { type: "json" }` are correctly linted
-   removed unneeded "bundle.generate" step from `scripts/rollup.build.mjs`
-   removed @beta tag from version
-   default bundle builds are minimized

### fixed (Jacob Bogers <jkfbogers@gmail.com>)

-   removed second `_seed` argument from rng `reset` function not going to be used

## version "2.0.0-rc16"

### improved, 20 feb 2023 (Jacob Bogers <jkfbogers@gmail.com>)

-   Buffer.from to convert base64 to binary is replaced with "atob" (so it works in the browser as well)
-   upgrade to @mangos/debug@

### fixed, 20 feb 2023 (Jacob Bogers <jkfbogers@gmail.com>)

-   removed a "console.log" from dgamma.ts
-   fixed language typo in test header pentagamma and trigamma "FP32 arguments should return FP23 results"
-   reference the license file "license" prop

## version "2.0.0-rc15"

### improved, 12 feb 2023 (Jacob Bogers <jkfbogers@gmail.com>)

-   initialisation of wasm is not async anymore
-   cleaned up entries in .gitignore

## version "1.0.88"

### fixed

### PR #41 (Richard D. Morey <richarddmorey@gmail.com>)

-   fix bratio, erfc1, and brcmp1 in toms708 code
-   erfc1 and brcmp1 in toms708 code
-   fixed another sign in incomplete beta function

### improved, 28 feb 2019

-summary function will handle larger arrays (no more large intermediate results);

### removed, 28 feb 2019

-the relX and relX2 properties have been removed from the summary statistics function
