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
- [END OF OLD DOC](#end-of-old-doc)
      - [`qunif`](#qunif)
      - [`runif`](#runif)
    - [Normal distribution](#normal-distribution)
      - [`dnorm`](#dnorm)
      - [`pnorm`](#pnorm)
      - [`qnorm`](#qnorm)
      - [`rnorm`](#rnorm)
  - [Other Probability Distributions](#other-probability-distributions)
      - [summary](#summary)
    - [Hypergeometric distribution](#hypergeometric-distribution)
      - [`dhyper`](#dhyper)
      - [`phyper`](#phyper)
      - [`qhyper`](#qhyper)
      - [`rhyper`](#rhyper)
    - [Logistic distribution](#logistic-distribution)
      - [`dlogis`](#dlogis)
      - [`plogis`](#plogis)
      - [`qlogis`](#qlogis)
      - [`rlogis`](#rlogis)
    - [Log Normal distribution](#log-normal-distribution)
      - [`dlnorm`](#dlnorm)
      - [`plnorm`](#plnorm)
      - [`qlnorm`](#qlnorm)
      - [`rlnorm`](#rlnorm)
    - [Multinomial distribution](#multinomial-distribution)
      - [`dmultinom`](#dmultinom)
      - [`rmultinom`](#rmultinom)
    - [Poisson distribution](#poisson-distribution)
      - [`dpois`](#dpois)
      - [ppois](#ppois)
      - [`qpois`](#qpois)
      - [`rpois`](#rpois)
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
- [Changelog](#changelog)
  - [\[Unreleased\]](#unreleased)
    - [Changed](#changed-1)
    - [Changed](#changed-2)
    - [Removed](#removed-1)

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

## The Cauchy Distribution

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

## The Chi-Squared (non-central) Distribution

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

## The Exponential Distribution

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

## The F Distribution

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

## The Gamma Distribution

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

## The Geometric Distribution

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

# END OF OLD DOC

#### `qunif`

The quantile function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/uniform.html)

_typescript decl_

```typescript
declare function qunif(
  p: number | number[],
  min = 0,
  max = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

- `p`: scalar or vector of quantiles
- `min, max` lower and upper limits of the distribution. Must be finite.
- `lowerTail` if `true` (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP` if `true`, probabilities p are given as ln(p).

Example:

```javascript
const libR = require("lib-r-math.js");
const {
  Uniform,
  R: { numberPrecision, multiplex },
} = libR;

//helper
const precision = numberPrecision(9);

const { runif, dunif, punif, qunif } = Uniform();

const p = [0, 0.1, 0.5, 0.9, 1];

const q1 = qunif(0);
//0

const q2 = qunif(p, -1, 1, false);
//[ 1, 0.8, 0, -0.8, -1 ]

const log = multiplex(Math.log);

const q3 = qunif(log(p), -1, 1, false, true);
//[ 1, 0.8, 0, -0.8, -1 ]
```

#### `runif`

Generates random deviates. See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Uniform.html)

_typescript decl_

```typescript
declare function runif(
  n: number = 1,
  min: number = 0,
  max: number = 1
): number | number[];
```

- `n`: number of deviates. Defaults to 1.
- `min, max` lower and upper limits of the distribution. Must be finite.

Example:

```javascript
const libR = require("lib-r-math.js");

const {
  Uniform,
  rng: { LecuyerCMRG },
  R: { numberPrecision },
} = libR;

//helper
const _9 = numberPrecision(9);

//explicit PRNG choice, seed = 1234
const lm = new LecuyerCMRG(1234);

const { runif, dunif, punif, qunif } = Uniform(lm);

const r1 = _9(runif(4));
//[ 0.472909817, 0.76978367, 0.216015397, 0.413843973 ]

const r2 = _9(runif(5, -1, 1, true));
//[ 0.122007235, 0.86544455, 0.0295475019, -0.184492403, 0.645749715 ]
```

_Equivalent in R_

```R
RNGkind("L'Ecuyer-CMRG");
set.seed(1234);

#1
runif(4);
#[1] 0.4729098 0.7697837 0.2160154 0.4138440

runif(5,-1,1);
#[1]  0.1220072  0.8654446  0.0295475 -0.1844924  0.6457497
```

### Normal distribution

`dnorm, qnorm, pnorm, rnorm`

Density, distribution function, quantile function and random generation for the normal distribution with mean equal to `mean` and standard deviation equal to `sd`. See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html).
These functions are created with the factory method `Normal` taking as optional argument a _normal PRNG_ (defaults to [Inversion](#inversion).

Usage:

```javascript
import "lib-r-math.js";

//specify explicit PRNG's
const norm1 = Normal(new rng.AhrensDieter(new rng.SuperDuper(1234)));

//OR just go with defaults: "Inversion" and "Mersenne-Twister".
const norm2 = Normal(); //

//strip and use
const { rnorm, dnorm, pnorm, qnorm } = norm2;
```

#### `dnorm`

The density function of the [Normal distribution][wiki-norm]. See [R manual][r-manual-norm].

_typescript decl_

```typescript
declare function dnorm(x: number, mu = 0, sd = 1, log = false): number;
```

- `x`:scalar or array of quantiles
- `mu`: mean, default `0`.
- `sd`: standard deviation, default `1`.
- `log`: give result as ln(..) value, default `false`

<details>
  <summary><b>Example:</b> (click to show)</summary>

```typescript
//node:
const libR = import 'lib-r-math.js'
//browser: after importing with the <script>
window.libR

const { c, numberPrecision, seq0, chain, Rcycle } = libR.utils

const { rnorm, dnorm, pnorm, qnorm } = libR.Normal();

// Optional: functional composition, make dnorm follow R cycling rules with precision 9
const Dnorm = chain(numberPrecision(9), dnorm)

const d1 = Dnorm(0)
//→  [ 0.39894228 ]

const d2 = Rdnorm(3, 4, 2)
//→  [ 0.176032663 ]

const d3 = Dnorm(-10)
//→  [7.69459863e-23]

//feed it also some *non-numeric*
const x = c(-Infinity, Infinity, NaN, seq0(-4, 4))
const d4 = Dnorm(x)
/*→  [
  0,           0,          NaN,         0.000133830226, 0.00443184841, 0.0539909665,
  0.241970725, 0.39894228, 0.241970725, 0.0539909665,   0.00443184841, 0.000133830226
]*/

const d5 = Dnorm(x, 0, 1, true)
/* →  [
   -Infinity,  -Infinity, NaN, -8.91893853, -5.41893853, -2.91893853, -1.41893853,
   -0.918938533, -1.41893853, -2.91893853, -5.41893853, -8.91893853
   ]
*/
```

_Equivalent in R_

```R
dnorm(0);
#[1] 0.3989423

dnorm(3, 4, 2);
#[1] 0.1760327

dnorm(-10)
#[1] 7.694599e-23

x = c(-Inf, Inf, NaN, seq(-4, 4));
dnorm(x)
# [1] 0.0000000000 0.0000000000          NaN 0.0001338302 0.0044318484
# [6] 0.0539909665 0.2419707245 0.3989422804 0.2419707245 0.0539909665
#[11] 0.0044318484 0.0001338302

dnorm(x, 0,1, TRUE);
# [1]       -Inf       -Inf        NaN -8.9189385 -5.4189385 -2.9189385
# [7] -1.4189385 -0.9189385 -1.4189385 -2.9189385 -5.4189385 -8.9189385
```

</details>

#### `pnorm`

The distribution function of the [Normal distribution][wiki-norm]. See [R doc][r-doc-normal].

_typescript decl_

```typescript
declare function pnorm(
  q: number,
  mu = 0,
  sd = 1,
  lowerTail = true,
  log = false
): number;
```

- `q`:scalar or array of quantiles
- `mu`: mean (default 0)
- `sd`: standard deviation (default 1)
- `lowerTail`: if `true` (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `log`: give result as log value

<details>
  <summary><b>Example:</b> (click to show)</summary>

```javascript
//node
const libR = import 'lib-r-math.js'
//browser
window.libR

const { c, numberPrecision, seq0, chain, Rcycle } = libR.utils

const { rnorm, dnorm, pnorm, qnorm } = libR.Normal()


// functional composition,
const Pnorm = Rcycle(chain( numberPrecision(9), pnorm))

//data
const q = seq0(-1, 1)

const p1 = Pnorm(q);
//-> [ 0.158655254, 0.5, 0.841344746 ]

const p2 = Porm(q, 0, 1, false));
//-> [ 0.841344746, 0.5, 0.158655254 ]

const p3 = Pnorm(q, 0, 1, false, true));
//-> [ -0.172753779, -0.693147181, -1.84102165 ]
```

_Equivalent in R_

```R
pnorm(-1:1);
#[1] 0.1586553 0.5000000 0.8413447

pnorm(-1:1, lower.tail=FALSE);
#[1] 0.8413447 0.5000000 0.1586553

pnorm(-1:1, log.p= TRUE);
#[1] -0.1727538 -0.6931472 -1.8410216
```

</details>

#### `qnorm`

The quantile function of the [Normal distribution][wiki-norm]. See [R doc][r-doc-norm].

_typescript decl_

```typescript
declare function qnorm(
  p: number,
  mu = 0,
  sd = 1,
  lowerTail = true,
  logP = false
): number;
```

- `p`: probabilities (scalar or array).
- `mu`: normal mean (default 0).
- `sd`: standard deviation (default 1).
- `logP`: probabilities are given as ln(p).

<details>
  <summary><b>Example:</b> (click to show)</summary>

```javascript
// node.js
const libR = require('lib-r-math.js');
// web browser
window.libR

const { Rcycle, chain, numberPrecision, seq0 } = libR.utils

const log = Rcycle(Math.log)
const _9 = numberPrecision(9) // limit precision to 9 decimals

const { rnorm, dnorm, pnorm, qnorm } = libR.Normal()

const Qnorm = Rcycle(chain(_9 qnorm))

//just like R "seq", some data
const p = seq(0, 1, 0.25)
//-> [0, 0.25, 0.5, 0.75, 1]

const q1 = Qnorm(0)
//-> [-Infinity]

const q2 = Qnorm(p, 0, 2)
//-> [ -Infinity, -1.3489795, 0, 1.3489795, Infinity ]

const q3 = Qnorm(p, 0, 2, false)
//-> [ Infinity, 1.3489795, 0, -1.3489795, -Infinity ]

//same as q3
const q4 = Qnorm(log(p), 0, 2, false, true)
//-> [ Infinity, 1.3489795, 0, -1.3489795, -Infinity ]
```

_Equivalent in R_

```R
p = seq(0, 1, 0.25);

qnorm(0);
#[1] -Inf

qnorm(p, 0, 2);
#[1]     -Inf -1.34898  0.00000  1.34898      Inf

qnorm(p, 0, 2, FALSE);
#[1]      Inf  1.34898  0.00000 -1.34898     -Inf

qnorm(log(p), 0, 2, FALSE, TRUE);
#[1]      Inf  1.34898  0.00000 -1.34898     -Inf
```

</details>

#### `rnorm`

Generates random normal deviates. See [R doc][r-doc-norm].

_typescript decl_

```typescript
declare function rnorm(n = 1, mu = 0, sd = 1): number | number[];
```

- `n`: number of deviates
- `mu`: mean of the distribution. Defaults to 0.
- `sd`: standard deviation. Defaults to 1.

<details>
  <summary><b>Example:</b> (click to show)</summary>

```javascript
//node
const libR = require("lib-r-math.js");
//browser
window.libR;

const {
  Normal,
  R: { numberPrecision },
} = libR; //(or window.libR);

//helper
const _9 = numberPrecision(9); // 9 digits

//default Mersenne-Twister/Inversion
const { rnorm, dnorm, pnorm, qnorm } = Normal();

const Rnorm = chain(_9, rnorm);

const r1 = Rnorm(5);
//-> [ 1.26295428, -0.326233361, 1.32979926, 1.27242932, 0.414641434 ]

const r2 = Rnorm(5, 2, 3);
//-> [ -2.61985013, -0.785701104, 1.11583866, 1.98269848, 9.21396017 ]
```

_Equivalent in R_

```R
RNGkind("Mersenne-Twister",normal.kind="Inversion")
set.seed(0)

rnorm(5)
#[1]  1.2629543 -0.3262334
#[3]  1.3297993  1.2724293
#[5]  0.4146414

rnorm(5,2,3)
#[1] -2.6198501 -0.7857011
#[3]  1.1158387  1.9826985
#[5]  9.2139602
```

</details>

## Other Probability Distributions

#### summary

`libRmath.so` contains 19 probability distributions (other then `Normal` and `Uniform`) with their specific density, quantile and random generators, all are ported and have been verified to yield the same output.


### Hypergeometric distribution

`dhyper, qhyper, phyper, rhyper`

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html) and [wiki](https://en.wikipedia.org/wiki/Hypergeometric_distribution).

These functions are properties of an object created by the `HyperGeometric` factory method. The factory method needs as optional argument an instance of one of the [uniform random PRNG's](#uniform-pseudo-random-number-generators) classes.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    HyperGeometric,
    rng: { MersenneTwister, SuperDuper }
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const sd = new SuperDuper(1234);
const hyperG = HyperGeometric(sd);

//or use default  (uses MersenneTwister)
const default = HyperGeometric();

const { dhyper, phyper, qhyper, rhyper } = default;
```

#### `dhyper`

The density function of the Hypergeometric distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html) and [wiki](https://en.wikipedia.org/wiki/Hypergeometric_distribution).

$$ \large p(X = x) = \frac{choose(m, x) choose(n, k-x)}{choose(m+n, k)} $$

_typescript decl_

```typescript
declare function dhyper(
  x: number | number[],
  m: number,
  n: number,
  k: number,
  aslog: boolean = false
): number | number[];
```

Where:

- `x`: is the number of observed successes.
- `m`: is the number of success states in the population
- `n`: is the number of failure states in the population
- `k`: is the number of draws from the population (n+m) sample.

Usage:

```javascript
const libR = require("lib-r-math.js");
const { HyperGeometric } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dhyper, phyper, qhyper, rhyper } = HyperGeometric();

//1.
// m = 3, n = 3, m+n=6 ,k=5 (≤ m+n).
const d1 = dhyper(
  seq(0, 4), //success count, number of white balls drawn
  5, //population white balls
  3, //population red balls
  5, //total balls drawn from (5+3)
  false
);
precision(d1);
//[ 0, 0, 0.178571429, 0.535714286, 0.267857143 ]

//2.
// m = 3, n = 4, m+n = 7, k=7 (≤ m+n).
const d2 = dhyper(
  seq(0, 4), //success count, number of white
  3, //population white balls
  4, //population red balls
  7 //total balls drawn 7 ≤ (4+3), all balls are drawn
);
precision(d2);
//[ 0, 0, 0, 1, 0 ]

//3.
// m = 3, n = 4, m+n = 7, k=5 (≤ m+n).
const d3 = dhyper(
  seq(0, 3), //success count, number of white balls drawn, must be ≤ 3
  3, //population white balls
  4, //population red balls
  5 //total balls drawn, must be < (4+3)
);
precision(d3);
//[ 0, 0.142857143, 0.571428571, 0.285714286 ]

//4.
// m = 3, = 9, m+n = 12, k = 5 (≤ m+n)
const d4 = dhyper(
  seq(0, 3), //success count, number of white balls drawn, must be ≤ 3
  3, //population white balls
  9, //population red balls
  5 //total balls drawn, must be < (4+3)
);
precision(d4);
//[ 0.159090909, 0.477272727, 0.318181818, 0.0454545455 ]
```

_in R Console_

```R
#1
> dhyper( seq(0, 4), 5, 3, 5, FALSE );
[1] 0.0000000 0.0000000 0.1785714 0.5357143 0.2678571

#2
 > dhyper( seq(0, 4), 3, 4, 7 );
[1] 0 0 0 1 0

#3
> dhyper( seq(0, 3), 3, 4, 5);
[1] 0.0000000 0.1428571 0.5714286 0.2857143

#4
> dhyper( seq(0, 3), # success count, number of white balls drawn, must be ≤ 3
    3, #population white balls
    9, #population red balls
    5 #total balls drawn, must be < (4+3)
);
[1] 0.15909091 0.47727273 0.31818182 0.04545455
```

#### `phyper`

The distribution function of the Hypergeometric distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html) and [wiki](https://en.wikipedia.org/wiki/Hypergeometric_distribution).

_typescript decl_

```typescript
declare function phyper(
  q: number | number[],
  m: number,
  n: number,
  k: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: is the number of observed successes.
- `m`: is the number of success states in the population
- `n`: is the number of failure states in the population
- `k`: is the number of draws from the population (n+m) sample.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { HyperGeometric } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dhyper, phyper, qhyper, rhyper } = HyperGeometric();

//1. m=5, n=3, m+n=6 ,k=5 (≤ m+n).
const p1 = phyper(
  seq(2, 5), //success count, number of white balls drawn
  5, //population white balls
  3, //population red balls
  5 //total balls drawn from (5+3)
);
precision(p1);
//[ 0.178571429, 0.714285714, 0.982142857, 1 ]

//2. m=9, n=18, m+n=27 ,k=9 (≤ m+n).
const p2 = phyper(
  seq(2, 6), //success count, number of white balls drawn
  9, //population white balls
  18, //population red balls
  9, //total balls drawn from (5+3)
  false
);
precision(p2);
//[ 0.66115526, 0.328440469, 0.0980994597, 0.0158348135, 0.00120998757 ]

//3. m=9, n=18, m+n=27 ,k=9 (≤ m+n).
const p3 = phyper(
  seq(2, 6), //success count, number of white balls drawn
  9, //population white balls
  18, //population red balls
  6, //total balls drawn (from white add red)
  false,
  true
);
precision(p3);
//[ -1.1886521, -2.616312, -4.83512721, -8.16733172, -Infinity ]
```

_Equivalent in R Console_

```R
#1
> phyper( seq(2, 5), 5, 3, 5 );
[1] 0.1785714 0.7142857 0.9821429 1.0000000

#2
> phyper( seq(2, 6), 9, 18, 9, FALSE);
[1] 0.661155260 0.328440469 0.098099460 0.015834814 0.001209988

#3
> phyper( seq(2, 6), 9, 18, 6, FALSE, TRUE);
[1] -1.188652 -2.616312 -4.835127 -8.167332      -Inf
```

#### `qhyper`

The quantile function of the Hypergeometric distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html) and [wiki](https://en.wikipedia.org/wiki/Hypergeometric_distribution).

_typescript decl_

```typescript
declare function qhyper(
  p: number | number[],
  m: number,
  n: number,
  k: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `p`: is probability of observed successes.
- `m`: is the number of success states in the population
- `n`: is the number of failure states in the population
- `k`: is the number of draws from the population (n+m) sample.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { HyperGeometric } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dhyper, phyper, qhyper, rhyper } = HyperGeometric();

//1
const q1 = qhyper(
  seq(0, 1, 0.2), //probabilities of drawing white balls
  5, //population white balls
  2, //population red balls
  3 //total balls drawn from (5+2)
);
precision(q1);
//[ 1, 2, 2, 2, 3, 3 ]

//2 there is a bug in R: NaN should be '3'.
// It is corrected in qhyper
const q2 = qhyper(
  log(seq(0, 1, 0.2)), //probabilities of drawing white balls
  5, //population white balls
  2, //population red balls
  3, //total balls drawn from (5+2)
  false,
  true
);
precision(q2);
//[ 3, 3, 2, 2, 2, 1 ]

//3 m=50, n=20, n+m=70, k=6 (≤ m+n)
const q3 = qhyper(
  seq(0, 1, 0.2), //probabilities of drawing white balls
  50, // population with white balls
  20, // population with red balls
  6 // total picks
);
precision(q3);
//[ 0, 3, 4, 5, 5, 6 ]
```

_Equivalent in R Console_

```R
#1.
>qhyper( seq(0, 1, 0.2), 5,2,3 );
[1] 1 2 2 2 3 3

#2. There is a bug in R: 'NaN' should be '3'
>qhyper( log(seq(0, 1, 0.2)), 5, 2, 3, FALSE, TRUE);
[1] NaN   3   2   2   2   1

#3
>qhyper( seq(0, 1, 0.2),50,20,6 );
[1] 0 3 4 5 5 6
```

#### `rhyper`

Generates random deviates for the Hypergeometric distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html) and [wiki](https://en.wikipedia.org/wiki/Hypergeometric_distribution).

_typescript decl_

```typescript
declare function rhyper(
  N: number,
  m: number,
  n: number,
  k: number
): number | number[];
```

- `N`: number of deviates to generate.
- `m`: is the number of success states in the population
- `n`: is the number of failure states in the population
- `k`: is the number of draws from the total population (n+m) sample.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  HyperGeometric,
  rng: { MersenneTwister },
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const mt = new MersenneTwister(1234);
const hyperG = HyperGeometric(mt);

const { dhyper, phyper, qhyper, rhyper } = hyperG;

//1. N=5, m=4, n=3, (m+n)=7,  k=5 (≤ m+n)
// k will pick at least 2 (from m) and at most all 4 (from m).
mt.init(1234);
rhyper(5, 4, 3, 5);
//[ 2, 3, 3, 3, 4 ]

//2. N=5, m=40, n=19, (m+n)=59, k=13 (≤ m+n)
mt.init(9876);
rhyper(5, 40, 19, 13);
//[ 7, 9, 11, 9, 9 ]

//3. N=5, m=4, n=17, (m+n)=23, k=3
mt.init(5688);
rhyper(5, 40, 99, 33);
//[ 12, 10, 10, 7, 12 ]
```

_Equivalent in R Console_

```R
RNGkind("Mersenne-Twister", normal.kind="Inversion")

#1
>set.seed(1234);
>rhyper(5, 4, 3, 5);
[1] 2 3 3 3 4

#2
>set.seed(9876);
>rhyper(5, 40, 19, 13);
[1]  7  9 11  9  9

#3
> set.seed(5688);
> rhyper(5, 40, 99, 33);
[1] 12 10 10  7 12
```

### Logistic distribution

`dlogis, qlogis, plogis, rlogis`

See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Logistic.html) and [wiki](https://en.wikipedia.org/wiki/Logistic_distribution).

These functions are properties of an object created by the `Logistic` factory method. The factory method needs as optional argument an instance of one of the [uniform random PRNG's](#uniform-pseudo-random-number-generators) classes.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Logistic,
  rng: { MersenneTwister, SuperDuper },
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const sd = new SuperDuper(1234);
const customL = Logistic(sd);

//or use default  (uses MersenneTwister)
const defaultL = Logistic();

const { dlogis, plogis, qlogis, rlogis } = defaultL;
```

#### `dlogis`

The density function of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution) with `location = m` and `scale = s` has density function.

$$ f(x) = \large \frac{e^{-\frac{x-m}{s}}}{s \left( 1 + e^{-\frac{x-m}{s}} \right)^{2}} $$

See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Logistic.html).

_typescript decl_

```typescript
declare function dlogis(
  x: number | number[],
  location: number = 0,
  scale: number = 1,
  asLog: boolean = false
): number | number[];
```

- `x`: quantiles (scalar or array).
- `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
- `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.
- `asLog`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { Logistic } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dlogis, plogis, qlogis, rlogis } = Logistic();

// some quantiles
const x = [-Infinity, ...seq(-10, 10, 2.5), Infinity];

//1
const d1 = dlogis(x, 5, 2);
precision(d1);
/*[
  0, 0.000276236536, 0.000961511178, 0.00332402834,
  0.0112247052, 0.0350518583, 0.0865523935, 0.125,
  0.0865523935, 0.0350518583, 0 
]*/

//2
const d2 = dlogis(x, 0, 2, true);
precision(d2);
/*[ -Infinity, -5.70657788, -4.48963811, -3.35092665,
    -2.44700534, -2.07944154, -2.44700534, -3.35092665,
    -4.48963811, -5.70657788, -Infinity ]
*/

//3
const d3 = dlogis(x, -9, 2);
precision(d3);
/*
[ 0, 0.117501856, 0.108947497, 0.0524967927,
  0.0179667954, 0.00543311486, 0.00158130846,
  0.00045511059, 0.000130561049, 0.0000374203128,
  0 ]
*/
```

_Equivalent in R Console_

```R
> x = c(-Inf, seq(-10,10,2.5), Inf);
#1
> dlogis(x, 5, 2);
 [1] 0.0000000000 0.0002762365 0.0009615112 0.0033240283 0.0112247052
 [6] 0.0350518583 0.0865523935 0.1250000000 0.0865523935 0.0350518583
[11] 0.0000000000

#2
> dlogis(x, 0, 2, TRUE);
 [1]      -Inf -5.706578 -4.489638 -3.350927 -2.447005 -2.079442 -2.447005
 [8] -3.350927 -4.489638 -5.706578      -Inf

#3
> dlogis(x, -5, 2);
 [1] 0.0000000000 0.0350518583 0.0865523935 0.1250000000 0.0865523935
 [6] 0.0350518583 0.0112247052 0.0033240283 0.0009615112 0.0002762365
[11] 0.0000000000
```

#### `plogis`

The distribution function of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Logistic.html).

_typescript decl_

```typescript
declare function plogis(
  q: number | number[],
  location: number = 0,
  scale: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: quantiles (scalar or array).
- `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
- `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { Logistic } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dlogis, plogis, qlogis, rlogis } = Logistic();

// some quantiles
const x = [-Infinity, ...seq(-10, 10, 2.5), Infinity];

//1
const p1 = plogis(x, 5, 2);
precision(p1);
/*
[ 0, 0.000552778637, 0.00192673466, 0.00669285092,
  0.0229773699, 0.07585818, 0.222700139, 0.5,
  0.777299861, 0.92414182, 1 ]
*/

//2
const p2 = plogis(x, 0, 2, true, true);
precision(p2);
/*
[ -Infinity, -5.00671535, -3.77324546, -2.57888973,
  -1.50192908, -0.693147181, -0.251929081, -0.0788897343,
  -0.0232454644, -0.00671534849, 0 ]
*/

//3
const p3 = plogis(x, -9, 2, false);
precision(p3);
/*
[ 1, 0.622459331, 0.320821301, 0.119202922,
    0.0373268873, 0.0109869426, 0.00317268284,
    0.000911051194, 0.000261190319, 0.0000748462275,
    0 ]
*/
```

_Equivalent in R Console_

```R
> x = c(-Inf, seq(-10,10,2.5), Inf);

#1
>  plogis(x, 5, 2);
 [1] 0.0000000000 0.0005527786 0.0019267347 0.0066928509 0.0229773699
 [6] 0.0758581800 0.2227001388 0.5000000000 0.7772998612 0.9241418200
[11] 1.0000000000

#2
>  plogis(x, 0, 2, TRUE, TRUE);
 [1]         -Inf -5.006715348 -3.773245464 -2.578889734 -1.501929081
 [6] -0.693147181 -0.251929081 -0.078889734 -0.023245464 -0.006715348
[11]  0.000000000

#3
 plogis(x, -9, 2, FALSE);
 [1] 1.000000e+00 6.224593e-01 3.208213e-01 1.192029e-01 3.732689e-02
 [6] 1.098694e-02 3.172683e-03 9.110512e-04 2.611903e-04 7.484623e-05
[11] 0.000000e+00
```

#### `qlogis`

The quantile function of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Logistic.html).

_typescript decl_

```typescript
declare function qlogis(
  p: number | number[],
  location: number = 0,
  scale: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `p`: probabilities (scalar or array). 0 ≤ p ≤ 1.
- `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
- `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { Logistic } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dlogis, plogis, qlogis, rlogis } = Logistic();

// some quantiles
const x = [-Infinity, ...seq(-10, 10, 2.5), Infinity];

//1
const pp1 = plogis(x, 5, 2);
const q1 = qlogis(pp1, 5, 2);
precision(q1);
//[ -Infinity, -10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10, Infinity ]

//2
const pp2 = plogis(x, 0, 2);
const q2 = qlogis(log(pp2), 0, 2, true, true);
precision(q2);
//[ -Infinity, -10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10, Infinity ]

//3
const pp3 = plogis(x, -9, 2, false);
const q3 = qlogis(pp3, -9, 2, false);
precision(q3);
//[ -Infinity, -10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10, Infinity ]
```

_Equivalent in R_

```R
> x = c(-Inf, seq(-10,10,2.5), Inf);

#1
> pp1 = plogis(x, 5, 2);
> qlogis(pp1, 5, 2);
 [1]  -Inf -10.0  -7.5  -5.0  -2.5   0.0   2.5   5.0   7.5  10.0   Inf

#2
> pp2 = plogis(x, 0, 2);
> qlogis(log(pp2), 0, 2, TRUE, TRUE);
 [1]  -Inf -10.0  -7.5  -5.0  -2.5   0.0   2.5   5.0   7.5  10.0   Inf

#3
> pp3 = plogis(x, -9, 2, FALSE);
> qlogis(pp3, -9, 2, FALSE);
[1]  -Inf -10.0  -7.5  -5.0  -2.5   0.0   2.5   5.0   7.5  10.0   Inf
```

#### `rlogis`

Generates random deviates for the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Logistic.html).

_typescript decl_

```typescript
declare function rlogis(
  N: number,
  location: number = 0,
  scale: number = 1
): number | number[];
```

- `N`: number of random deviates to generate.
- `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
- `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Logistic,
  rng: { MersenneTwister },
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const mt = new MersenneTwister(5321);
const { dlogis, plogis, qlogis, rlogis } = Logistic(mt);

//1
const r1 = rlogis(5, 5, 2);
precision(r1);
//[ 7.02446979, 6.84019548, 6.77001963, 4.01530273, 1.67362287 ]

//2
const r2 = rlogis(5, 0, 0.2);
precision(r2);
//[ 0.202398766, 0.25232485, -0.050656448, -0.488473577, 0.170761471 ]

//3
const r3 = rlogis(5, -9, 4);
precision(r3);
//[ 10.3948377, -14.9312628, -8.12718959, -14.06567, -0.609071942 ]
```

```R
> RNGkind("Mersenne-Twister", normal.kind="Inversion");
> set.seed(5321)
#1
> rlogis(5, 5, 2)
[1] 7.024470 6.840195 6.770020 4.015303 1.673623

#2
> rlogis(5, 0, 0.2)
[1]  0.20239877  0.25232485 -0.05065645 -0.48847358  0.17076147

#3
> rlogis(5, -9, 4)
[1]  10.3948377 -14.9312628  -8.1271896 -14.0656700  -0.6090719
```

### Log Normal distribution

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Lognormal.html).

from [wiki](https://en.wikipedia.org/wiki/Log-normal_distribution):

> _In probability theory, a log-normal (or lognormal) distribution is a continuous probability distribution of a random variable whose logarithm is normally distributed. Thus, if the random variable X is log-normally distributed, then Y = ln(X) has a normal distribution. Likewise, if Y has a normal distribution, then the exponential function of Y, X = exp(Y), has a log-normal distribution. A random variable which is log-normally distributed takes only positive real values._

`dlnorm, qlnorm, plnorm, rlnorm`

These functions are properties of an object created by the `LogNormal` factory method. The factory method needs the result returned by the [Normal](#normal-distribution) factory method. Various instantiation methods are given as an example.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Normal,
  LogNormal,
  rng: { MersenneTwister },
  rng: {
    normal: { Inversion },
  },
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//explicitly use a PRNG.
const mt = new MersenneTwister(5321);
const customL = LogNormal(Normal(new Inversion(mt)));

//or use default  (uses "MersenneTwister" and "Inversion")
const defaultL = LogNormal();
//
const { dlnorm, plnorm, qlnorm, rlnorm } = customL;
```

#### `dlnorm`

The density function of the [Log Normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Lognormal.html).

$$ f(x) = \frac{1}{x} \cdot \frac{1}{\sigma \cdot \sqrt{2 \pi}} exp \left( -\frac{(ln(x) - \mu)^{2}}{2 \cdot \sigma^{2} } \right) $$

_Note:_ deviate `x` has a normal distribution with mean $\mu$ and standard deviation $\sigma$.

_typescript decl_

```typescript
declare function dlnorm(
  x: number | number[],
  meanLog: number = 0,
  sdLog: number = 1,
  asLog: boolean = false
): number | number[];
```

- `x`: quantiles, with distribution $x ~ N(\mu, \sigma)$
- `meanLog`: the mean of the normally distributed `x`
- `sdLog`: the standard deviation ($\sigma$) of the normal distributed `x`.
- `asLog`: return the densities as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { LogNormal } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

// create log normal instance
const { dlnorm, plnorm, qlnorm, rlnorm } = LogNormal();

//data from 0 to 3, step 0.5
const x = seq(0, 3, 0.5);

//1.
const d1 = dlnorm(x, 0, 0.25);
precision(d1);
/*[ 
    0, 0.0683494951, 1.59576912, 0.285553776, 0.0170873738,
    0.000772680788,0.0000340783543
]*/

//2.
const d2 = dlnorm(x, 0, 0.5, true);
precision(d2);
/*
[ -Infinity, -0.4935502, -0.225791353, -0.960060369, -1.87984456,
  -2.8212595,-3.73830156 
]
*/

//3
const d3 = dlnorm(x, 0, 1);
precision(d3);
/*
[ 
  0, 0.627496077, 0.39894228, 0.244973652, 0.156874019,
  0.104871067, 0.0727282561
]
*/
```

_Equivalent in R_

```R
# prepare
x = seq(0,3,0.5)
options(scipen=999)
options(digits=9)

#1
dlnorm(x, 0, 0.25)
#[1] 0.0000000000000 0.0683494950964 1.5957691216057 0.2855537757193
#[5] 0.0170873737741 0.0007726807882 0.0000340783543

#2
dlnorm(x, 0, 0.5, TRUE);
#[1]         -Inf -0.493550200 -0.225791353 -0.960060369 -1.879844561
#[6] -2.821259495 -3.738301563

#3
dlnorm(x, 0, 1);
#[1] 0.0000000000 0.6274960771 0.3989422804 0.2449736517 0.1568740193
#[6] 0.1048710669 0.0727282561
```

#### `plnorm`

The distribution function of the [Log Normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Lognormal.html).

$$ f(x) = \frac{1}{2} + \frac{1}{2} \cdot erf \left( \frac{(ln(x)-\mu)}{\sigma \cdot \sqrt{2}} \right) $$

_Note:_ deviate `x` has a normal distribution with mean $\mu$ and standard deviation $\sigma$.

_typescript decl_

```typescript
declare function plnorm(
  q: number | number[],
  meanLog: number = 0,
  sdLog: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: quantiles, with distribution $x ~ N(\mu, \sigma)$
- `meanLog`: the mean of the normally distributed `x`
- `sdLog`: the standard deviation ($\sigma$) of the normal distributed `x`.
- `lowerTail`: if TRUE (default), probabilities are P[X <= x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { LogNormal } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

// create log normal instance
const { dlnorm, plnorm, qlnorm, rlnorm } = LogNormal();

//data from 0 to 3, step 0.5
const x = seq(0, 3, 0.5); //

//1.
const p1 = plnorm(x, 0, 0.25);
precision(p1);
/*[
  0, 0.0683494951, 1.59576912, 0.285553776,
  0.0170873738, 0.000772680788, 0.0000340783543 
  ]*/

//2.
const p2 = plnorm(x, 0, 0.5, true);
precision(p2);
/*
[
  0, 0.082828519, 0.5, 0.791297127,
  0.917171481, 0.966567582, 0.985997794 
]*/

//3
const p3 = plnorm(x, 0, 1);
precision(p3);
/*[
  1, 0.244108596, 0.5, 0.657432169,
  0.755891404, 0.820242786, 0.864031392
]*/
```

_Equivalent in R_

```R
# prepare
> x = seq(0,3,0.5)
> options(scipen=999)
> options(digits=9)

#1
> plnorm(x, 0, 0.25);
[1] 0.00000000000 0.00278061786 0.50000000000 0.94758338236 0.99721938214
[6] 0.99987640941 0.99999444730

#2
> plnorm(x, 0, 0.5, TRUE);
[1] 0.000000000 0.082828519 0.500000000 0.791297127 0.917171481 0.966567582
[7] 0.985997794

#3
> plnorm(x, 0, 1);
[1] 0.000000000 0.244108596 0.500000000 0.657432169 0.755891404 0.820242786
[7] 0.864031392
```

#### `qlnorm`

The quantile function of the [Log Normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Lognormal.html).

_typescript decl_

```typescript
declare function qlnorm(
  p: number | number[],
  meanLog: number = 0,
  sdLog: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `p`: probabilities.
- `meanLog`: the mean of the normally distributed `x`
- `sdLog`: the standard deviation ($\sigma$) of the normal distributed `x`.
- `lowerTail`: if TRUE (default), probabilities are P[X <= x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { LogNormal } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

// create log normal instance
const { dlnorm, plnorm, qlnorm, rlnorm } = LogNormal();

//data from 0 to 3, step 0.5
const x = seq(0, 3, 0.5);

//1.
const pp1 = plnorm(x, 0, 0.25);
const q1 = qlnorm(pp1, 0, 0.25);
precision(q1);
// [ 0, 0.5, 1, 1.5, 2, 2.5, 3]

//2.
const pp2 = plnorm(x, 2, 0.5, false, true);
const q2 = qlnorm(pp2, 2, 0.5, false, true);
precision(q2);
//[ 0, 0.5, 1, 1.5, 2, 2.5, 3 ]

//3. //defaults mu=0, sigma =1.
const pp3 = plnorm(x);
const q3 = qlnorm(pp3);
precision(q3);
//[ 0, 0.5, 1, 1.5, 2, 2.5, 3 ]
```

_Equivalent in R_

```R
# prepare
> x = seq(0,3,0.5)
> options(scipen=999)
> options(digits=9)

#1.
pp1 = plnorm(x, 0, 0.25);
qlnorm(pp1, 0, 0.25);
[1] 0.0 0.5 1.0 1.5 2.0 2.5 3.0

#2.
pp2 = plnorm(x, 2, 0.5, FALSE, TRUE);
qlnorm(pp2, 2, 0.5, FALSE, TRUE);
[1] 0.0 0.5 1.0 1.5 2.0 2.5 3.0

#3. check defaults
> pp3 = plnorm(x);
> qlnorm(pp3);
[1] 0.0 0.5 1.0 1.5 2.0 2.5 3.0
```

#### `rlnorm`

Generates random deviates from the [Log Normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Lognormal.html).

_typescript decl_

```typescript
declare function rlnorm(
  n: number,
  meanlog: number = 0,
  sdlog: number = 1
): number | number[];
```

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Normal,
  LogNormal,
  rng: { MersenneTwister },
  rng: {
    normal: { Inversion },
  },
} = libR;

//some tools
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//explicitly use a PRNG.
const mt = new MersenneTwister(0);
const lNorm = LogNormal(Normal(new Inversion(mt)));
//
const { dlnorm, plnorm, qlnorm, rlnorm } = lNorm;

//1
mt.init(12345);
const r1 = rlnorm(5);
precision(r1);
//[ 1.79594046, 2.03290543, 0.896458467, 0.63540215, 1.83287809 ]

//2
mt.init(56789);
const r2 = rlnorm(5, 2, 0.3);
precision(r2);
//[ 10.1653549, 7.83173724, 6.60669182, 11.8165548, 6.055864 ]

//3
mt.init(332211);
const r3 = rlnorm(5, 2, 3.2);
precision(r3);
//[ 1069.70113, 1.5096088, 10.8744975, 0.115348102, 562.383238 ]
```

_Equivalent in R_

```R
> options(scipen=999)
> options(digits=9)
> RNGkind("Mersenne-Twister", normal.kind="Inversion")

#1
> set.seed(12345)
> rlnorm(5)
[1] 1.795940460 2.032905433 0.896458467 0.635402150 1.832878086

#2
> set.seed(56789)
> rlnorm(5,2,0.3)
[1] 10.16535485  7.83173724  6.60669182 11.81655477  6.05586400

#3
> set.seed(332211)
> rlnorm(5,2,3.2)
[1] 1069.701128375    1.509608802   10.874497520    0.115348102  562.383238202
```

### Multinomial distribution

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Multinom.html):

from [wiki](https://en.wikipedia.org/wiki/Multinomial_distribution):

`dmultinom, rmultinom`

These functions are properties of an object created by the `Multinomial` factory method. The factory method needs as optional argument an instance of one of the [uniform random PRNG's](#uniform-pseudo-random-number-generators) classes.

_Note:_ Analog `pmultinom, qmultinom` are not implemented in R and hence not available in this port. In Future implementation for `pmultinom` would require an analog for $P(\vec{X} \leq \vec{x})$ by constraining the multivariate vector `X` to a hyperplane $\vec{n} \cdot \vec{X} = d$ where `d` is the total number of draws and $\vec{n}$ is the N dimensional hyperplane vector normal $\vec{n}=(1,1,...,1)$. Elements of $\vec{X}$ have only integer values. This is potentially an expensive operation. We would need to sum over

$$\frac{(size+k)!}{k!\cdot((size+k)-k)!}$$

`probability mass` values, were $k$ is the dimension of vector:$\vec{x}$ and $size = \sum*{i=1}^{k} x*{i}$.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  MultiNomial,
  rng: { MersenneTwister, SuperDuper },
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//create instance with specific PRNG
const sd = new SuperDuper(1234);
const customM = MultiNomial(sd);

//create (default PRNG is Mersenne-Twister) Multinomial instance.
const defaultM = MultiNomial();

const { dmultinom, rmultinom } = defaultM;
```

#### `dmultinom`

The `probability mass function` of the multinomial distribution. See [wiki](https://en.wikipedia.org/wiki/Multinomial_distribution) or [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Multinom.html)

$$ f( x*{1} , ... , x*{k}; p*{1},...,p*{k}) = \frac{n!}{x*{1}!\cdot\cdot\cdot x*{k}!} p*{1}^{x*{1}} \times\cdot\cdot\cdot\times p*{k}^{x*{k}}, when \sum*{i=1}^{k} x*{i} = n $$

_typescript decl_

```typescript
declare interface IdmultinomOptions {
  x: number[];
  prob: number[];
  size?: number;
  asLog?: boolean;
}

declare function dmultinom(option: IdmultinomOptions): number[];
```

`dmultinom` needs as input an JS object (typescript interface type `IdmultinomOptions`) with the following properties:

- `x`: array of quantiles (minimal item count is 2)
- `prob`: array of corresponding non-zero probabilities corresponding with the quantiles.
- `size`: optional, you can safely omit it, functions as a kind of checksum: size = $\sum*{i=1}^{k} x*{i}$
- `asLog`: probabilities are returned as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { Multinomial } = libR;

//some tools
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dmultinom, rmultinom } = Multinomial();

//1. binomial analog
const d1 = dmultinom({
  x: [3, 5],
  prob: [0.25, 0.75],
});
precision(d1);
//0.207641602

//2. binomial analog
const d2 = dmultinom({
  x: [3, 5, 9],
  prob: [0.2, 0.7, 0.1],
});
precision(d2);
//0.0000018304302

//3. binomial analog
const d3 = dmultinom({
  x: [3, 5, 9, 4],
  prob: [2, 8, 4, 6], // will normalized to = [ 2/20, 8/20, 4/20, 6/20 ]
  asLog: true,
});
precision(d3);
//-7.96903499
```

_Equivalent in R console_

```R
> options(scipen=999)
> options(digits=9)

#1
> dmultinom(x=c(3, 5), prob=c(0.25, 0.75));
[1] 0.2076416

#2
> dmultinom(x=c(3, 5, 9), prob=c(0.2, 0.7, 0.1));
[1] 0.0000018304302

#3
> dmultinom(x=c(3,5,9,4), prob=c(2,8,4,6), log=TRUE)
[1] -7.96903499
```

#### `rmultinom`

Generates deviates ( these are arrays of arrays ) of the multinomial distribution.

_typescript decl_

```typescript
declare function rmultinom(
  n: number,
  size: number,
  prob: number | number[]
): number[] | number[][]; //return an array of arrays n x prob.length elements.
```

- `n`: returns an array of size `n` nested arrays of dimension `prob.length`.
- `size`: distribute size elements amongst `prob.length` bins for each deviate.
- `prob`: an array (in case of a scalar or array of length 1) describing the probabilities for success for ech bin.
- `@return`: returns `n` arrays each of length `k = (prob.length)`.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Multinomial,
  rng: { MersenneTwister },
  rng: {
    normal: { Inversion },
  },
  R: { sum, div, mult },
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const mt = new MersenneTwister();
const { dmultinom, rmultinom } = Multinomial(mt);

//1
const prob1a = [167, 500, 167, 167];
const prob1b = div(prob1a, sum(prob1a));

mt.init(1234);
rmultinom(4, 40, prob1b);
mt.init(1234);
rmultinom(4, 40, prob1a); //same result!!
/*
[ [ 4, 21, 8, 7 ],
  [ 7, 17, 9, 7 ],
  [ 2, 25, 7, 6 ],
  [ 7, 18, 8, 7 ] ]*/

//2
const prob2a = [10, 30, 40, 90];
const prob2b = div(prob2a, sum(prob2a));

mt.init(5678);
rmultinom(4, 5299, prob2b);
mt.init(5678);
rmultinom(4, 5299, prob2a); //same result
/*
[ [ 316, 945, 1271, 2767 ],
  [ 308, 896, 1206, 2889 ],
  [ 329, 871, 1292, 2807 ],
  [ 308, 930, 1265, 2796 ] ]*/

//3
const prob3a = [9, 8, 0, 6, 0, 2];
const prob3b = div(prob3a, sum(prob3a));

mt.init(666);
rmultinom(4, 9967, prob3b);
mt.init(666);
rmultinom(4, 9967, prob3a); //same result
/*
[ [ 3727, 3098, 0, 2299, 0, 843 ],
  [ 3563, 3142, 0, 2447, 0, 815 ],
  [ 3534, 3145, 0, 2455, 0, 833 ],
  [ 3702, 3125, 0, 2365, 0, 775 ] ]  */
```

_Equivalent in R_

```R
> RNGkind("Mersenne-Twister")

#1
> prob1a=c(167,500,167,167)
> set.seed(1234);
# Transpose ('t') the matrix for easier inspection with JS version
> t(rmultinom(4, 40, prob1a))
     [,1] [,2] [,3] [,4]
[1,]    4   21    8    7
[2,]    7   17    9    7
[3,]    2   25    7    6
[4,]    7   18    8    7

#2
> prob2a=c(10, 30, 40, 90)
> set.seed(5678)
> t(rmultinom(4, 5299, prob2a))
     [,1] [,2] [,3] [,4]
[1,]  316  945 1271 2767
[2,]  308  896 1206 2889
[3,]  329  871 1292 2807
[4,]  308  930 1265 2796

#3
> prob3a=c(9, 8, 0, 6, 0, 2)
> set.seed(666)
> t(rmultinom(4, 9967, prob3a));
     [,1] [,2] [,3] [,4] [,5] [,6]
[1,] 3727 3098    0 2299    0  843
[2,] 3563 3142    0 2447    0  815
[3,] 3534 3145    0 2455    0  833
[4,] 3702 3125    0 2365    0  775
```

### Poisson distribution

`dpois, qpois, ppois, rpois`

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Poisson.html) and [wiki](https://en.wikipedia.org/wiki/Poisson_distribution).

These functions are properties of an object created by the `Poisson` factory method. The factory method needs as optional argument an instance of one of the [normal random PRNG's](#normal-distributed-random-number-generators) classes.

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Poisson,
  rng: { SuperDuper },
  rng: {
    normal: { BoxMuller },
  },
} = libR;

//default (uses Inversion and MersenneTwister)
const defaultP = Poisson();

//explicit use of PRNG
const sd = new SuperDuper(123);
const explicitP = Poisson(new BoxMuller(sd));

const { dpois, ppois, qpois, rpois } = explicitP;
```

#### `dpois`

The `probability mass function` of the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Poisson.html).

$$ p(x) = \frac{λ^{x}}{x!} \cdot e^{-λ} $$

_typescript decl_

```typescript
declare function dpois(
  x: number | number[],
  lambda: number,
  asLog: boolean = false
): number | number[];
```

- `x`: quantile(s). Scalar or array.
- `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
- `asLog`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { Poisson } = libR;

//some tools
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dpois, ppois, qpois, rpois } = Poisson();

const x = seq(0, 10, 2);

//1
const d1 = dpois(x, 1, true);
precision(d1);
/*
[
  -1, -1.69314718, -4.17805383,
  -7.57925121, -11.6046029, -16.1044126
]*/

//2
const d2 = dpois(x, 4);
precision(d2);
/*
[ 0.0183156389,
  0.146525111,
  0.195366815,
  0.104195635,
  0.0297701813,
  0.00529247668 ]
*/

//3
const d3 = dpois(x, 10);
precision(d3);
/*[
  0.0000453999298, 0.00226999649,
  0.0189166374,  0.063055458,
  0.112599032,  0.125110036
]*/
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)
x = seq(0,10,2);

#1
dpois(x, 1, TRUE);
[1]  -1.000000  -1.693147  -4.178054  -7.579251 -11.604603 -16.104413

#2
dpois(x, 4);
[1] 0.018315639 0.146525111 0.195366815 0.104195635 0.029770181 0.005292477

#3
dpois(x, 10);
[1] 0.0000453999298 0.0022699964881 0.0189166374010 0.0630554580035
[5] 0.1125990321490 0.1251100357211
```

#### ppois

The cumulative distribution function of the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Poisson.html).

_typescript decl_

```typescript
declare function ppois(
  q: number | number[],
  lambda: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `q`: quantile(s). A Scalar or array.
- `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const { Poisson } = libR;

//some tools
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dpois, ppois, qpois, rpois } = Poisson();

const x = seq(0, 10, 2);
//1
const p1 = ppois(x, 1, false, true);
precision(p1);
/*[
  -0.458675145,
  -2.52196826,
  -5.61033398,
  -9.39376875,
  -13.6975475,
  -18.4159155 ]*/

//2
const p2 = ppois(x, 4);
precision(p2);
/*
[ 0.0183156389,
  0.238103306,
  0.628836935,
  0.889326022,
  0.978636566,
  0.997160234 ]
*/

//3
const p3 = ppois(x, 10);
precision(p3);
/*[
  0.0000453999298,
  0.00276939572,
  0.0292526881,
  0.130141421,
  0.332819679,
  0.58303975 ]
*/
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)
x = seq(0,10,2);

#1
> ppois(x, 1, FALSE, TRUE);
[1]  -0.458675145  -2.521968260  -5.610333983  -9.393768750 -13.697547451
[6] -18.415915478

#2
> ppois(x, 4);
[1] 0.0183156389 0.2381033056 0.6288369352 0.8893260216 0.9786365655
[6] 0.9971602339

#3
> ppois(x, 10);
[1] 0.0000453999298 0.0027693957155 0.0292526880770 0.1301414208825
[5] 0.3328196787507 0.5830397501930
```

#### `qpois`

The quantile function of the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Poisson.html).

_typescript decl_

```typescript
declare function qpois(
  p: number | number[],
  lambda: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

- `p`: probabilities, scalar or array.
- `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
- `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
- `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Poisson,
  R: { arrayrify },
} = libR;

//some tools
const seq = libR.R.seq()();
const log = arrayrify(Math.log);
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dpois, ppois, qpois, rpois } = Poisson();

const p = seq(0, 1, 0.2);

//1
const q1 = qpois(ln(p), 1, false, true);
precision(q1);
//[ Infinity, 2, 1, 1, 0, 0 ]

//2
const q2 = qpois(p, 4);
precision(q2);
//[ 0, 2, 3, 4, 6, Infinity ]

//3
const q3 = qpois(p, 10);
precision(q3);
//[ 0, 7, 9, 11, 13, Infinity ]
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)
p = seq(0,10,2);

#1
> qpois( ln(p) , 1, FALSE, TRUE)
[1] Inf   2   1   1   0   0

#2
> qpois(p, 4);
[1]   0   2   3   4   6 Inf

#3
> qpois(p, 10);
[1]   0   7   9  11  13 Inf
```

#### `rpois`

Generate random deviates for the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Poisson.html).

_typescript decl_

```typescript
declare function rpois(N: number, lambda: number): number | number[];
```

- `N`: number of deviates to generate.
- `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).

Usage:

```javascript
const libR = require("lib-r-math.js");
const {
  Poisson,
  rng: { MersenneTwister },
  rng: {
    normal: { Inversion },
  },
} = libR;

//helpers
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//explicit use of PRNG
const mt = new MersenneTwister(0); // need reference so we "reset" PRNG

const { dpois, ppois, qpois, rpois } = Poisson(new Inversion(mt));

mt.init(123);
//1
const r1 = rpois(5, 1);
precision(r1);
//[ 0, 2, 1, 2, 3 ]

//2
const r2 = rpois(5, 4);
precision(r2);
//[ 1, 4, 7, 4, 4 ]

//3
const r3 = rpois(5, 10);
precision(r3);
//[ 15, 11, 5, 4, 13 ]
```

_Equivalent in R_

```R
options(scipen=999)
options(digits=9)
RNGkind("Mersenne-Twister", normal.kind="Inversion")
set.seed(123);

#1
> rpois(5, 1);
[1] 0 2 1 2 3

#2
> rpois(5, 4);
[1] 1 4 7 4 4

#3
> rpois(5, 10);
[1] 15 11  5  4 13
```

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

Contributor Covenant Code of Conduct
Our Pledge
In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

Our Standards
Examples of behavior that contributes to creating a positive environment include:

Using welcoming and inclusive language
Being respectful of differing viewpoints and experiences
Gracefully accepting constructive criticism
Focusing on what is best for the community
Showing empathy towards other community members
Examples of unacceptable behavior by participants include:

The use of sexualized language or imagery and unwelcome sexual attention or advances
Trolling, insulting/derogatory comments, and personal or political attacks
Public or private harassment
Publishing others' private information, such as a physical or electronic address, without explicit permission
Other conduct which could reasonably be considered inappropriate in a professional setting
Our Responsibilities
Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.

Scope
This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community. Examples of representing a project or community include using an official project e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event. Representation of a project may be further defined and clarified by project maintainers.

Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting Ben Lesh (ben@benlesh.com), Tracy Lee (tracy@thisdot.co) or OJ Kwon (kwon.ohjoong@gmail.com). All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The project team is obligated to maintain confidentiality with regard to the reporter of an incident. Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good faith may face temporary or permanent repercussions as determined by other members of the project's leadership.

Attribution
This Code of Conduct is adapted from the Contributor Covenant, version 1.4, available at https://www.contributor-covenant.org/version/1/4/code-of-conduct.html

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

### Changed

### Removed

Guiding Principles
Changelogs are for humans, not machines.
There should be an entry for every single version.
The same types of changes should be grouped.
Versions and sections should be linkable.
The latest version comes first.
The release date of each version is displayed.
Mention whether you follow Semantic Versioning.
Types of changes
Added for new features.
Changed for changes in existing functionality.
Deprecated for soon-to-be removed features.
Removed for now removed features.
Fixed for any bug fixes.
Security in case of vulnerabilities.

[constributer-convenant]: https://www.contributor-covenant.org/
[code-conduct]: https://www.contributor-covenant.org/version/1/4/code-of-conduct.html
[librmath.so]: https://svn.r-project.org/R/trunk/src/nmath
[wiki-norm]: https://en.wikipedia.org/wiki/Normal_distribution
[r-doc-norm]: http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html
