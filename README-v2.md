# libRmath.js

This R statistical [`nmath`][librmath.so] re-created in typescript/javascript.

If you were not using a previous version to 2.0.0, you can skip _breaking changes_ and go to:

- [Installation and usage](#installation-and-usage)
- [Table of contents](table-of-contents) 

## BREAKING CHANGES For version 2.0

### Removed

#### RNG (normal and uniform) are only selectable via `RNGkind` function.

The normal and uniform implementation of the various RNG's are not exported publicly anymore
Select normal and uniform RNG's via the function `RNGkind`.

```javascript
// this is NOT possible anymore
import { AhrensDieter } from 'lib-r-math.js';
const ad = new AhrensDieter();
ad.random();

// NEW way of doing things
import { RNGkind } from 'lib-r-math.js';
RNGkind({ normal: "AHRENS_DIETER" }); // R analog to "RNGkind"
rnorm(8); // get 8 samples, if you only want one sample consider rnormOne()  

```

#### helper functions for data mangling

Functions removed from 2.0.0 onwards: `any`, `arrayrify`, `multiplex`, `each`, `flatten`, `c`, `map`, `selector`, `seq`, `summary`.

It is recommended you either use well established js tools like [Rxjs](https://rxjs.dev) or [Ramdajs](https://ramdajs.com) to mangle arrays and data.

#### Removed helper functions for limiting numeric precision

Functions removed from 2.0.0 onwards: `numberPrecision`

This function mimicked the R's `options(digits=N)`.

### Changed

#### helper functions

Functions changed from 2.0.0 onwards: `timeseed`.

`timeseed` is now replaced by a cryptographic safe seed `seed`.

#### Sample distributions return a result of type `Float64Array`.

Functions changed from 2.0.0 onwards:

All these functions will return type of `Float64Array`:
`rbeta`, `rbinom`, `rcauchy`, `rchisq`, `rexp`, `rf`, `rgamma`, `rgeom`, `rhyper`, `rlogis`, `rlnorm`, `rmultinom`, `rnorm`, `rpois`, `rsignrank`, `rt`,`runif`, `rweibull`, `rwilcox`.

For single scalar (number) return values, use the analogs:
`rbetaOne`, `rbinomOne`, `rcauchyOne`, `rchisqOne`, `rexpOne`, `rfOne`, `rgammaOne`, `rgeomOne`, `rhyperOne`, `rlogisOne`, `rlnormOne`, `rnormOne`, `rpoisOne`, `rsignrankOne`, `rtOne`,`runifOne`, `rweibullOne`, `rwilcoxOne`.

Example:

```javascript
import { rbinom, rbinomOne, setSeed } from "lib-r-math.js";

rbinom(0); //
// -> FloatArray(0)

setSeed(123); // set.seed(123) in R
rbinom(2, 8, 0.5);
// -> Float64Array(2) [ 3, 5 ]  //same result as in R

setSeed(456); // set.seed(456) in R
rbinomOne(350, 0.5);
// -> 174  ( a single scalar )
```

### UMD module removed

There is no UMD module from 2.0.0. What module types are available for node and browser is listed [here]().

## Installation and usage

```bash
npm i lib-r-math.js
```

lib-r-math.js supports the following module types:

### ESM for use in [observablehq](www.observablehq.com)

```javascript
library = import("https://cdn/skypack.dev/lib-r-math.js/dist/web.esm.mjs");

library.BesselJ(3, 0.4);
//-> -0.30192051329163955
```

### ESM for use as Browser client

```html
<script type="module">
  import { BesselJ } from "https://unpkg.dev/lib-r-math.js@2.0.0-rc7/dist/web.esm.mjs";

  console.log(BesselJ(3, 0.4));
  //-> -0.30192051329163955
</script>
```

### IIFE for use in Browser client

```html
<script src="https://unpkg.dev/lib-r-math.js@2.0.0-rc7/dist/web.iife.js"></script>
<script>
  const answ = window.R.BesselJ(3, 0.4);
  console.log(answ);
  //-> -0.30192051329163955
</script>
```

### ESM for Node

```javascript

import { BesselJ } from 'lib-r-math.js';

const answ = BesselJ(3, 0.4);
//-> -0.30192051329163955
```

### COMMONJS for node

```javascript
const { BesselJ } = require('lib-r-math.js');

const answ = BesselJ(3, 0.4);
//-> -0.30192051329163955
```

## Table of Contents

- [libRmath.js](#librmathjs)
  - [BREAKING CHANGES For version 2.0](#breaking-changes-for-version-20)
    - [Removed](#removed)
      - [RNG (normal and uniform) are only selectable via `RNGkind` function.](#rng-normal-and-uniform-are-only-selectable-via-rngkind-function)
      - [helper functions for data mangling](#helper-functions-for-data-mangling)
      - [Removed helper functions for limiting numeric precision](#removed-helper-functions-for-limiting-numeric-precision)
    - [Changed](#changed)
      - [helper functions](#helper-functions)
      - [Sample distributions return a result of type `Float64Array`.](#sample-distributions-return-a-result-of-type-float64array)
    - [UMD module removed](#umd-module-removed)
  - [Installation and usage](#installation-and-usage)
    - [ESM for use in observablehq](#esm-for-use-in-observablehq)
    - [ESM for use as Browser client](#esm-for-use-as-browser-client)
    - [IIFE for use in Browser client](#iife-for-use-in-browser-client)
    - [ESM for Node](#esm-for-node)
    - [COMMONJS for node](#commonjs-for-node)
  - [Table of Contents](#table-of-contents)
  - [Auxiliary functions](#auxiliary-functions)
    - [`RNGkind`](#rngkind)
    - [`setSeed`](#setseed)
    - [`randomSeed`](#randomseed)
  - [Distributions](#distributions)
    - [The Beta distribution](#the-beta-distribution)
    - [The Binomial distribution](#the-binomial-distribution)
    - [The Negative Binomial Distribution](#the-negative-binomial-distribution)
    - [The Cauchy Distribution](#the-cauchy-distribution)
    - [The Chi-Squared (non-central) Distribution](#the-chi-squared-non-central-distribution)
    - [The Exponential Distribution](#the-exponential-distribution)
    - [The F Distribution](#the-f-distribution)
    - [The Gamma Distribution](#the-gamma-distribution)
    - [The Geometric Distribution](#the-geometric-distribution)
    - [The Hypergeometric Distribution (Web Assembly accalerated)](#the-hypergeometric-distribution-web-assembly-accalerated)
      - [Web Assembly backend](#web-assembly-backend)
    - [The Logistic Distribution](#the-logistic-distribution)
    - [The Log Normal Distribution](#the-log-normal-distribution)
    - [The Multinomial Distribution](#the-multinomial-distribution)
    - [The Normal Distribution](#the-normal-distribution)
- [END OF OLD DOC](#end-of-old-doc)
    - [Wilcoxon signed rank statistic distribution](#wilcoxon-signed-rank-statistic-distribution)
      - [`dsignrank`](#dsignrank)
      - [`psignrank`](#psignrank)
      - [`qsignrank`](#qsignrank)
      - [`rsignrank`](#rsignrank)
    - [Student T distribution](#student-t-distribution)
      - [`dt`](#dt)
      - [`pt`](#pt)
      - [`qt`](#qt)
      - [`rt`](#rt)
    - [Studentized Range distribution, (_Tukey HSD_)](#studentized-range-distribution-tukey-hsd)
      - [`ptukey`](#ptukey)
      - [`qtukey`](#qtukey)
    - [Weibull distribution](#weibull-distribution)
      - [`dweibull`](#dweibull)
      - [`pweibull`](#pweibull)
      - [`qweibull`](#qweibull)
      - [`rweibull`](#rweibull)
    - [Wilcoxon `rank sum statistic` distribution](#wilcoxon-rank-sum-statistic-distribution)
      - [`dwilcox`](#dwilcox)
      - [`pwilcox`](#pwilcox)
      - [`qwilcox`](#qwilcox)
      - [`rwilcox`](#rwilcox)
  - [Special Functions of Mathematics](#special-functions-of-mathematics)
    - [Bessel functions](#bessel-functions)
      - [`besselJ`](#besselj)
      - [`besselY`](#bessely)
      - [`besselI`](#besseli)
      - [`besselK`](#besselk)
    - [Beta functions](#beta-functions)
      - [`beta`](#beta)
      - [`lbeta`](#lbeta)
    - [Gamma functions](#gamma-functions)
      - [`digamma`](#digamma)
      - [`trigamma`](#trigamma)
      - [`tetragamma`](#tetragamma)
      - [`pentagamma`](#pentagamma)
      - [`psigamma`](#psigamma)
      - [`gammma`](#gammma)
      - [`lgammma`](#lgammma)
    - [Binomial coefficient functions](#binomial-coefficient-functions)
      - [`choose`](#choose)
      - [`lchoose`](#lchoose)

## Auxiliary functions

### `RNGkind`

RNGkind is the analog to R's "RNGkind". This is how you select what RNG (normal and uniform) you use and the samplingKind

Follows closely the R implementation [here](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Random.html)

R console:

```R
> RNGkind()
[1] "Mersenne-Twister" "Ahrens-Dieter"   
[3] "Rejection"   
```

Just like in _R_, calling `RNGkind` with no argument returns the currently active RNG's (uniform and normal) and sample kind (Rounding or Rejection)

Like in _R_, `RNGkind` optionally takes an argument of type `RandomGenSet`, after processing it will return the (adjusted) `RandomGenSet` indicating what RNG's and "kind of sampling" is being used.

Rjs _typescript decl_:

```typescript
function RNGkind (options?: RandomGenSet): RandomGenSet;
```

Arguments:
- `options`: an object of type `RandomGenSet`
  - `options.uniform`: string, specify name of uniform RNG to use.
  - `options.normal`: string, specify nam of normal RNG (shaper) to use
  - `options.sampleKind`: string, specify sample strategy to use

Typescript definition:
```typescript
type RandomGenSet = {
    uniform?: 'KNUTH_TAOCP'| 'KNUTH_TAOCP2002'|'LECUYER_CMRG'| 'MARSAGLIA_MULTICARRY'|'MERSENNE_TWISTER'|'SUPER_DUPER'|'WICHMANN_HILL'
    normal?:'AHRENS_DIETER'|'BOX_MULLER'|'BUGGY_KINDERMAN_RAMAGE'|'KINDERMAN_RAMAGE'|'INVERSION'
    sampleKind?: 'ROUNDING'|'REJECTION'
};
```

The `RNGkind` function is decorated with the following extra properties:

| property             | description                        | example                                                                                |
| -------------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| `RNGkind.uniform`    | list of constants of uniform RNG's | `RNGkind.uniform.MARSAGLIA_MULTICARRY` is equal to the string `"MARSAGLIA_MULTICARRY"` |
| `RNGkind.normal`     | list of constants of normal RNG's  | `RNGkind.normal.KINDERMAN_RAMAGE` is equal to the string `"KINDERMAN_RAMAGE"`          |
| `RNGkind.sampleKind` | list of sampling strategies        | `RNGkind.sampleKind.ROUNDING` is equal to the string `"ROUNDING"`                      |

Example: set uniform RNG to `SUPER_DUPER` and normal RNG to `BOX_MULLER`

```typescript
import { RNGkind } from 'lib-r-math.js'

const uniform = RNGkind.uniform.SUPER_DUPER;
const normal = RNGkind.normal.BOX_MULLER;

RNGkind({ uniform, normal }); //-> "sampleKind" not specified so this will not be changed

RNGkind(); // no arguments, will return the current used RNG's and "sampleKind"
// returns 
//  {
//    uniform: 'SUPER_DUPER',
//    normal: 'BOX_MULLER',
//    sampleKind: 'ROUNDING'  // was not changed from default setting
//  }
```

### `setSeed`

Uses a single value to initialize the internal state of the currently selected uniform RNG.

R console analog: `set.seed`

Rjs _typescript decl_

```typescript
function setSeed(s: number): void;
```

Arguments:
- `s` is coerced to an unsigned 32 bit integer 

### `randomSeed`

R console analog: `.Random.seed`

Rjs _typescript decl_

```typescript
function randomSeed(internalState?: Uint32Array | Int32Array): Uint32Array | Int32Array | never;
```

Arguments:
  - (optional) `internalState`: the value of a previously saved RNG state, the current RNG state will be set to this.
  - return state of the current selected RNG 

Exceptions:
  - If the `internalState` value is not correct for the RNG selected an Error will be thrown.


## Distributions

All distribution functions follow a prefix pattern:

- `d` (like `dbeta`, `dgamma`) are desnisty functions
- `p` (like `pbeta`, `pgamma`) are (cummulative) distribution function
- `q` (like `qbeta`, `qgamma`) are quantile functions
- `r` (like `rbeta/rbetaOne`, `rgamma/rgammaOne`) generates random deviates 

### The Beta distribution

| type                     | function spec                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| density function         | `function dbeta(x: number, shape1: number, shape2: number, ncp?: number, log = false): number`                    |
| distribution function    | `function pbeta(q: number, shape1: number, shape2: number, ncp?: number, lowerTail = true, logP = false): number` |
| quantile function        | `function qbeta(p: number, shape1: number, shape2: number, ncp?: number, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rbeta(n: number, shape1: number, shape2: number, ncp?: number): Float32Array`                           |
| ranom generation         | `function rbetaOne(shape1: number, shape2: number): number`                                                       |

- Arguments:
  - `x, q`: quantile value
  - `p`: probability
  - `n`: number of observations
  - `shape1, shape2`: Shape parameters of the Beta distribution
  - `log, logP`: if `true`, probabilities are given as `log(p)`.
  - `lowerTail`: if `true`, probabilities are `P[X ≤ x]`, otherwise, `P[X > x]`.


Example:

```javascript
import { dbeta } from 'lib-r-math.js';

dbeta(0.5, 2, 2);
// -> 1.5
```

### The Binomial distribution

| type                     | function spec                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| density function         | `function dbinom(x: number, n: number, prob: number, log = false): number`                        |
| distribution function    | `function pbinom(q: number, n: number, prob: number, lowerTail = true, logP = false): number`     |
| quantile function        | `function qbinom(p: number, size: number, prob: number, lower_tail = true, logP = false): number` |
| random generation (bulk) | `function rbinom(n: number, size: number, prob: number): Float64Array`                            |
| ranom generation         | `function rbinomOne(size: number, prob: number): number`                                          |

- Arguments:
  - `x, q`: quantile value
  - `p`: probability
  - `n`: number of observations.
  - `size`: number of trials (zero or more).
  - `prob`: probability of success on each trial.
  - `log, logP`: if `true`, probabilities are given as `log(p)`.
  - `lowerTail`: if `true`, probabilities are `P[X ≤ x]`, otherwise, `P[X > x]`.

Example:

```javascript
import { dbinom } from 'lib-r-math.js';

dbinom(50, 100, 0.5);
// -> 0.07958924
```

### The Negative Binomial Distribution

| type                     | function spec                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| density function         | `function dnbinom(x: number, size: number, prob?: number, mu?: number, log = false): number`                    |
| distribution function    | `function pnbinom(q: number, size: number, prob?: number, mu?: number, lowerTail = true, logP = false): number` |
| quantile function        | `function qnbinom(p: number, size: number, prob?: number, mu?: number, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rnbinom(n: number, size: number, prob?: number, mu?: number): Float64Array`                           |
| ranom generation         | `function rnbinom(size: number, prob?: number, mu?: number): number`                                            |

Arguments:
- `x, q`: quantile value.
- `p`: probability.
- `n`: number of observations.
- `size`: target for number of successful trials, (need not be integer) or dispersion parameter (the shape parameter of the gamma mixing distribution). Must be strictly positive.
- `prob`: probability of success in each trial. `0 < prob <= 1`.
- `mu`: alternative parametrization via mean: see ‘Details’.
- `log, logP`: if `true`, probabilities are given as `log(p)`.
- `lowerTail`: if `true`, probabilities are `P[X ≤ x]`, otherwise, `P[X > x]`.

Details: (from R [doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html))

A negative binomial distribution can also arise as a mixture of Poisson distributions with mean distributed as a gamma distribution (see pgamma) with scale parameter (1 - prob)/prob and shape parameter size. (This definition allows non-integer values of size.)

An **alternative parametrization** (often used in ecology) is by the mean `mu` (see above), and size, the dispersion parameter, where `prob = size/(size+mu)`. The variance is `mu + mu^2/size` in this parametrization.

Example:

R console:

 ```R
 > options(digits=22)
> 126 /  dnbinom(0:8, size  = 2, prob  = 1/2)
[1]   504.0000000000000000000   503.9999999999998863132   672.0000000000000000000  1008.0000000000001136868
[5]  1612.7999999999994997779  2688.0000000000013642421  4607.9999999999972715159  8064.0000000000000000000
[9] 14336.0000000000145519152
```

Equivalent in js (fidelity):

```typescript
import { dnbinom } from 'lib-r-math.js';

console.log(  
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map( x => 126/dnbinom(x , 2, 0.5))
);
// ->
[ 504, 503.9999999999999, 672, 1008.0000000000001, 1612.7999999999988, 2688.0000000000014, 4607.999999999997, 8064, 14336.000000000015 ]
```

### The Cauchy Distribution

| type                     | function spec                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| density function         | `function dcauchy(x: number, location = 0, scale = 1, log = false): number`                    |
| distribution function    | `function pcauchy(x: number, location = 0, scale = 1, lowerTail = true, logP = false): number` |
| quantile function        | `function qcauchy(p: number, location = 0, scale = 1, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rcauchy(n: number, location = 0, scale = 1): Float32Array`                           |
| ranom generation         | `function rcauchyOne(location = 0, scale = 1): number`                                         |

Arguments:
- `x, q`: quantile value.
- `p`: probability.
- `n`: number of observations.
- `location, scale`: location and scale parameters.
- `log, logP`: if `true`, probabilities are given as `log(p)`.
- `lowerTail`: if `true`, probabilities are `P[X ≤ x]`, otherwise, `P[X > x]`.

Examples

R console:
```R
dcauchy(-1:4)
[1] 0.15915494309189534560822 0.31830988618379069121644 0.15915494309189534560822 0.06366197723675813546773
[5] 0.03183098861837906773387 0.01872411095198768526959
```

Equivalent in js (fidelity):
```typescript
import { dcauchy } from 'lib-r-math.js';

console.log(  [-1,0,1,2,3,4].map(x => dcauchy(x))  );
// -> [  0.15915494309189535, 0.3183098861837907, 0.15915494309189535, 0.06366197723675814, 0.03183098861837907, 0.018724110951987685 ]
```

### The Chi-Squared (non-central) Distribution

| type                     | function spec                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| density function         | `function dchisq(x: number, df: number, ncp?: number, log = false ): number`                    |
| distribution function    | `function pchisq(p: number, df: number, ncp?: number, lowerTail = true, logP = false ): number` |
| quantile function        | `function qchisq(p: number, df: number, ncp?: number, lowerTail = true, logP = false ): number` |
| random generation (bulk) | `function rchisq(n: number, df: number, ncp?: number): Float64Array`                            |
| ranom generation         | `function rchisqOne(df: number, ncp?: number): number `                                         |


Arguments:
- `x, q`: quantile.
- `p`: probability.
- `n`: number of observations.
- `df`: degrees of freedom (non-negative, but can be non-integer).
- `ncp`: non-centrality parameter (non-negative).
- `log, logP`: if `true`, probabily p are given as log(p).
- `lowerTail`: if true`TRUE (default), probabilities are P[X \le x]P[X≤x], otherwise, P[X > x]P[X>x].

Examples

R console:
```R
dchisq(1, df = 1:3)
[1] 0.2419707 0.3032653 0.2419707
```

Equivalent in js (fidelity):
```typescript
import { dchisq } from 'lib-r-math.js';

console.log(   [1,2,3].map( df => dchisq(1, df))  );
// -> [ 0.24197072451914337, 0.3032653298563167, 0.24197072451914337 ]
```

### The Exponential Distribution

| type                     | function spec                                                                |
| ------------------------ | ---------------------------------------------------------------------------- |
| density function         | `function dexp(x: number, rate = 1, log = false): number`                    |
| distribution function    | `function pexp(q: number, rate = 1, lowerTail = true, logP = false): number` |
| quantile function        | `function qexp(p: number, rate = 1, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rexp(n: number, rate = 1):Float64Array`                            |
| ranom generation         | `function rexpOne(rate = 1): number `                                        |

Arguments:
- `x, q`: quantile.
- `p`: probabily.
- `n`: number of observations.
- `rate`: the exp rate parameter
- `log, logP`: if `true`, probabilities `p` are given as `log(p)`.
- `lower.tail`: if `true` (default), probabilities are P[ X ≤ x ], otherwise, P[X > x].

Examples

R console:

``R
dexp(1) - exp(-1)
[1] 0
```

Equivalent in js (fidelity):
```typescript
import { dexp } from 'lib-r-math.js';

console.log( dexp(1) - Math.exp(-1)  );
// -> 0
```

### The F Distribution

| type                     | function spec                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| density function         | `function df(x: number, df1: number, df2: number, ncp?: number, log = false): number`                    |
| distribution function    | `function pf(q: number, df1: number, df2: number, ncp?: number, lowerTail = true, logP = false): number` |
| quantile function        | `function qf(p: number, df1: number, df2: number, ncp?: number, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rf(n: number, df1: number, df2: number, ncp?: number): Float64Array`                           |
| ranom generation         | `function rfOne(df1: number, df2: number, ncp?: number): number`                                         |

Arguments:
- `x, q`: quantile.
- `p`: probabily.
- `n`: number of observations.
- `df1, df1`: degrees of freedom. `Infinity` is allowed.
- `ncp`: non-centrality parameter. If omitted the central F is assumed.
- `log, logP`: if `true`, probabilities `p` are given as `log(p)`.
- `lowerTail`: if `true` (default), probabilities are `P[ X ≤ x ]`, otherwise, `P[X > x]`S.

**NOTE: JS has no named arguments for functions, so specify ncp = undefined, if you want to change the `log, logP, lowerTail` away from their defaults

Examples

R console:
```R
## Identity (F <-> Beta <-> incompl.beta):
n1 <- 7 ; n2 <- 12; qF <- c((0:4)/4, 1.5, 2:16)
x <- n2/(n2 + n1*qF)
stopifnot(all.equal(pf(qF, n1, n2, lower.tail=FALSE),
                    pbeta(x, n2/2, n1/2)))
```

Equivalent in js (fidelity):
```typescript
import { pf, pbeta } from "lib-r-math.js";

var qF = [
  0.0, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0,
  11.0, 12.0, 13.0, 14.0, 15.0, 16.0,
];

var n1 = 7;
var n2 = 12;
var xs = qF.map((qf) => n2 / (n2 + n1 * qf));

var betas = xs.map((x) => pbeta(x, n2 / 2, n1 / 2));

var fisher = qF.map((qf) => pf(qf, n1, n2, undefined /*no ncp*/, false));

// array "betas" and "fisher" should be equal

console.log(fisher.map((f,i) => f - betas[i]));
//-> [ 0, 0, 0, 0, 0, ...., 0]
```

### The Gamma Distribution

| type                     | function spec                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| density function         | `function dgamma(x: number, shape: number, rate?: number, scale?: number, log = false): number`                    |
| distribution function    | `function pgamma(q: number, shape: number, rate?: number, scale?: number, lowerTail = true, logP = false): number` |
| quantile function        | `function qgamma(p: number, shape: number, rate?: number, scale?: number, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rgamma(n: number, shape: number, rate?: number, scale?: number): Float64Array`                           |
| ranom generation         | `function rgammaOne(shape: number, rate?: number, scale?: number): number`                                         |


Arguments:
- `x, q`: quantile
- `p`: probability
- `n`: number of observations.
- `rate`: an alternative way to specify the scale.
- `shape, scale`: shape and scale parameters. Must be positive, scale strictly.
- `log, logP`: if `true`, probabilities/densities `p` are returned as `log(p)`.
- `lowerTail`: if `true` (default), probabilities are `P[ X ≤ x]`, otherwise, `P[X > x]`.

Example:

R console:
```R
-log(dgamma(1:4, shape = 1))
[1] 1 2 3 4
```

Equivalent in js (fidelity):
```typescript
import { dgamma } from "lib-r-math.js";

let dg = [1,2,3,4].map( x => Math.log( dgamma(x, 1) ));
// -> [ -1, -2, -3, -4 ]
//
// this is equivalent to to 
// [1,2,3,4].map (x => dgamma(x, 1, undefined, undefined, true) );
```

### The Geometric Distribution

| type                     | function spec                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------- |
| density function         | `function dgeom(x: number, p: number, log = false): number`                        |
| distribution function    | `function qgeom(p: number, prob: number, lowerTail = true, logP = false): number ` |
| quantile function        | `function qgeom(p: number, prob: number, lowerTail = true, logP = false): number`  |
| random generation (bulk) | `function rgeom(n: number, prob: number): Float64Array`                            |
| ranom generation         | `function rgeomOne(p: number): number`                                             |

Arguments:
- `x, q`: quantile
- `p`: probability
- `n`: number of observations.
- `prob`: probability of success in each trial. 0 < prob <= 1.
- `log, logP`: if `true`, probabilities/densities `p` are returned as `log(p)`.
- `lowerTail`: if `true` (default), probabilities are `P[ X ≤ x]`, otherwise, `P[X > x]`.

Example:

R console:
```R
qgeom((1:9)/10, prob = .2)
[1]  0  0  1  2  3  4  5  7 10
```

Equivalent in js (fidelity):
```typescript
import { qgeom } from "lib-r-math.js";

let dg = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  .map((p) => p / 10)
  .map((p) => qgeom(p, 0.2));

console.log(dg);
// -> [ 0, 0, 1,  2, 3, 4, 5, 7, 10 ]
```

### The Hypergeometric Distribution (Web Assembly accalerated)

| type                     | function spec                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| density function         | `function dhyper(x: number, m: number, n: number, k: number, log = false): number`                    |
| distribution function    | `function phyper(q: number, m: number, n: number, k: number, lowerTail = true, logP = false): number` |
| quantile function        | `function qhyper(p: number, m: number, n: number, k: number, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rhyper(nn: number, m: number, n: number, k: number): Float64Array`                          |
| ranom generation         | `function rhyperOne(m: number, n: number, k: number): number`                                         |

Arguments:
- `x, q`: quantile
- `p`: probability
- `m`: the number of white balls in the urn.
- `n`: the number of black balls in the urn.
- `k`: the number of balls drawn from the urn, hence must be in `0,1,…,m+n`.
- `p`: probability, it must be between 0 and 1.
- `nn`: number of observations.
- `log, logP`: if `true`, probabilities/densities `p` are returned as `log(p)`.
- `lowerTail`: if `true` (default), probabilities are `P[ X ≤ x]`, otherwise, `P[X > x]`.

Example:

R console:
```R
m <- 10; n <- 7; k <- 8
x <- 0:(k+1)
rbind(phyper(x, m, n, k), dhyper(x, m, n, k))
     [,1]         [,2]       [,3]     [,4]      [,5]      [,6]      [,7]       [,8]       [,9] [,10]
[1,]    0 0.0004113534 0.01336898 0.117030 0.4193747 0.7821884 0.9635952 0.99814891 1.00000000     1
[2,]    0 0.0004113534 0.01295763 0.103661 0.3023447 0.3628137 0.1814068 0.03455368 0.00185109     0
```

Equivalent in js (fidelity):
```typescript
import { phyper, dhyper } from "lib-r-math.js";
var m = 10;
var n = 7;
var k = 8;
var xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

console.log( ...xs.map( x => phyper(x, m, n, k)));
0 0.000411353352529823 0.01336898395721926 0.11703002879473474 0.4193747429041546 0.7821883998354585 0.9635952283011107 0.9981489099136158 1 1

console.log( ...xs.map( x => dhyper(x, m, n, k)));
0 0.000411353352529823 0.012957630604689437 0.10366104483751548 0.30234471410941993 0.3628136569313041 0.18140682846565206 0.03455368161250514 0.001851090086384205 0 
```

#### Web Assembly backend

Use `useWasmBackendHyperGeom` and `clearBackendHyperGeom` to enable/disable wasm backend.

```typescript
import {  
    useWasmBackendHyperGeom,
    clearBackendHyperGeom,
    //
    qhyper
    } from 'lib-r-math.js'

// the functions "qhyper" will be accelerated (on part with native C for node >=16)
await useWasmBackendHyperGeom();

qhyper(0.5, 2**31-1, 2**31-1, 2**31-1); // 28 sec in wasm big numbers to make it do some work
// -> 1073741806

clearBackendHyperGeom(); // revert to js backend

qhyper(0.5, 2**31-1, 2**31-1, 2**31-1); // this will take 428 sec
// -> 1073741806
```

### The Logistic Distribution

| type                     | function spec                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| density function         | `function dlogis(x: number, location = 0, scale = 1, log = false): number`                    |
| distribution function    | `function plogis(x: number, location = 0, scale = 1, lowerTail = true, logP = false): number` |
| quantile function        | `function qlogis(p: number, location = 0, scale = 1, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rlogis(n: number, location = 0, scale = 1): Float64Array`                           |
| ranom generation         | `function rlogisOne(location = 0, scale = 1): number`                                         |


Arguments:
- `x, q`: quantile
- `p`: probability
- `location, scale`: location and scale parameters.
- `n`: number of observations.
- `log, logP`: if `true`, probabilities/densities `p` are returned as `log(p)`.
- `lowerTail`: if `true` (default), probabilities are `P[ X ≤ x]`, otherwise, `P[X > x]`.

Example:

R console:
```R
> RNGkind()
[1] "Mersenne-Twister" "Inversion"        "Rejection"       
> set.seed(12345)
> var(rlogis(4000, 0, scale = 5)) 
[1] 80.83207
```

Equivalent in js (fidelity):
```typescript
import { setSeed, RNGkind, rlogis } from "lib-r-math.js";

const uniform = RNGkind.uniform.MERSENNE_TWISTER;
const normal = RNGkind.normal.INVERSION;

RNGkind({ uniform, normal });
setSeed(12345);

let samples = rlogis(4000, 0, 5); // get 4000 samples

// calculate sample variance
const N = samples.length;
const µ = samples.reduce((sum, x) => sum + x, 0) / N;
const S = (1 / (N - 1)) * samples.reduce((sum, x) => sum + (x - µ) ** 2, 0); // sample variance

console.log(S);
// -> 80.83207248898108 (fidelity proven)
```

### The Log Normal Distribution

| type                     | function spec                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| density function         | `function dlnorm(x: number, meanlog = 0, sdlog = 1, log = false): number`                    |
| distribution function    | `function plnorm(q: number, meanlog = 0, sdlog = 1, lowerTail = true, logP = false): number` |
| quantile function        | `function qlnorm(p: number, meanlog = 0, sdlog = 1, lowerTail = true, logP = false): number` |
| random generation (bulk) | `function rlnorm(n: number, meanlog = 0, sdlog = 1): Float32Array`                           |
| ranom generation         | `function rlnormOne(meanlog = 0, sdlog = 1): number `                                        |

Arguments:
- `x, q`: quantile
- `p`: probability
- `meanlog, sdlog`: mean and standard deviation of the distribution on the log scale with default values of 0 and 1 respectively.
- `n`: number of observations.
- `log, logP`: if `true`, probabilities/densities `p` are returned as `log(p)`.
- `lowerTail`: if `true` (default), probabilities are `P[ X ≤ x]`, otherwise, `P[X > x]`.

Examples:

R console:
```R
dlnorm(1) == dnorm(0)
[1] TRUE
```

Equivalent in js (fidelity):
```typescript
import { dlnorm, dnorm } from "lib-r-math.js";
console.log(dlnorm(1) === dnorm(0))
// -> true
```

### The Multinomial Distribution

| type                      | function spec                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------- |
| density function          | `function dmultinom(x: Float32Array, prob: Float32Array, log = false): number`      |
| density function (R like) | `function dmultinomLikeR(x: Float32Array, prob: Float32Array, log = false): number` |
| random generation (bulk)  | `function rmultinom(n: number, size: number, prob: Float64Array): Float64Array `    |

Arguments:
- `x`: quantile
- `n`: number of random vectors to draw.
- `size`:
  - integer, say `N`, specifying the total number of objects that are put into `K` boxes in the typical multinomial experiment.
  - `dmultinom` omit's the `size` parameter (used in R version), see "Details" below for motivation.
- `prob`: numeric non-negative array of length `K`, specifying the probability for the `K` classes; is internally normalized to sum 1. Infinite and missing values are not allowed.
- `log`: if `true`, log probabilities are computed.

Motivation for removing `size` argument from `dmultinom`:

The code snippet shows clarification

```R
N <- sum(x)
if (is.null(size)) # if size is the default (null) then assign it the value N (number of ) 
  size <- N
else if (size != N) # if manually set AND not equal to sum(x) throw Error,
  stop("size != sum(x), i.e. one is wrong")
```

Because of the above R code allowing manual setting of `size` in dmultinom is omitted

Example:

R console:
```R
> RNGkind()
[1] "Mersenne-Twister" "Inversion"        "Rejection"  
> set.seed(1234)
> rmultinom(10, size = 12, prob = c(0.1,0.2,0.8))
     [,1] [,2] [,3] [,4] [,5] [,6] [,7] [,8] [,9] [,10]
[1,]    0    1    2    0    1    1    0    0    0     0
[2,]    3    3    2    1    2    2    4    4    1     1
[3,]    9    8    8   11    9    9    8    8   11    11
> 
```

Equivalent in js (fidelity):
```typescript
import { RNGkind, setSeed, rmultinom } from 'lib-r-math.js'

RNGkind({
  uniform: RNGkind.uniform.MERSENNE_TWISTER,
  normal: RNGkind.normal.INVERSION
});

setSeed(1234); // use same seed as in R example

const answer = rmultinom(10, 12, new Float64Array([0.1, 0.2, 0.8]));
// returns a (row-first) matrix as a single Float64Array with size (prob.length x size)

console.log(...answer);
// -> 0 3 9 1 3 8 2 2 8 0 1 11 1 2 9 1 2 9 0 4 8 0 4 8 0 1 11 0 1 11
// first column 0 3 9
// second column 1 3 8  etc etc
```

### The Normal Distribution

| type                     | function spec                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------- |
| density function         | `function dnorm(x: number, mean = 0, sd = 1, log = false): number`                     |
| distribution function    | `function pnorm(q: number, mean = 0, sd = 1, lowerTail = true, logP = false): number` |
| quantile function        | `function qnorm(p: number, mean = 0, sd = 1, lowerTail = true, logP = false): number`  |
| random generation (bulk) | `function rnorm(n: number, mean = 0, sd = 1): Float64Array`                            |
| ranom generation         | `function rnormOne(mean = 0, sd = 1): number`                                          |

Arguments:
- `x, q`: quantile
- `p`: probability
- `mean, sd`: mean and standard deviation.
- `n`: number of observations.
- `log, logP`: if `true`, probabilities/densities `p` are returned as `log(p)`.
- `lowerTail`: if `true` (default), probabilities are `P[ X ≤ x]`, otherwise, `P[X > x]`.

Example:

R console:
```R
dnorm(0) == 1/sqrt(2*pi)
[1] TRUE
dnorm(1) == exp(-1/2)/sqrt(2*pi)
[1] TRUE
dnorm(1) == 1/sqrt(2*pi*exp(1))
[1] TRUE
```

Equivalent in js:
```typescript
import { dnorm } from 'lib-r-math.js';

const { sqrt, exp, PI: pi} = Math;

console.log( dnorm(1) === exp(-1/2)/sqrt(2*pi) );
// -> true
console.log( dnorm(1) === exp(-1/2)/sqrt(2*pi)  );
// -> true
console.log( dnorm(1) === 1/sqrt(2*pi*exp(1)) );
// -> true
```


# END OF OLD DOC



### Wilcoxon signed rank statistic distribution

`dsignrank, psignrank, qsignrank, rsignrank`

Density, distribution function, quantile function and random generation for the distribution of the [Wilcoxon Signed Rank statistic](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/SignRank.html).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  SignRank,
  rng: { MarsagliaMultiCarry },
} = libR;

//helpers
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//PRNG uses default MersenneTwister (just like R)
const defaultSR = SignRank();

//explicit use of PRNG
const mmc = new MarsagliaMultiCarry(4535);
const explicitSR = SignRank(mmc);

const { dsignrank, psignrank, qsignrank, rsignrank } = explicitSR;
```

#### `dsignrank`

The probability mass function of the [Wilcoxon Signed Rank statistic](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/SignRank.html).

_typescript decl_

```typescript
declare function dsignrank(
  x: number | number[],
  n: number,
  aslog: boolean = false
): number | number[];
```

- `x`: quantiles (scalar or array of values the rank W+).
- `n`: total number of observations.
- `asLog`: give probabilities as ln(p). Default is false.

Usage:

```javascript
const libR = require("lib-r-math.js");
const { SignRank } = libR;

//some usefull helpers
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dsignrank, psignrank, qsignrank, rsignrank } = SignRank();

//1
const d1 = dsignrank(seq(0, 5), 9);
precision(d1);
/*[
  0.001953125,
  0.001953125,
  0.001953125,
  0.00390625,
  0.00390625,
  0.005859375 ]*/

//2
const d2 = dsignrank(seq(3, 8), 4);
precision(d2);
//[ 0.125, 0.125, 0.125, 0.125, 0.125, 0.0625 ]

//3
const d3 = dsignrank(seq(15, 20), 11);
precision(d3);
/*[
  0.0107421875,
  0.0122070312,
  0.013671875,
  0.015625,
  0.0170898438,
  0.0190429687 ]*/
```

_Equivalent in R_

```R
#1
> dsignrank(seq(0,5), 9);
[1] 0.001953125 0.001953125 0.001953125 0.003906250 0.003906250 0.005859375

#2
> dsignrank(seq(3,8), 4);
[1] 0.1250 0.1250 0.1250 0.1250 0.1250 0.0625

#3
> dsignrank( seq(15,20) , 11);
[1] 0.01074219 0.01220703 0.01367187 0.01562500 0.01708984 0.01904297
```

#### `psignrank`

The cumulative probability function of the [Wilcoxon Signed Rank statistic](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/SignRank.html).

_typescript decl_

```typescript
declare function psignrank(
  q: number | number[],
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: quantiles (scalar or array of values the rank W+).
- `n`: total number of observations.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { SignRank } = libR;

//some usefull helpers
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dsignrank, psignrank, qsignrank, rsignrank } = SignRank();

//1
const p1 = psignrank(seq(0, 5), 9);
precision(p1);
/*
[ 0.001953125,
  0.00390625,
  0.005859375,
  0.009765625,
  0.013671875,
  0.01953125 ]*/

//2
const p2 = psignrank(seq(3, 8), 4);
precision(p2);
//[ 0.3125, 0.4375, 0.5625, 0.6875, 0.8125, 0.875 ]

//3
const p3 = psignrank(seq(15, 20), 11);
precision(p3);
/*
[ 0.0615234375,
  0.0737304687,
  0.0874023437,
  0.103027344,
  0.120117187,
  0.139160156 ]
*/
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)

#1
psignrank(seq(0,5), 9);
#[1] 0.001953125 0.003906250 0.005859375 0.009765625 0.013671875 0.019531250

#2
psignrank(seq(3,8), 4)
#[1] 0.3125 0.4375 0.5625 0.6875 0.8125 0.8750

#3
psignrank(seq(15, 20), 11);
#[1] 0.06152344 0.07373047 0.08740234 0.10302734 0.12011719 0.13916016
```

#### `qsignrank`

The quantile function of the [Wilcoxon Signed Rank statistic](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/SignRank.html).

_typescript decl_

```typescript
declare function qsignrank(
  p: number | number[],
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `p`: probabilities.
- `n`: total number of observations.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { SignRank } = libR;

const { dsignrank, psignrank, qsignrank, rsignrank } = SignRank();

//1
qsignrank(seq(0, 1, 0.2), 9);
//[ 0, 15, 20, 25, 30, 45 ]

//2
qsignrank(seq(0, 1, 0.2), 4);
//[ 0, 15, 20, 25, 30, 45 ]

//3 there is a bug in R, it gives NaN instead of 66
qsignrank(log(seq(0, 1, 0.2)), 11, false, true);
//[ 66, 43, 36, 30, 23, 0 ]
```

_Equivalent in R_

```R
#1
> qsignrank(seq(0, 1, 0.2), 9)
[1]  0 15 20 25 30 45

#2
> qsignrank(seq(0, 1, 0.2), 4);
[1]  0  3  4  6  7 10

#3 Bug in R, first NaN should be 66.
> qsignrank(log(seq(0, 1, 0.2)), 11, FALSE, TRUE);
[1] NaN  43  36  30  23   0
```

#### `rsignrank`

Generates random deviates for the [Wilcoxon Signed Rank statistic](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/SignRank.html).

_typescript decl_

```typescript
declare function rsignrank(N: number, n: number): number | number[];
```

- `N`: Number of deviates to generate..
- `n`: total number of observations.

Usage:

```javascript
const libR = require("lib-r-math.js");
const { SignRank } = libR;

const mmc = new MarsagliaMultiCarry(0);

const explicitSR = SignRank(mmc);
const { dsignrank, psignrank, qsignrank, rsignrank } = explicitSR;

//1
mmc.init(4569);
rsignrank(5, 9);
//[ 17, 15, 32, 12, 20 ]

//2
rsignrank(5, 25);
//[ 140, 80, 125, 198, 157 ]

//3
rsignrank(5, 4);
//[ 4, 7, 8, 10, 8 ]
```

_Equivalent in R_

```R
RNGkind('Marsaglia-Multicarry');
set.seed(4569)

#1
> rsignrank(5, 9);
[1] 17 15 32 12 20

#2
> rsignrank(5, 25);
[1] 140  80 125 198 157

#3
> rsignrank(5, 4)
[1]  4  7  8 10  8
```

### Student T distribution

`dt, pt, qt, rt`

Density, distribution function, quantile function and random generation for the distribution of the [Student T distribution](https://en.wikipedia.org/wiki/Student's_t-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/TDist.html).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  StudentT,
  rng: { MarsagliaMultiCarry },
  rng: {
    normal: { AhrensDieter },
  },
} = libR;

//*.Uses default argument "Normal()".
//*.Normal itself using default arguments.
const defaultT = StudentT();

//explicit use of PRNG's
const mmc = new MarsagliaMultiCarry(0);
const ad = new AhrensDieter(mmc);

//*create explicit functions
const explicitT = StudentT(ad);

const { dt, pt, qt, rt } = explicitT;
```

#### `dt`

The density function of the of the [Student T distribution](https://en.wikipedia.org/wiki/Student's_t-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/TDist.html).

_typescript decl_

```typescript
declare function dt(
  x: number | number[],
  df: number,
  ncp?: number,
  asLog = false
): number | number[];
```

- `x`: quantiles.(Scalar or array).
- `df`: degrees of freedom.
- `ncp`: non-central parameter.
- `asLog`: return result as ln(p);

Usage:

```javascript
const libR = require("lib-r-math.js");
const { StudentT } = libR;

//usefull helpers
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9);

//init distribution
const { dt, pt, qt, rt } = StudentT();

//some testdata
const x = seq(-2, 2, 0.5);
//[ -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2 ]

//1 , degrees of freedom=4
const d1 = dt(x, 4);
precision(d1);
/*[ 0.0662912607, 0.12288, 0.214662526,
    0.322261869,  0.375,   0.322261869,
    0.214662526,  0.12288, 0.0662912607
]*/

//2 d.freedom=6, ncp=3 ,  asLog=true
const d2 = dt(x, 6, 3, true);
precision(d2);
/*[ -11.3338746, -10.0457558, -8.60952363,
    -7.05283449, -5.46041826, -3.98130184,
    -2.77195465, -1.92218557, -1.4276455 ]
*/

//3 d.freedom=40, ncp=0 (undefined also works), asLog=true
const d3 = dt(x, 40, 0, true);
precision(d3);
/*[ -2.87904657, -2.04704833, -1.43138644,
    -1.05291415, -0.925187883, -1.05291415,
    -1.43138644, -2.04704833,  -2.87904657 ]
*/
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)

x=seq(-2, 2, 0.5);

#1
dt(x, 4);
#[1] 0.06629126 0.12288000 0.21466253 0.32226187 0.37500000 0.32226187 0.21466253
#[8] 0.12288000 0.06629126

#2
dt(x, 6, 3, TRUE);
#[1] -11.333147 -10.045168  -8.608932  -7.052112  -5.460418  -3.981268  -2.771953
#[8]  -1.922185  -1.427645

#3
dt(x, 40, 0, TRUE);
#[1] -2.8790466 -2.0470483 -1.4313864 -1.0529142 -0.9251879 -1.0529142 -1.4313864
#[8] -2.0470483 -2.8790466
```

#### `pt`

The cumulative probability function of the of the [Student T distribution](https://en.wikipedia.org/wiki/Student's_t-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/TDist.html).

_cdecl_

```typescript
declare function pt(
  q: number | number[],
  df: number,
  ncp?: number,
  lowerTail: boolean = true,
  logP = false
): number | number[];
```

- `q`: quantiles, array or scalar.
- `df`: degrees of freedom.
- `ncp`: non central parameter.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { StudentT } = libR;

//usefull helpers
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9);

//init distribution
const { dt, pt, qt, rt } = StudentT();

//some testdata
const x = seq(-2, 2, 0.5);
//[ -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2 ]

//1
const p1 = pt(x, 4);
precision(p1);
/*
[ 0.0580582573, 0.103999986, 0.186950444,
  0.321664726,  0.5,         0.678335274,
  0.813049556,  0.896000014  0.941941743 ]*/

//2
const p2 = pt(x, 6, 3);
precision(p2);
/*[
  0.00000552398055, 0.0000175658822, 0.000065386889,
  0.000282969478,   0.00134989803,   0.00630091821,
  0.0249440265,     0.0757615575,    0.173007342 ]*/

//3
const p3 = pt(x, 40, 0, true, true);
precision(p3);
/*
[ -3.64347931, -2.64883812,   -1.82225529,
  -1.17148473, -0.693147181,  -0.370928141,
  -0.176332425,-0.0733595514, -0.0265094536 ]*/
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)

x=seq(-2, 2, 0.5);

#1
pt(x, 4);
# [1] 0.0580582618 0.1040000000 0.1869504832 0.3216649816 0.5000000000
# [6] 0.6783350184 0.8130495168 0.8960000000 0.9419417382

#2
pt(x, 6, 3, TRUE);
# [1] 0.0000055286975 0.0000175810923 0.0000654462028 0.0002832948346
# [5] 0.0013498980316 0.0063005928526 0.0249439672347 0.0757615423360
# [9] 0.1730073377405

#3
pt(x, 40, 0, TRUE, TRUE)
#[1] -3.6434789672 -2.6488375624 -1.8222543111 -1.1714818403 -0.6931471806
#[6] -0.3709294406 -0.1763326134 -0.0733595937 -0.0265094630
```

#### `qt`

The quantile function of the of the [Student T distribution](https://en.wikipedia.org/wiki/Student's_t-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/TDist.html).

_typescript decl_

```typescript
declare function qt(
  p: number | number[],
  df: number,
  ncp?: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `p`: probabilities, array or scalar.
- `df`: degrees of freedom.
- `ncp`: non central parameter.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { StudentT } = libR;

//usefull helpers
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9);

//create instance of this distribution
const { dt, pt, qt, rt } = StudentT();

const x = seq(-2, 2, 0.5);
//[ -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2 ]

//1
const pp1 = pt(x, 4);
//qt is the inverse of pt
const q1 = qt(pp1, 4);
precision(q1);
//[ -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2 ]

//2
const pp2 = pt(x, 6, 3);
//qt is the inverse of pt
const q2 = qt(pp2, 6, 3);
precision(q2);
//[ -2, -1.5, -1, -0.5, 4.15840085e-162, 0.5, 1, 1.5, 2 ]

//3
const pp3 = pt(x, 40, 0, true, true);
//qt is the inverse of pt
const q3 = qt(pp3, 40, 0, true, true);
precision(q3);
//[ -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2 ]
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)

x=seq(-2, 2, 0.5);

#1
pp1= pt(x, 4);
qt(pp1, 4)
#[1] -2.0 -1.5 -1.0 -0.5  0.0  0.5  1.0  1.5  2.0

#2
pp2=pt(x,6,3)
qt(pp2, 6, 3)
#[1] -2.00000000e+00 -1.50000000e+00 -1.00000000e+00 -5.00000000e-01
#[5]  2.54875259e-17  5.00000000e-01  1.00000000e+00  1.50000000e+00
#[9]  2.00000000e+00

#3
pp3 = pt(x, 40, 0, TRUE, TRUE)
qt(pp3, 40, 0, TRUE, TRUE)
#[1] -2.0 -1.5 -1.0 -0.5  0.0  0.5  1.0  1.5  2.0
```

#### `rt`

Generates deviates for the [Student T distribution](https://en.wikipedia.org/wiki/Student's_t-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/TDist.html).

_typescript decl_

```typescript
declare function rt(n: number, df: number, ncp?: number): number | number[];
```

- `n`: number of random deviates to generate.
- `df`: degrees of freedom.
- `ncp`: non central parameter.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  StudentT,
  rng: { MarsagliaMultiCarry },
  rng: {
    normal: { AhrensDieter },
  },
} = libR;

//some usefull helpers
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//explicit use of PRNG's
const mmc = new MarsagliaMultiCarry(0);
const ad = new AhrensDieter(mmc);

const { dt, pt, qt, rt } = StudentT(ad);

//1
mmc.init(1234);
const r1 = rt(5, 4);
precision(r1);
//[ 0.0231141364, 0.636030741, -0.9389398, 1.89196546, -1.9002538 ]

//2
mmc.init(4345);
const r2 = rt(5, 11, 3);
precision(r2);
//[ 1.45445526, 2.23117165, 5.10909613, 2.80662548, 4.05546509 ]

//3
mmc.init(9876);
const r3 = rt(5, 26, -16);
precision(r3);
//[ -14.666857, -14.4664293, -17.9397007, -17.0650828, -19.7422692 ]
```

_Equivalent in R_

```R
RNGkind("Marsaglia-Multicarry",normal.kind="Ahrens-Dieter")
options(scipen=999)
options(digits=9)

#1.
set.seed(1234);
rt(5, 4);
#[1]  0.0231141364  0.6360307414 -0.9389397997  1.8919654608 -1.9002537980

#2
set.seed(4345);
rt(5, 11, 3);
#[1] 1.45445526 2.23117165 5.10909613 2.80662548 4.05546509

#3
set.seed(9876)
rt(5, 26, -16);
#[1] -14.6668570 -14.4664293 -17.9397007 -17.0650828 -19.7422692
```

### Studentized Range distribution, (_Tukey HSD_)

`ptukey, qtukey`

The Tukey studentized range (1 - α confidence interval) for post hoc analysis when (for example `1 way anova`).
Compare individual means to find rejection of $u_{j} \neq u_{i}$. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Tukey.html) and [wiki](https://en.wikipedia.org/wiki/Studentized_range).

For `1 way anova` having `k` groups containing $n_{i}$ samples and $T_{i}$ group means:

<a href="http://www.codecogs.com/eqnedit.php?latex=$$&space;N&space;=&space;\sum_{i=1}^{i=k}&space;n_{i}&space;\newline&space;T_{i}&space;=&space;\frac{1}{n_{i}}&space;\cdot&space;\sum_{j=1}^{j=k}&space;y_{ij}\newline&space;S^{2}&space;=&space;\frac{1}{(N-k)}&space;\cdot&space;\sum_{i=1}^{i=k}&space;\sum_{j=1}^{j=n_{i}}&space;\left(&space;y_{ij}&space;-&space;T_{i}&space;\right)^{2}&space;\newline&space;v&space;=&space;\frac{N}{k}&space;$$" target="_blank"><img src="http://latex.codecogs.com/svg.latex?$$&space;N&space;=&space;\sum_{i=1}^{i=k}&space;n_{i}&space;\newline&space;T_{i}&space;=&space;\frac{1}{n_{i}}&space;\cdot&space;\sum_{j=1}^{j=k}&space;y_{ij}\newline&space;S^{2}&space;=&space;\frac{1}{(N-k)}&space;\cdot&space;\sum_{i=1}^{i=k}&space;\sum_{j=1}^{j=n_{i}}&space;\left(&space;y_{ij}&space;-&space;T_{i}&space;\right)^{2}&space;\newline&space;v&space;=&space;\frac{N}{k}&space;$$" title="$$ N = \sum_{i=1}^{i=k} n_{i} \newline T_{i} = \frac{1}{n_{i}} \cdot \sum_{j=1}^{j=k} y_{ij}\newline S^{2} = \frac{1}{(N-k)} \cdot \sum_{i=1}^{i=k} \sum_{j=1}^{j=n_{i}} \left( y_{ij} - T_{i} \right)^{2} \newline v = \frac{N}{k} $$" /></a>

Then the (1 - α) confidence interval for each $u_{j} \neq u_{i}$ comparison will be:

$$ \left(T*{i} - T*{j} \right) - q*{\alpha,k,v} \cdot \sqrt{ S^2/k } \lt u*{i} - u*{j} \lt \left(T*{i} - T*{j} \right) + q*{\alpha,k,v} \cdot \sqrt{ S^2/k } $$

With `q(α,k,v)` equal to:

```javascript
qtukey(1 - α, k, N - k);
```

#### `ptukey`

The probability function of the [Tukey Studentized Range](https://en.wikipedia.org/wiki/Studentized_range) aka Tukey HSD. Usefull it to find the p-value of the difference of 2 specific treatment means $T_{i}-T_{j}$. See [R-doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Tukey.html).

_typescript decl_

```typescript
declare function ptukey(
  q: number | number[],
  nmeans: number,
  df: number,
  nranges: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: number of random deviates to generate.
- `nmeans`: sample size for range (same for each group).
- `df`: degrees of freedom of S².
- `nranges`: number of groups whose maximum range is considered.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { Tukey } = libR;

const { abs } = Math;

const { qtukey, ptukey } = Tukey();

const differenceOf2Means = -67.46; //Ti - Tj
const std = 16.69658048823; // = S/sqrt(n) see formula for S²
const df = 20; //degrees of freedom for std
const k = 5; // number of treatments in 1-way anova

const pValue = 1 - ptukey(abs(differenceOf2Means) / std, k, df);

// p value = 0.0657, if  α < p-value (example α = 0.05 ) this difference (Ti = Tj) would not rejected.
```

_R equivalent_

```R
p_value = 1 - ptukey(abs(-67.46)/16.69658048823, 5, 20)
# 0.06574507
```

#### `qtukey`

The quantile function of the [Tukey Studentized Range](https://en.wikipedia.org/wiki/Studentized_range). See [R-doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Tukey.html).

_typescript decl_

```typescript
declare function qtukey(
  p: number | number[],
  nmeans: number,
  df: number,
  nranges: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: probabilities.
- `nmeans`: sample size for range (same for each group).
- `df`: degrees of freedom of S².
- `nranges`: number of groups whose maximum range is considered.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Tukey,
  R: { seq: _seq, numberPrecision },
} = libR;

//some helpers
const prec3 = numberPrecision(3);
const seq = _seq()();

const { ptukey, qtukey } = Tukey();

// Generates partial table for Tukey HSD table table 1-α = 0.95
//df=5
const row1 = seq(2, 10).map((v) => qtukey(0.95, v, 5));
prec3(row1);

//[ 3.64, 4.6, 5.22, 5.67, 6.03, 6.33, 6.58, 6.8, 6.99 ]

//df=6
prec3(seq(2, 10).map((v) => qtukey(0.95, v, 6)));
//[ 3.46, 4.34, 4.9, 5.3, 5.63, 5.9, 6.12, 6.32, 6.49 ]

//df=7
prec3(seq(2, 10).map((v) => qtukey(0.95, v, 7)));
//[ 3.34, 4.16, 4.68, 5.06, 5.36, 5.61, 5.82, 6, 6.16 ]

//df=8
prec3(seq(2, 10).map((v) => qtukey(0.95, v, 8)));
//[ 3.34, 4.16, 4.68, 5.06, 5.36, 5.61, 5.82, 6, 6.16 ]
```

_Equivalent in R_

```R
options(digits=3)

qtukey(p=0.95, nmeans=2:10, df= 5)
#[1] 3.64 4.60 5.22 5.67 6.03 6.33 6.58 6.80 6.99

qtukey(p=0.95, nmeans=2:10, df= 6)
#[1] 3.46 4.34 4.90 5.30 5.63 5.90 6.12 6.32 6.49

qtukey(p=0.95, nmeans=2:10, df= 7)
#[1] 3.34 4.16 4.68 5.06 5.36 5.61 5.82 6.00 6.16

qtukey(p=0.95, nmeans=2:10, df= 8)
#[1] 3.26 4.04 4.53 4.89 5.17 5.40 5.60 5.77 5.92
```

<table>
    <caption>Tukey HSD for 1-α = 0.95</caption>
    <thead>
        <tr colspan="1">
            <th></th>
            <th colspan="9">k = Number of treatments</th>
            <tr>
                <tr>
                    <th>df for Error Term</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                    <th>5</th>
                    <th>6</th>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th>10</th>
                </tr>
    </thead>
    <tbody>
        <tr>
            <td>5</td>
            <td>3.64</td>
            <td>4.60</td>
            <td>5.22</td>
            <td>5.67</td>
            <td>6.03</td>
            <td>6.33</td>
            <td>6.58</td>
            <td>6.80</td>
            <td>6.99</td>
        </tr>
        <tr>
            <td>6</td>
            <td>3.46</td>
            <td>4.34</td>
            <td>4.9</td>
            <td>5.3</td>
            <td>5.63</td>
            <td>5.9</td>
            <td>6.12</td>
            <td>6.32</td>
            <td>6.49</td>
        </tr>
        <tr>
            <td>7</td>
            <td>3.34</td>
            <td>4.16</td>
            <td>4.68</td>
            <td>5.06</td>
            <td>5.36</td>
            <td>5.61</td>
            <td>5.82</td>
            <td>6</td>
            <td>6.16</td>
        </tr>
        <tr>
            <td>8</td>
            <td>3.26</td>
            <td>4.04</td>
            <td>4.53</td>
            <td>4.89</td>
            <td>5.17</td>
            <td>5.4</td>
            <td>5.6</td>
            <td>5.77</td>
            <td>5.92</td>
        </tr>
    </tbody>
</table>

### Weibull distribution

`dweibull, pweibull, qweibull, rweibull`

Density, distribution function, quantile function and random generation for the [Weibull distribution](https://en.wikipedia.org/wiki/Weibull_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Weibull.html).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Weibull,
  rng: { WichmannHill },
} = libR;

const wh = new WichmannHill(1234);
const explicitW = Weibull(wh);

//uses Mersenne-Twister
const defaultW = Weibull();

const { dweibull, pweibull, qweibull, rweibull } = explicitW;
```

#### `dweibull`

The density function of the [Weibull distribution](https://en.wikipedia.org/wiki/Weibull_distribution) with parameters `shape` (λ) and `scale` (k). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Weibull.html).

![dweibull](https://wikimedia.org/api/rest_v1/media/math/render/svg/c977e84ffb071a505f8614469e75829521fe3c3e)

_typescript decl_

```typescript
declare function dweibull(
  x: number | number[],
  shape: number,
  scale: number = 1,
  aslog: boolean = false
): number | number[];
```

- `x`: quantiles (scalar or Array)
- `shape`: shape parameter
- `scale`: scale parameter
- `asLog`: return result p as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Weibull,
  R: { seq: _seq, numberPrecision },
} = libR;

//some usefull helpers
const seq = _seq()();
const precision = numberPrecision(9); // restrict to 9 significant digits

const { dweibull, pweibull, qweibull, rweibull } = Weibull();

const x = seq(0, 10, 2);
const x2 = [...seq(0, 1, 0.2), Infinity];

//1
const d1 = dweibull(x, 1, 2);
precision(d1);
/*[
  0.5,           0.183939721,     0.0676676416,
  0.0248935342,  0.00915781944,   0.0033689735 ]*/

//2
const d2 = dweibull(x, 0.5, 2);
precision(d2);
/*[
  Infinity,    0.57624084,  0.357439558,
  0.263940781, 0.210009077,  0.174326108 ]*/

//3
const d3 = dweibull(x2, 1.5, 9);
precision(d3);
/*[
  0,            0.0247630314,  0.0348087379, 0.0422987464,
  0.0483908235, 0.0535355802,  0 ]*/
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)
x = seq(0, 10, 2);
x2 = c(seq(0, 1, 0.2), Inf);

#1
dweibull(x, 1, 2)
#[1] 0.50000000000 0.18393972059 0.06766764162 0.02489353418 0.00915781944
#[6] 0.0033689735

#2
dweibull(x, 0.5, 2)
#[1]         Inf 0.576240840 0.357439558 0.263940781 0.210009077 0.174326108

#3
dweibull(x2, 1.5, 9);
#[1] 0.0000000000 0.0247630314 0.0348087379 0.0422987464 0.0483908235
#[6] 0.0535355802 0.0000000000
```

#### `pweibull`

The cummulative probability function of the [Weibull distribution](https://en.wikipedia.org/wiki/Weibull_distribution) with parameters `shape` (λ) and `scale` (k). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Weibull.html).

_typescript decl_

```typescript
declare function pweibull(
  q: number,
  shape: number,
  scale: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: quantiles (scalar or Array)
- `shape`: shape parameter
- `scale`: scale parameter
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if `true`, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Weibull,
  R: { seq: _seq, numberPrecision },
} = libR;

//some usefull helpers
const seq = _seq()();
const precision = numberPrecision(9); // restrict to 9 significant digits

const { dweibull, pweibull, qweibull, rweibull } = Weibull();

const x = seq(0, 10, 2);
const x2 = [...seq(0, 1, 0.2), Infinity];

//1
const p1 = pweibull(x, 1, 2);
precision(p1);
/*[ 
  0,            0.632120559,  0.864664717,  0.950212932,
  0.981684361,  0.993262053 ]*/

//2
const p2 = pweibull(x, 0.5, 2);
precision(p2);
/*[ 
    0,              0.632120559,    0.756883266,    0.823078794,
    0.864664717,    0.893122074 ]*/

//3
const p3 = pweibull(x2, 1.5, 9);
precision(p3);
/*[
  0,            0.00330721239,  0.00932595261,  0.0170659576,
  0.0261534621, 0.0363595557,   1             ]*/
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)
x = seq(0, 10, 2);
x2 = c(seq(0, 1, 0.2), Inf);

#1
pweibull(x, 1, 2)
#[1] 0.000000000 0.632120559 0.864664717 0.950212932 0.981684361 0.993262053

#2
pweibull(x, 0.5, 2)
#[1] 0.000000000 0.632120559 0.756883266 0.823078794 0.864664717 0.893122074

#3
pweibull(x2, 1.5, 9)
#[1] 0.00000000000 0.00330721239 0.00932595261 0.01706595756 0.02615346212
#[6] 0.03635955570 1.00000000000
```

#### `qweibull`

The quantile function of the [Weibull distribution](https://en.wikipedia.org/wiki/Weibull_distribution) with parameters `shape` (λ) and `scale` (k). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Weibull.html).

_typescript decl_

```typescript
declare function qweibull(
  p: number | number[],
  shape: number,
  scale: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `p`: probabilities (scalar or Array)
- `shape`: shape parameter
- `scale`: scale parameter
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if `true`, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Weibull,
  R: { seq: _seq, numberPrecision },
} = libR;

//some usefull helpers
const seq = _seq()();
const precision = numberPrecision(9); // restrict to 9 significant digits

const { dweibull, pweibull, qweibull, rweibull } = Weibull();

//some data
const pp = seq(0, 1, 0.2);

//1
const q1 = qweibull(pp, 1, 2);
precision(q1);
//[ 0, 0.446287103, 1.02165125, 1.83258146, 3.21887582, Infinity ]

//2
const q2 = qweibull(pp, 0.5, 2);
precision(q2);
//[ 0, 0.099586089, 0.521885636, 1.67917741, 5.18058079, Infinity ]

const q3 = qweibull(pp, 1.5, 9);
precision(q3);
//[ 0, 3.31104744, 5.75118881, 8.49046297, 12.3601952, Infinity ]
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)
pp = seq(0, 1, 0.2);

#1
qweibull(pp, 1, 2);
#[1] 0.000000000 0.446287103 1.021651248 1.832581464 3.218875825         Inf

#2
qweibull(pp, 0.5, 2);
#[1] 0.000000000 0.099586089 0.521885636 1.679177411 5.180580788         Inf

#3
qweibull(pp, 1.5, 9);
#[1]  0.00000000  3.31104744  5.75118881  8.49046297 12.36019515         Inf
```

#### `rweibull`

Generates random deviates for the [Weibull distribution](https://en.wikipedia.org/wiki/Weibull_distribution) with parameters `shape` (λ) and `scale` (k). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Weibull.html).

_typescript decl_

```typescript
declare function rweibull(
  N: number,
  shape: number,
  scale: number = 1
): number | number[];
```

- `n`: Number of deviates to generate.
- `shape`: shape parameter
- `scale`: scale parameter

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Weibull,
  rng: { WichmannHill },
  R: { numberPrecision },
} = libR;

//some usefull helpers
const precision = numberPrecision(9); // restrict to 9 significant digits

const wh = new WichmannHill(1234);

const { dweibull, pweibull, qweibull, rweibull } = Weibull(wh);

//1
const r1 = rweibull(5, 1, 2);
precision(r1);
//[ 1.76155181, 0.903023096, 0.444343952, 0.290091816, 0.556104098 ]

//2
const r2 = rweibull(5, 0.5, 2);
precision(r2);
//[ 0.271864356, 5.52787221, 0.591076799, 0.801653652, 5.62018481 ]

//3
const r3 = rweibull(5, 1.5, 9);
precision(r3);
//[ 0.0405663748, 12.763942, 4.75492179, 6.86945357, 1.95678715 ]
```

_Equivalent in R_

```R
RNGkind("Wichmann-Hill");
set.seed(1234)

#1
rweibull(5, 1, 2);
#[1] 1.761551811 0.903023096 0.444343952 0.290091816 0.556104098

#2
rweibull(5, 0.5, 2);
#[1] 0.271864356 5.527872211 0.591076799 0.801653652 5.620184814

#3
rweibull(5, 1.5, 9);
#[1]  2.45445219 16.69401443 12.01195335 13.57917051  8.93470820
```

### Wilcoxon `rank sum statistic` distribution

`dwilcox, pwilcox, qwilcox, rwilcox`

The Wilcoxon rank sum test is also known as the [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)

Density, distribution function, quantile function and random generation for the [Wilcoxon rank sum statistic](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Wilcoxon.html).

These functions are members of an object created by the `Wilcoxon` factory method. The factory method needs as optional argument an instance of one of the [uniform PRNG](#uniform-pseudo-random-number-generators) generators.

Note: some small improvements where made to `dwilcox, pwilcox, qwilcox` when porting from R.
Read about it [here]((#what-is-improved-on-r).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Wilcoxon
  rng: { SuperDuper }
} = libR;

//explicit intantiation
const sp = new SuperDuper(1234);
const explicitW = Wilcoxon(sp);

//go with defaults uses MersenneTwister
const defaultW = Wilcoxon();

const { dwilcox, pwilxoc, qwilcox, rwilcox } = defaultW;
```

#### `dwilcox`

The density function of the [Wilcoxon rank sum statistic](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Wilcoxon.html).

_typescript decl_

```typescript
declare function dwilcox(
  x: number | number[],
  m: number,
  n: number,
  asLog: boolean = false
): number | number[];
```

- `x`: quantile(s), scalar or array of values.
- `m`: size of first sample, the convention is to have m ≤ n.
- `n`: size of the second sample, the convention is n ≥ m.
- `asLog`: return value as ln(p)

Note: if `m` ≥ `n` the values are swapped internally.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Wilcoxon,
  R: { seq: _seq, numberPrecision, arrayrify },
} = libR;

//helper functions
const seq = _seq()();
const precision = numberPrecision(9);
const pow = arrayrify(Math.pow); //allow it to accept "R" like vectorized input

//init
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon();

const x = pow(seq(0, 10, 2), 2);
//[ 0, 4, 16, 36, 64, 100 ]

//
const d1 = dwilcox(x, 8, 9);
precision(d1);
/*[
  0.0000411353353,  0.000205676676,  0.0064171123,
  0.0374331551,     0.000904977376,  0
]*/

//2
const d2 = dwilcox(x, 100, 50); // same as dwilcox(x, 50, 100)
precision(d2);
/*[
  4.96804037e-41,  2.48402019e-40,  1.14761733e-38,  8.93104617e-37,
  8.65063507e-35,  9.41332103e-33 
]*/

//3
const d3 = dwilcox(x, 5, 34);
precision(d3);
/*[
  0.00000173684384, 0.00000868421921,  0.000175421228,
  0.00212589686,    0.0114631694,      0.0136238031
]*/
```

_Equivalent in R_

```R

#some data
x = seq(0,10,2)^2;
#[1]   0   4  16  36  64 100

#1
dwilcox(x, 8, 9);
#[1] 4.113534e-05 2.056767e-04 6.417112e-03 3.743316e-02 9.049774e-04
#[6] 0.000000e+00

#2
dwilcox(x, 100, 50);
#[1] 4.968040e-41 2.484020e-40 1.147617e-38 8.931046e-37 8.650635e-35
#[6] 9.413321e-33

#3
dwilcox(x, 5, 34);
#[1] 1.736844e-06 8.684219e-06 1.754212e-04 2.125897e-03 1.146317e-02
#[6] 1.362380e-02
```

#### `pwilcox`

The cumulative probability function of the [Wilcoxon rank sum statistic](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Wilcoxon.html).

_typescript decl_

```typescript
declare function pwilcox(
  q: number | number[],
  m: number,
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: quantile(s), scalar or array of values.
- `m`: size of first sample, the convention is to have m ≤ n.
- `n`: size of the second sample, the convention is n ≥ m.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if `true`, probabilities p are given as ln(p).

Note: if `m` ≥ `n` the values are swapped internally.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Wilcoxon,
  R: { seq: _seq, numberPrecision, arrayrify },
} = libR;

//helper functions
const seq = _seq()();
const precision = numberPrecision(9);
const pow = arrayrify(Math.pow); //allow it to accept "R" like vectorized input

//init
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon();

const q = pow(seq(0, 10, 2), 2);

//1
const p1 = pwilcox(q, 8, 9);
precision(p1);
/*[
  0.0000411353353,  0.000493624023,  0.0296174414,
  0.518716578,      0.99814891,      1 ]*/

//2
const p2 = pwilcox(q, 100, 50); // same as dwilcox(x, 50, 100)
precision(p2);
/*[
  4.96804037e-41,  5.96164844e-40,  4.54575694e-38,
  4.92496746e-36,  6.11410568e-34,  8.1299269e-32 ]*/

//3
const p3 = pwilcox(q, 5, 34);
precision(p3);
/*[
  0.00000173684384,  0.0000208421261,  0.000884053516,
  0.0194092299,      0.200294569,      0.736819526 ]*/
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)
q = seq(0, 10, 2)^2;
#[1]   0   4  16  36  64 100

#1
pwilcox(q, 8, 9)
#[1] 4.113534e-05 4.936240e-04 2.961744e-02 5.187166e-01 9.981489e-01
#[6] 1.000000e+00

#2
pwilcox(q, 100, 50);
#[1] 4.968040e-41 5.961648e-40 4.545757e-38 4.924967e-36 6.114106e-34
#[6] 8.129927e-32

#3
pwilcox(q, 5, 34);
#[1] 1.736844e-06 2.084213e-05 8.840535e-04 1.940923e-02 2.002946e-01
#[6] 7.368195e-01
```

#### `qwilcox`

The quantily function of the [Wilcoxon rank sum statistic](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Wilcoxon.html).

_typescript decl_

```typescript
declare function qwilcox(
  p: number | number[],
  m: number,
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `p`: probabilities, scalar or array of values.
- `m`: size of first sample, the convention is to have m ≤ n.
- `n`: size of the second sample, the convention is n ≥ m.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if `true`, probabilities p are given as ln(p).

Note: if `m` ≥ `n` the values are swapped internally.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Wilcoxon,
  R: { seq: _seq },
} = libR;

//helper functions
const seq = _seq()();

//init
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon();

//probabilities (0, 1)
const p = seq(0, 1, 0.2);
//[ 0, 0.2, 0.4, 0.6, 0.8, 1 ]

//1
const q1 = qwilcox(p, 8, 9);
//[ 0, 27, 33, 39, 45, 72 ]

//2
const q2 = qwilcox(p, 100, 50); // same as dwilcox(x, 50, 100)
//[ 0, 2288, 2436, 2564, 2712, 5000 ]

//3
const q3 = qwilcox(p, 5, 34);
//[ 0, 64, 79, 91, 106, 170 ]
```

_Equivalent in R_

```R
# probabilities
p = seq(0,1,0.2);
#[1] 0.0 0.2 0.4 0.6 0.8 1.0

#1
qwilcox(p, 8, 9);
#[1] 0 27 33 39 45 72

#2
qwilcox(p, 100, 50);
#[1] 0 2288 2436 2564 2712 5000

#3
qwilcox(p, 5, 34);
#[1] 0  64  79  91 106 170
```

#### `rwilcox`

Generates random deviates for of the [Wilcoxon rank sum statistic](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Wilcoxon.html).

_typescript decl_

```typescript
declare function rwilcox(nn: number, m: number, n: number): number | number[];
```

- `nn`: number of deviates to generate.
- `m`: size of first sample, the convention is to have m ≤ n.
- `n`: size of the second sample, the convention is n ≥ m.

Note: if `m` ≥ `n` the values are swapped internally.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Wilcoxon,
  rng: { SuperDuper },
} = libR;

const sd = new SuperDuper(1234);
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon(sd);

sd.init(1234); // you may do this at any time

//1
rwilcox(5, 8, 9);
//[ 48, 27, 60, 20, 43 ]

//2
rwilcox(5, 100, 50);
//[ 2521, 2373, 2266, 2136, 2397 ]

//3
rwilcox(5, 5, 34);
//[ 138, 73, 83, 72, 99 ]
```

_Equivalent in R_

```R
RNGkind("Super-Duper");
set.seed(1234);

#1
rwilcox(5, 8, 9);
#[1] 48 27 60 20 43

#2
rwilcox(5, 100, 50);
#[1] 2521 2373 2266 2136 2397

#3
rwilcox(5, 5, 34);
#[1] 138  73  83  72  99
```

--

## Special Functions of Mathematics

Special functions are particular mathematical functions which have more or less established names and notations due to their importance in mathematical analysis, functional analysis, physics, or other applications.

There is no general formal definition, but the list of mathematical functions contains functions which are commonly accepted as special.

### Bessel functions

`besselJ, besselY, besselI, besselK`

Bessel Functions of integer and fractional order, of first and second kind, J(nu) and Y(nu), and Modified Bessel functions (of first and third kind), I(nu) and K(nu). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Bessel.html).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { besselJ, besselK, besselI, besselY },
} = libR;
```

#### `besselJ`

[Bessel function](https://en.wikipedia.org/wiki/Bessel_function) of first kind. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Bessel.html).

_typescript decl_

```typescript
declare function besselJ(
  x: number | number[],
  nu: number | number[]
): number | number[];
```

- `x`: input value x ≥ 0.
- `nu`: order, (may be fractional!)

_**Note:** if `x` and `nu` are arrays or (scalar/array combinations)
of unequal length then R argument cycling rules apply._

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { besselJ, besselK, besselI, besselY },
  R: { map, numberPrecision, c },
} = libR;

const _9 = numberPrecision(9);

let xJ = c(
  1,
  7.389,
  20.09,
  7.389,
  403.4,
  1097,
  0.3679,
  8103,
  22030,
  0.04979,
  7.389,
  1097
);

let nuJ = c(
  11.02,
  0.1353,
  0.4066,
  54.6,
  63.43,
  73.7,
  -3.669,
  -0.4066,
  -1.221,
  -63.43,
  -54.6,
  -73.7
);

const bJ = _9(besselJ(xJ, nuJ));
/*[
  1.12519947e-11,  0.291974134,     0.174941202,    2.98608934e-42,
  0.0397764164,   -0.0222595064,    -557.732938,    -0.00685960111,
  -0.00352068533, -3.14515803e+187, 1.87402835e+39, -0.00557447564 ]*/
```

_Equivalent in R_

```R
# define data
x = c(1, 7.389, 20.09, 7.389, 403.4, 1097, 0.3679, 8103, 22030, 0.04979, 7.389, 1097);
nu = c(11.02, 0.1353, 0.4066, 54.6, 63.43, 73.7, -3.669, -0.4066, -1.221, -63.43, -54.6, -73.7);

besselJ(x,nu);
# [1]   1.12519947e-11   2.91974134e-01   1.74941202e-01   2.98608934e-42
# [5]   3.97764164e-02  -2.22595064e-02  -5.57732938e+02  -6.85960111e-03
# [9]  -3.52068533e-03 -3.14515803e+187   1.87402835e+39  -5.57447564e-03
```

#### `besselY`

[Bessel function](https://en.wikipedia.org/wiki/Bessel_function) of the second kind. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Bessel.html).

_typescript decl_

```typescript
export function besselY(
  x: number | number[],
  nu: number | number[]
): number | number[];
```

- `x`: input value x ≥ 0.
- `nu`: order, (may be fractional!)

_**Note:** if `x`, `nu`, or `expo` are arrays or (scalar/array combinations)
of unequal length then R argument cycling rules apply._

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { besselJ, besselK, besselI, besselY },
  R: { map, numberPrecision, c },
} = libR;

const _9 = numberPrecision(9);

let xY = c(
  0.1353,
  148.4,
  22030,
  20.09,
  403.4,
  1097,
  0.1353,
  2.718,
  2981,
  1,
  8103,
  22030
);
let nuY = c(
  1.221,
  3.669,
  1.221,
  63.43,
  63.43,
  73.7,
  -1.221,
  -33.12,
  -0.1353,
  -63.43,
  -63.43,
  -73.7
);

const bY = _9(besselY(xY, nuY));
/*[
  -7.91004116,      -0.0327873748,   -0.00537461924,
  -8.53963626e+22,  0.0039810489,     0.00928204725,
  6.05755099,       4.84943314e+30,   0.0118386468,
  1.61596294e+104,  0.00500459988,  -0.000101862107 ]*/
```

_Equivalent in R_

```R
#data
xY = c(0.1353, 148.4, 22030, 20.09, 403.4, 1097, 0.1353, 2.718, 2981, 1, 8103, 22030);
nuY = c(1.221, 3.669,  1.221, 63.43, 63.43,
73.7, -1.221, -33.12, -0.1353, -63.43, -63.43, -73.7);

#1
besselY(xY, nuY);
# [1]  -7.91004116e+00  -3.27873748e-02  -5.37461924e-03  -8.53963626e+22
# [5]   3.98104890e-03   9.28204725e-03   6.05755099e+00   4.84943314e+30
# [9]   1.18386468e-02  1.61596294e+104   5.00459988e-03  -1.01862107e-04
```

#### `besselI`

Modified Bessel functions of first kind. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Bessel.html).

_typescript decl_

```typescript
declare function besselI(
  x: number | number[],
  nu: number | number[],
  expo: boolean | boolean[] = false
): number;
```

- `x`: input value x ≥ 0.
- `nu`: order, (may be fractional!)
- `expo`: if TRUE, the results are scaled in order to avoid overflow `exp(-x)*BesselI(x;nu)`.

_**Note:** if `x`, `nu`, or `expo` are arrays or (scalar/array combinations)
of unequal length then R argument cycling rules apply._

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { besselJ, besselK, besselI, besselY },
  R: { map, numberPrecision, c },
} = libR;

const _9 = numberPrecision(9);

//just to show parameter combinations
let xI = c(
  0.3679,
  1,
  22030,
  0.04979,
  54.6,
  403.4,
  0.04979,
  2981,
  8103,
  0.1353,
  0.3679,
  2.718
);
let nuI = c(
  3.669,
  11.02,
  1.221,
  63.43,
  73.7,
  63.43,
  -0.4066,
  -0.1353,
  -0.4066,
  -73.7,
  -54.6,
  -73.7
);

// besselI doesnt take vactorized input like R counterpart. So we use a map
const bI = _9(besselI(xI, nuI, true));
/*[
  0.0000947216027,  4.31519634e-12,  0.00268776062,     1.48153081e-190,
  1.82886482e-21,   0.000136207159,  2.8416423,         0.00730711526,
  0.00443189452,   -4.48726014e+190, 1.37338633e+110,  -3.10304642e+93 ]*/
```

_Equivalent in R_

```R
xI=c(0.3679, 1, 22030,  0.04979,  54.6,  403.4,
  0.04979,  2981,  8103, 0.1353, 0.3679, 2.718);
nuI=c(3.669, 11.02, 1.221, 63.43, 73.7, 63.43,
  -0.4066, -0.1353, -0.4066, -73.7, -54.6, -73.7);

besselI(xI, nuI, TRUE)
# [1]   9.47216027e-05   4.31519634e-12   2.68776062e-03  1.48153081e-190
# [5]   1.82886482e-21   1.36207159e-04   2.84164230e+00   7.30711526e-03
# [9]   4.43189452e-03 -4.48726014e+190  1.37338633e+110  -3.10304642e+93
```

#### `besselK`

Modified Bessel functions of third kind. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Bessel.html).

_typescript decl_

```typescript
declare function besselK(
  x: number | number[],
  nu: number | number[],
  expo: boolean | boolean[] = false
): number;
```

- `x`: input value x ≥ 0.
- `nu`: order, (may be fractional!)
- `expo`: if TRUE, the results are scaled in order to avoid underflow `exp(x)*BesselK(x;nu)`.

_**Note:** if `x`, `nu`, or `expo` are arrays or (scalar/array combinations)
of unequal length then R argument cycling rules apply._

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { besselJ, besselK, besselI, besselY },
  R: { map, numberPrecision, flatten: c },
} = libR;

const _9 = numberPrecision(9);

let xK = c(
  0.3679,
  2.718,
  403.4,
  1,
  54.6,
  2981,
  0.3679,
  148.4,
  22030,
  0.1353,
  2.718,
  148.4
);

let nuK = c(
  3.669,
  33.12,
  11.02,
  63.43,
  73.7,
  54.6,
  -3.669,
  -3.669,
  -1.221,
  -73.7,
  -73.7,
  -54.6
);

const bK = _9(besselK(xK, nuK, true));
/*[
  1430.97872,     1.10637213e+32,  0.0725008692,    3.13780349e+105,
  2.98065514e+18, 0.0378422686,    1430.97872,      0.107549709,
  0.00844432462,  1.14199333e+191, 1.38285074e+96,  2056.65995 ]
*/
```

_Equivalent in R_

```R
options(digits=9)
xK=c(0.3679,  2.718,  403.4,  1,  54.6,  2981,  0.3679,  148.4,
  22030,  0.1353,  2.718,  148.4 );
nuK= c(3.669, 33.12, 11.02, 63.43, 73.7, 54.6, -3.669, -3.669, -1.221, -73.7, -73.7, -54.6);

#1
besselK(xK, nuK, TRUE);
# [1]  1.43097872e+03  1.10637213e+32  7.25008692e-02 3.13780349e+105
# [5]  2.98065514e+18  3.78422686e-02  1.43097872e+03  1.07549709e-01
# [9]  8.44432462e-03 1.14199333e+191  1.38285074e+96  2.05665995e+03
```

### Beta functions

`beta, lbeta`

The functions `beta` and `lbeta` return the [beta function](https://en.wikipedia.org/wiki/Beta_function) and the natural logarithm of the beta function.
See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Special.html).

#### `beta`

The beta function defined for postive `x` and `y` by:

$$ \mathrm {B}(x,y) = \frac{ \Gamma(x) \cdot \Gamma(y)}{\Gamma(x+y)} $$

_typescript decl_

```typescript
declare function beta(
  a: number | number[],
  b: number | number[]
): number | number[];
```

- `a`: non-negative (scalar or array). See [wiki](https://en.wikipedia.org/wiki/Beta_function)
- `b`: non-negative (scalar or array). See [wiki](https://en.wikipedia.org/wiki/Beta_function)

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { beta, lbeta },
  R: { flatten: c },
} = libR;

//1
const b1 = beta(4, 5);
//0.0035714285714285718

//2
const b2 = beta(c(0.5, 100), c(0.25, 50));
//[ 5.24411510858424, 1.49041211109555e-42 ]
```

_Equivalence in R_

```R
#1
beta(4, 5);
#[1] 0.00357142857

#2
beta(c(0.5, 100), c(0.25, 50));
#[1] 5.24411511e+00 1.49041211e-42
```

#### `lbeta`

The natural logarithm of the [beta function](#beta).

_typescript decl_

```typescript
declare function lbeta(
  a: number | number[],
  b: number | number[]
): number | number[];
```

- `a`: non-negative (scalar or array). See [wiki](https://en.wikipedia.org/wiki/Beta_function)
- `b`: non-negative (scalar or array). See [wiki](https://en.wikipedia.org/wiki/Beta_function)

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { beta, lbeta },
  R: { flatten: c },
} = libR;

//1
const lb1 = lbeta(4, 5);
//-5.634789603169249

//2
const lb2 = lbeta(c(0.5, 100), c(0.25, 50));
//[1.6571065161914822, -96.30952123940715]
```

_Equivalence in R_

```R
#1
lbeta(4, 5);
#[1] -5.6347896

#2
lbeta(c(0.5, 100), c(0.25, 50))
#[1]   1.65710652 -96.30952124
```

### Gamma functions

`digamma, trigamma, pentagamma, tetragamma, psigamma`, `gammma`, `lgamma`.

The functions [gamma](#gamma)and [lgamma](#lgamma) return the gamma function [Γ(x)](https://en.wikipedia.org/wiki/Gamma_function) and the natural logarithm of the absolute value of the gamma function: `ln|[Γ(x)|`.

The functions `digamma`, `trigamma`, `pentagamma`, `tetragamma` and `psigamma`
return repectivily the first, second, third and fourth derivatives and n-th derivatives
of the logarithm of the gamma function ln{ Γ(x) }. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Special.html).

#### `digamma`

The first derivative ψ(x) of the natural logarithm of the [gamma function](#gamma)
Alias for [psigmma](#psigamma) function with the `deriv` argument set to `0`.
Aka `psigamma(x, 0)`.

$$ ψ(x) = \frac{d}{dx} (ln Γ(x) )= \frac{Γ'(x)}{ Γ(x)} $$

_typescript decl_

```typescript
declare function digamma(x: number | number[]): number | number[];
```

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { digamma },
  R: { numberPrecision, seq: _seq, flatten: c },
} = libR;

//some helpers
const seq = _seq()();
const pow = multiplex(Math.pow);
const precision9 = numberPrecision(9); //truncate past 9 digits

//data
const x = c(0, pow(4, seq(1, 10, 2)), Infinity);

//1
const dig1 = precision9(digamma(x));
//[ NaN, 1.25611767, 4.15105024, 6.93098344, 9.70403001, 12.4766473, Infinity ]
```

_Equivalent in R_

```R
#Some data
x = c(0, 4^seq(1, 10, 2), Inf);
#[1]      0      4     64   1024  16384 262144    Inf

#1
digamma(x);
#[1]         NaN  1.25611767  4.15105024  6.93098344  9.70403001 12.47664734
#[7]         Inf
```

#### `trigamma`

The 2nd derivative of `ln Γ(x)`. See [R doc]()

$$ ψ(x)' = \frac{d²}{dx²} (ln Γ(x) )$$

_typescript decl_

```typescript
declare function trigamma(x: number | number[]): number | number[];
```

- `x`: 0 ≤ x ≤ Infinity.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { trigamma },
  R: { numberPrecision, seq: _seq, flatten: c },
} = libR;

//some helpers
const seq = _seq()();
const pow = multiplex(Math.pow);
const precision9 = numberPrecision(9); //truncate past 9 digits

//data
const x = c(0, pow(4, seq(1, 10, 2)), Infinity);

const tri1 = precision9(trigamma(x));
//[ Infinity,, 0.283822956, 0.0157477061, 0.000977039492, 0.0000610370189, 0.00000381470454, 0 ]
```

_Equivalent in R_

```R
# the data
x = c(0, 4^seq(1, 10, 2), Inf );

#1
trigamma(x);
#[1]              Inf 0.28382295573712 0.01574770606434 0.00097703949238
#[5] 0.00006103701893 0.00000381470454 0.00000000000000
```

#### `tetragamma`

The 3rd derivative of `ln Γ(x)`. This function is deprecated in `R`.
`tetragamma(x)` is an alias for `psigamma(x,2)`.

$$ ψ(x)³ = \frac{d²}{dx²} (ln Γ(x) )$$

_typescript decl_

```typescript
declare function tetragamma(x: number | number[]): number | number[];
```

- `x`: 0 ≤ x ≤ Infinity.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { tetragamma },
  R: { numberPrecision, seq: _seq, flatten: c },
} = libR;

//some helpers
const seq = _seq()();
const pow = multiplex(Math.pow);
const precision9 = numberPrecision(9); //truncate past 9 digits

//data
const x = c(0, pow(4, seq(1, 10, 2)), Infinity);

const tetra1 = precision9(tetragamma(x));
/*[ NaN,            -0.0800397322,    -0.000247985122,
   -9.54606094e-7,  -3.72551768e-9,   -1.45519707e-11 ]*/
```

_Equivalent in R_

```R
# the data
x = c(0, 4^seq(1, 10, 2), Inf );

# alias for pentagamma
psigamma(x,2);
#[1]           NaN -8.003973e-02 -2.479851e-04 -9.546061e-07 -3.725518e-09
#[6] -1.455197e-11  0.000000e+00
```

#### `pentagamma`

The 4th derivative of `ln Γ(x)`. This function is deprecated in `R`.
`pentagamma(x)` is an alias for `psigamma(x,3)`.

$$ ψ³(x) = \frac{d⁴}{dx⁴} (ln Γ(x) )$$

_typescript decl_

```typescript
declare function pentagamma(x: number | number[]): number | number[];
```

- `x`: 0 ≤ x ≤ Infinity.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { pentagamma },
  R: { numberPrecision, seq: _seq, flatten: c },
} = libR;

//some helpers
const seq = _seq()();
const pow = multiplex(Math.pow);
const precision9 = numberPrecision(9); //truncate past 9 digits

//data
const x = c(0, pow(4, seq(1, 10, 2)), Infinity);

const penta1 = precision9(pentagamma(x));
/*[
  Infinity,       0.0448653282,   0.00000781007088,
  1.86537541e-9,  4.54788986e-13, 1.11022938e-16
]*/
```

_Equivalent in R_

```R
# the data
x = c(0, 4^seq(1, 10, 2), Inf );

# alias for pentagamma
psigamma(x,3);
[1]          Inf 4.486533e-02 7.810071e-06 1.865375e-09 4.547890e-13
[6] 1.110229e-16 0.000000e+00
```

#### `psigamma`

The nth derivative of `ln Γ(x)`.

$$ ψ(x)^{n} = \frac{d^{n}}{dx^{n}} (ln Γ(x) )$$

_typescript decl_

```typescript
declare function psigamma(
  x: number | number[],
  deriv: number | number[]
): number | number[];
```

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { psigamma },
  R: { numberPrecision, seq: _seq, flatten: c },
} = libR;

//some helpers
const seq = _seq()();
const pow = multiplex(Math.pow);
const precision9 = numberPrecision(9); //truncate past 9 digits

const psi1 = precision9(psigamma(x, 9));
/*[
  NaN,        1.25611767,  4.15105024,  6.93098344,
  9.70403001, 12.4766473,  Infinity 
]*/
```

_Equivalent in R_

```R
# the data
x = c(0, 4^seq(1, 10, 2), Inf );

psigamma(x, 9)
#[1]          Inf 3.910177e-01 2.399680e-12 3.271360e-23 4.740895e-34
#[6] 6.897134e-45 0.000000e+00
```

#### `gammma`

The [gammma function](https://en.wikipedia.org/wiki/Gamma_function) Γ(x). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Special.html).

_typescript decl_

```typescript
declare function gamma(x: number | number[]): number | number[];
```

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { gamma },
  R: { numberPrecision, seq: _seq, flatten: c },
} = libR;

//some helpers
const seq = _seq()();
const precision9 = numberPrecision(9); //truncate past 9 digits

//generate data
const gx = seq(2, 5, 0.5).map((x) => x * x - 9);
//[ -5, -2.75, 0, 3.25, 7, 11.25, 16 ]

const g = precision9(gamma(gx));
//[ NaN, -1.00449798, NaN, 2.54925697, 720, 6552134.14, 1307674370000 ]
```

_Equivalent in R_

```R
gx => seq(2, 5, .5)^2 - 9.125;
#[1] -5.125 -2.875 -0.125  3.125  6.875 11.125 15.875

gamma(gx);
#[1]           NaN -1.004498e+00           NaN  2.549257e+00  7.200000e+02
#[6]  6.552134e+06  1.307674e+12
```

#### `lgammma`

The [logarithmic gammma function](https://en.wikipedia.org/wiki/Gamma_function) Γ(x). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Special.html).

_typescript decl_

```typescript
declare function lgamma(x: number | number[]): number | number[];
```

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { lgamma },
  R: { numberPrecision, seq: _seq, flatten: c },
} = libR;

//some helpers
const seq = _seq()();
const precision9 = numberPrecision(9); //truncate past 9 digits

//generate data
const gx = seq(2, 5, 0.5).map((x) => x * x - 9);
//[ -5, -2.75, 0, 3.25, 7, 11.25, 16 ]

const g = precision9(lgamma(gx));
//[ Infinity,  0.00448789754,  Infinity,  0.935801931,  6.57925121,  15.6953014, 27.8992714 ]
```

_Equivalent in R_

```R
gx = seq(2,5,.5)^2-9;

lgamma(gx);
#[1]          Inf  0.004487898          Inf  0.935801931  6.579251212
#[6] 15.695301377 27.899271384
```

### Binomial coefficient functions

`choose, lchoose`

The functions `choose` and `lchoose` return [binomial coefficients](https://en.wikipedia.org/wiki/Combination) and the logarithms of their absolute values.See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Special.html).

#### `choose`

Returns the binomial coefficient of `n over k` ${n}\choose{k}$.

_typescript decl_

```typescript
declare function choose(
  n: number | number[],
  k: number | number[]
): number | number[];
```

- `n`: scalar or array of numbers
- `k`: scalar or array of numbers

**Note:** if `n` and `k` are unequal sized arrays then R argument cycling rules apply.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { choose },
  R: { seq: _seq, flatten: c },
} = libR;

//1  All coefficeints of the expanded (x+y)⁴.
const coef1 = choose(4, c(0, 1, 2, 3, 4));
//[ 1, 4, 6, 4, 1 ]

//2
const coef2 = choose(4000, 30);
//3.8975671313115776e+75

//3
const coef3 = choose(2000, 998);
//Infinity
```

_Equivalent in R_

```R
#1
choose(4, c(0,1,2,3,4) );
#[1] 1 4 6 4 1

#2
choose(4000,30);
#[1] 3.897567e+75

#3
choose(2000,998);
#[1] Inf
```

#### `lchoose`

Returns the natural logarithm binomial coefficient of `n over k` ${n}\choose{k}$.

_typescript decl_

```typescript
declare function choose(
  n: number | number[],
  k: number | number[]
): number | number[];
```

- `n`: scalar or array of numbers
- `k`: scalar or array of numbers

**Note:** if `n` and `k` are unequal sized arrays then R argument cycling rules apply.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  special: { choose },
  R: { seq: _seq, flatten: c },
} = libR;

//1  All ln's of the coefficeints of the expanded (x+y)⁴.
const lcoef1 = lchoose(4, c(0, 1, 2, 3, 4));
/*[
  0,                  1.3862943611198906,  1.7917594692280552, 
  1.3862943611198906, 0
]*/

//2
const lcoef2 = lchoose(4000, 30);
//174.05423452055285

//3
const lcoef3 = lchoose(2000, 998);
//1382.2639955341506
```

_Equivalent in R_

```R
#1
lchoose(4, c(0,1,2,3,4) );
#[1] 0.000000 1.386294 1.791759 1.386294 0.000000

#2
lchoose(4000,30);
#[1] 174.0542

#3
lchoose(2000,998);
#[1] 1382.264
```

[constributer-convenant]: https://www.contributor-covenant.org/
[code-conduct]: https://www.contributor-covenant.org/version/1/4/code-of-conduct.html
[librmath.so]: https://svn.r-project.org/R/trunk/src/nmath
[wiki-norm]: https://en.wikipedia.org/wiki/Normal_distribution
[r-doc-norm]: http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html
