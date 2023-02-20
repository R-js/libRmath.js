## version "2.0.0-rc16"

### improved, 20 feb 2023 (Jacob Bogers <jkfbogers@gmail.com>)
  - Buffer.from to convert base64 to binary is replaced with "atob" (so it works in the browser as well)
  - upgrade to @mangos/debug@
### fixed, 20 feb 2023 (Jacob Bogers <jkfbogers@gmail.com>)
  - removed a "console.log" from dgamma.ts
  - fixed language typo in test header pentagamma and trigamma "FP32 arguments should return FP23 results"
  - reference the license file "license" prop

## version "2.0.0-rc15"

### improved, 12 feb 2023 (Jacob Bogers <jkfbogers@gmail.com>)
  - initialisation of wasm is not async anymore
  - cleaned up entries in .gitignore

## version "1.0.88"
### fixed 
### PR #41 (Richard D. Morey <richarddmorey@gmail.com>)
  - fix bratio, erfc1, and brcmp1 in toms708 code
  - erfc1 and brcmp1 in toms708 code
  - fixed another sign in incomplete beta function

### improved, 28 feb 2019

-summary function will handle larger arrays (no more large intermediate results);

### removed, 28 feb 2019

-the relX and relX2 properties have been removed from the summary statistics function
