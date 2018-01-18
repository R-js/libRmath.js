# libRmath.js

Javascript ( TypeScript ) Pure Implementation of Statistical R "core" numerical
`libRmath.so` library found here https://svn.r-project.org/R/trunk/src/nmath/

#### Summary

Porting `R nmath` core is a daunting task, we _VERIFIED_ fidelity with `R` on
all functions that are ported from `R` to `javascript` by using static fixtures
(generated in R language) to guarantee exact output replication of the ported
functions.

All functions in lib-R-core has been re-written to `Javascript` (`Typescript`).

#### Node and Web

No node specific features are used, you can either deploy for client web or
server.

## Installation

```bash
npm install --save lib-r-math.js
```

# Table of Contents

* [TODO: What is improved on R](#what-is-improved-on-r)
* [Helper functions for porting R](#helper-functions-for-porting-r)
* [Uniform Pseudo Random Number Generators](#uniform-pseudo-random-number-generators)
* [Normal Random Number Generators](#normal-distributed-random-number-generators)
* [Canonical distributions](#canonical-distributions)
  * [Uniform distribution](#uniform-distributions)
  * [Normal distribution](#normal-distribution)
* [Other Probability Distributions](#other-probability-distributions)
  * [Beta distribution](#beta-distribution)
  * [Binomial distribution](#binomial-distribution)
  * [Negative Binomial distribution](#negative-binomial-distribution)
  * [Cauchy distribution](#cauchy-distribution)
  * [X<sup>2</sup> (non-central) distribution](#chi-squared-non-central-distribution)
  * [Exponential distribution](#exponential-distribution)
  * [F (non-central) distribution](#f-non-central-distribution)
  * [Gamma distribution](#gamma-distribution)
  * [Geometric distribution](#geometric-distribution)
  * [Hypergeometric distribution](#hypergeometric-distribution)
  * [Logistic distribution](#logistic-distribution)
  * [Log Normal distribution](#log-normal-distribution)
  * [Multinomial distribution](#multinomial-distribution)
  * [Poisson distribution](#poisson-distribution)
  * [Wilcoxon signed rank statistic distribution](#wilcoxon-signed-rank-statistic-distribution)
  * [Student T distribution](#student-t-distribution)
  * [TODO:Studentized Range (_Tukey_) distribution](#studentized-range-distribution)
  * [TODO:Weibull distribution](#weibull-distribution)
  * [TODO:Wilcoxon rank sum statistic distribution](#wilcoxon-rank-sum-statistic-distribution)
* [Special Functions of Mathematics](#special-functions-of-mathematics)
  * [TODO:Bessel functions](#bessel-functions)
  * [TODO:Beta functions](#beta-functions)
  * [TODO:Gamma functions](#gamma-functions)
  * [TODO:Functions for working with Combinatorics](#functions-for-working-with-combinatorics)
* [TODO:Road map](#road-map)

# Helper functions for porting `R`.

#### Summary

R language operators and functions can work `vectors` and `list`.
These Javascript helper functions are used to make the porting process to ES6 easier for R and JS programmers.

### `div`

Divides scalar or an array of values with the second argument.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { div } = libR.R;

//1
div(3, 5); //= 3/5
//0.6

div([0, 1, 2, 3], 5);
//[0, 0.2, 0.4, 0.6]
```

### `mult`

Multiplies scalar or an array of values with the second argument.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { mult } = libR.R;

//1
mult(3, 5); //= 3*5
//15

mult([0, 1, 2, 3], 5);
//[0, 5, 10, 15]
```

### `sum`

Analog to `R`'s `sum` function. Calculates the sum of all elements of an array.

```javascript
const libR = require('lib-r-math.js');
const { sum } = libR.R;

//1
sum(1);
//:1

//2
sum([1, 2, 3, 4]);
//: 10
```

### `summary`

Gives summary information of numeric data in an array.

_decl_

```typescript
declare function summary(data: number[]): ISummary;

interface ISummary {
  N: number; // number of samples in "data"
  mu: number; // mean of "data"
  population: {
    variance: number; // population variance (data is seen as finite population)
    sd: number; // square root of the population variance
  };
  sample: {
    variance: number; // sample variance (data is seen as a small sample from an very large population)
    sd: number; // square root of "sample variance"
  };
  relX; // = x-E(x)
  relX2; // = ( x-E(x) )^2
  stats: {
    min: number; // minimal value from "data"
    '1st Qu.': number; // 1st quantile from "data"
    median: number; // median value from "data
    '3rd Qu.': number; // 3rd quantile from "data"
    max: number; // maximum value in data
  };
}
```

Usage:

```javascript
const libR = require('lib-r-math.js');
const { summary } = libR.R;

summary([360, 352, 294, 160, 146, 142, 318, 200, 142, 116])
/*
{ N: 10,
  mu: 223,
  population: { variance: 8447.4, sd: 91.90973833060346 },
  sample: { variance: 9386, sd: 96.88137075826292 },
  relX: [ 137, 129, 71, -63, -77, -81, 95, -23, -81, -107 ],
  relX2: [ 18769, 16641, 5041, 3969, 5929, 6561, 9025, 529, 6561, 11449 ],
  stats: { min: 116, '1st Qu.': 143, median: 180, '3rd Qu.': 312, max: 360 } }
*/
```

### `numberPrecision`

Truncates numbers to a specified significant digits.

Usage:

```javascript
const libR = require('lib-r-math.js');
const digits4 = libR.R.numberPrecision(4);

//1
precision(1.12345678);
//1.123

//2
precision([0.4553, -2.1243]);
//[ 0.4553, -2.124 ]
```

### `any`

Test a Predicate for each element in an Array. Returns true or false depending on a test function.

Usage:

```javascript
const libR = require('lib-r-math.js');
const any = libR.R.any;

//1
any([1, 2, 3, 4])(x => x < 2);
//true

//2
any([1, 2, 3, 4])(x => x > 5);
//false
```

### `arrayrify`

Mimics R vectorized function arguments. Wraps an existing function changing the first first argument to accept both scalar (number) or an array( number[] ).

_Note: Only the first argument is vectorized_

_decl_

```typescript
declare function arrayrify<T, R>(fn: (x: T, ...rest: any[]) => R);
```

#### R example

```R
# R console
# devide each vector element by 5
> c(1,2,3,4)/5
[1] 0.2 0.4 0.6 0.8
```

#### javascript equivalent

```javascript
 const libR = require('lib-r-math.js');
 const { arrayrify } = libR.R;

 // create vectorize "/" operator
 const div = arrayrify( (a, b) => a / b ) );

 div(3, 4); //0.75
 // Note: only the first function argument can be a vector
 div([3, 4, 5], 4); //[ 0.75, 1, 1.25 ]
```

### `flatten`

Recursively flatten all arguments (some possible arrays with possible nested arrays) into one single array.

_decl_

```typescript
function flatten<T>(...rest: (T | T[])[]): T[];
```

Example:

```javascript
const libR = require('lib-r-math.js');
const { flatten } = libR.R;

flatten(-1, 0, [1], 'r', 'b', [2, 3, [4, 5]]);
// [ -1, 0, 1, 'r', 'b', 2, 3, 4, 5 ]
```

### `forceToArray`

Return the first argument wrapped in an array. If it is already an array then returns a copy of the array.

_decl_

```typescript
function forceToArray<T>(x: T | T[]): T[];
```

Example:

```javascript
const libR = require('lib-r-math.js');
const { forceToArray } = libR.R;

forceToArray(3);
//[3]
forceToAray([4, 5]); // clones the array
//[4,5]
```

### `map`

Functional analog to `Array.prototype.forEach`, but also takes **non-array** arguments. The return type can be either an new array or a scalar (see `Example`)

_decl_

```typescript
function map<T>(xx: T): { (fn: (x: number) => number): number | number[] };
```

Example:

```javascript
const libR = require('lib-r-math.js');
const { map } = libR.R;

map(11)(v => v * 2);
//22

// single element array result are forced to return scalar
map([3])(v => v * 2);
//6

map([11, 12])(v => v * 2);
// [22, 24]
```

### `selector`

Filter function generator, to be used with `Array.prototype.filter` to pick elements based on their order (zero based index) in the array.
Usually used together with `seq` to pick items from an array.

**NOTE:** Always returns an instance of Array.

_decl_

```typescript
function selector(
  indexes: number | number[]
): { (val: any, index: number): boolean };
```

Example:

```javascript
const libR = require('lib-r-math.js');
const { selector } = libR.R;

['an', 'array', 'with', 'some', 'elements'].filter(
  selector([0, 2, 3]) // select values at these indexes
);
//[ 'an', 'with', 'some']

['an', 'array', 'with', 'some', 'elements'].filter(
  selector(3) // just one value at postion 3
);
//['some']
const seq = libR.R.seq()(); // see "seq" for defaults.

[7, 1, 2, 9, 4, 8, 16].filter(
  selector(
    seq(0, 6, 2) // creates an array [ 0, 2, 4, 6]
  )
);
// returns [7, 2, 4, 16]
```

### `seq`

_decl_

```typescript
const seq = (adjust = 0) => (adjustMin = adjust) => (
  start: number,
  end: number,
  step?: number
) => number[];
```

R analog to the `seq` function in R. Generates an array between `start` and `end` (inclusive) using `step` (defaults to `1`). The JS implementation ignores the **sign** of the
`step` argument and only looks at its absolute value.

If `(end-start)/step` is not an exact integer, `seq` will not overstep the bounds while counting up (or down).

* `adjust`: If `end` >= `start` then `adjust` value is added to every element in the array.
* `adjustMin`: if `start` >= `end` then `adjustMin` value is added to every element in the array.

First we look how `seq` works in R.

_R_

```R
seq(1,3,0.5)
#[1] 1.0 1.5 2.0 2.5 3.0

seq(7,-2, -1.3)
#[1]  7.0  5.7  4.4  3.1  1.8  0.5 -0.8
```

_Equivalent in Javascript_

```javascript
const libR = require('lib-r-math.js');

let seqA = libR.R.seq()();

seqA(1, 5);
//[ 1, 2, 3, 4, 5 ]
seqA(5, -3);
//[ 5, 4, 3, 2, 1, 0, -1, -2, -3 ]

let seqB = libR.R.seq(1)(-2);

seqB(0, 4); //range will be adjusted with '1'
//[ 1, 2, 3, 4]
seqB(6, 5, 0.3); //range will be adjusted with '-2', step
//[ 4, 4.7, 4.4, 4.1 ]  will not overstep boundery '4'
```

# Uniform Pseudo Random Number Generators.

#### Summary

In 'R', the functions that generate random deviates of distributions (Example: Poisson (`rpois`), Student-t (`rt`), Normal (`rnorm`), etc) use uniform PRNG's directly or indirectly (as wrapped in a normal distributed PRNG). This section discusses the uniform distributed PRNG's that have been ported from R to JS.

## The 7 samurai of Uniform Random Number Generators

These PRNG classes can be used "stand alone", but mostly intended to be consumed
to generate random numbers with a particular distribution (like `Normal`,
`Gamma`, `Weibull`, `Chi-square` etc). Type in your R-console the command
`?RNGkind` for an overview.

All 7 uniform random generators have been ported and tested to yield exactly the
same as their R counterpart.

#### Improvements compared to R

In R it is impossible to use different types of uniform random generators at the
same time because of a global shared seed buffer. In our port every random
generator has its own buffer and can therefore be used at the same time.

#### General Usage

All uniform random generator export the same functions:

1. `init`: set the random generator seed. Same as R `set.seed()`
2. `seed (read/write property)`: get/set the current seed values as an array. Same as R `.Random.seed`.
3. `unif_random`: get a random value, same as `runif(1)` in R

#### "Mersenne Twister"

From Matsumoto and Nishimura (1998). A twisted GFSR with period `2^19937 - 1`
and equi-distribution in 623 consecutive dimensions (over the whole period). The
_`seed`_ is a 624-dimensional set of 32-bit integers plus a current position in
that set.

usage example:

```javascript
const libR = require('lib-r-math.js');
const {
  R: { seq, numberPrecision, forEach },
  rng: { MersenneTwister, timeseed }
} = libR.rng;

//helpers
const sequence = seq()();
const precision = numberPrecision(9); //9 digits accuracy

//example
const mt = new MersenneTwister(12345); // initialize with seed = 12345

//example
mt.init(timeseed()); // Use seed derived from system clock

//example
mt.init(0); // re-initialize with seed = 0

// show first 8 values of the seed buffer of the mt instance.
mt.seed.slice(0,8);
/*[ 624,   1280795612,  -169270483,  -442010614,  -603558397,  -222347416,
  1489374793, 865871222 ]
*/

const rmt1 = sequence(5).map(() => mt.unif_rand());
precision(rmt1);
//[ 0.8966972, 0.265508663, 0.3721239, 0.572853363, 0.90820779 ]
```

_Equivalent in R_

```R
RNGkind("Mersenne-Twister")
set.seed(0)

#show first 8 values of the seed buffer
.Random.seed[2:9]
#[1]        624 1280795612 -169270483 -442010614 -603558397 -222347416 1489374793
#[8]  865871222

runif(5)
#[1] 0.8966972 0.2655087 0.3721239 0.5728534
#[5] 0.9082078
```

#### "Wichmann-Hill"

The seed, is an integer vector of length 3, where each element is in `1:(p[i] - 1)`, where p is the length 3 vector of primes, `p = (30269, 30307, 30323)`. The
`Wichmann–Hill` generator has a cycle length of `6.9536e12 = ( 30269 * 30307 * 30323 )`, see Applied Statistics (1984) 33, 123 which corrects the original
article).

usage example:

```javascript
const libR = require('lib-r-math.js');
const { rng: { WichmannHill, timeseed }, R: { seq, numberPrecision } } = libR;

// some helpers
const sequence = seq()();
const precision = numberPrecision(9);

// Some options on seeding given below
const wh = new WichmannHill(1234); // initialize seed with 1234 on creation (default 0)
//
wh.init(timeseed()); // re-init seed with a random seed based on timestamp

wh.init(0); // re-init seed to zero
wh.seed; // show seed
//[ 2882, 21792, 10079 ]
const rwh1 = sequence(5).map(() => wh.unif_rand());
precision(rwh1);
//[ 0.462553151, 0.26582675, 0.57721078, 0.510793206, 0.337560559 ]
```

_in R console_:

```R
> RNGkind("Wichmann-Hill")
> set.seed(0)
> runif(5)
[1] 0.4625532 0.2658268 0.5772108 0.5107932
[5] 0.3375606
```

#### "Marsaglia-Multicarry"

A multiply-with-carry RNG is used, as recommended by George Marsaglia in his
post to the mailing list ‘sci.stat.math’. It has a period of more than 2^60 and
has passed all tests (according to Marsaglia). The seed is two integers (all
values allowed).

usage example:

```javascript
const libR = require('lib-r-math.js');
const {
  rng: { MarsagliaMultiCarry, timeseed },
  R: { seq, numberPrecision }
} = libR;

//usefull helpers
const sequence = seq()();
const precision = numberPrecision(9); //9 significant digits

// Some options on seeding given below
const mmc = new MarsagliaMultiCarry(1234); // use seed = 1234 on creation

mmc.init(timeseed());
mmc.init(0); // also, defaults to '0' if seed is not specified
mmc.seed;
//[ -835792825, 1280795612 ]

const rmmc = sequence(5).map(() => mmc.unif_rand());
precision(rmmc);
//[ 0.169153755, 0.53154353, 0.594605297, 0.233315406, 0.45765618 ]
```

_in R console_:

```R
> RNGkind("Marsaglia-Multicarry")
> set.seed(0)
# we cannot access the PRNG directly
# we need to use runif wrapper.
> runif(5)
[1] 0.1691538 0.5315435 0.5946053 0.2333154
[5] 0.4576562
```

#### "Super Duper"

Marsaglia's famous Super-Duper from the 70's. This is the original version which
does not pass the `MTUPLE` test of the `Diehard` battery. It has a period of about
4.6\*10^18 for most initial seeds. The seed is two integers (all values allowed
for the first seed: the second must be odd).

_We use the implementation by Reeds et al (1982–84)._

usage example:

```javascript
const libR = require('lib-r-math.js');
const { rng: { SuperDuper, timeseed }, R: { seq, numberPrecision } } = libR.rng;

//usefull helpers
const sequence = seq()();
const precision = numberPrecision(9); //9 significant digits

// Seeding possibilities shown below
const sd = new SuperDuper(1234); // use seed = 1234 on creation
sd.init(timeseed()); // re-initialize with random seed based on timestamp
sd.init(0); // re-initialize with seed = 0.
//
sd.seed;
//[ -835792825, 1280795613 ]

const rsd1 = sequence(5).map(() => sd.unif_rand());
precision(rsd1);
//[ 0.640403562, 0.592731255, 0.412968712, 0.187729399, 0.267905811 ]
```

_in R console_:

```R
> RNGkind("Super-Duper")
> set.seed(0)
> runif(5)
[1] 0.6404036 0.5927313 0.4129687 0.1877294
[5] 0.2679058
```

#### "Knuth TAOCP"

An earlier version from Knuth (1997).

The 2002 version was not backwards compatible with the earlier version: the
initialization of the GFSR from the seed was altered. R did not allow you to
choose consecutive seeds, the reported ‘weakness’, and already scrambled the
seeds.

usage example:

```javascript
const libR = require('lib-r-math.js');
const { rng: { KnuthTAOCP, timeseed }, R: { seq, numberPrecision } } = libR.rng;

//usefull helpers
const sequence = seq()();
const precision = numberPrecision(9); //9 significant digits

// Seeding possibilities shown below
const kn97 = new KnuthTAOCP(1234); // use seed = 1234 on creation
kn97.init(timeseed()); // re-initialize with random seed based on timestamp
kn97.init(0); // re-initialize with seed = 0.

kn97.seed;
// 101 unsigned integer array, only shown the first few values
/*[ 673666444,
  380305043,
  1062889978,
  926003693,
 .
 .]*/

const rkn97 = sequence(5).map(() => kn97.unif_rand());
// limit precision to 9 digits
precision(rkn97);
//[ 0.627400767, 0.354186672, 0.989893431, 0.862408143, 0.662299205 ]
```

_in R console_:

```R
> RNGkind("Knuth-TAOCP")
> set.seed(0)
> runif(5)
[1] 0.6274008 0.3541867 0.9898934 0.8624081 0.6622992
```

#### "Knuth TAOCP 2002"

A 32-bit integer GFSR using lagged Fibonacci sequences with subtraction. That
is, the recurrence used is

```R
X[j] = (X[j-100] - X[j-37]) mod 2^30
```

and the ‘seed’ is the set of the 100 last numbers (actually recorded as 101
numbers, the last being a cyclic shift of the buffer). The period is around
2<sup>129</sup>.

usage example:

```javascript
const libR = require('lib-r-math.js');
const { rng: { KnuthTAOCP2002, timeseed }, R: { seq } } = libR.rng;

//helpers
const sequence = seq()();

// Seeding possibilities shown below
const kt2002 = new KnuthTAOCP2002(1234); // use seed = 1234 on creation

kt2002.init(timeseed()); //re-initialize with random seed based on timestamp

kt2002.init(0); //re-initialize with seed = 0
kt2002.seed;
// 101 unsigned integer array
//[ 481970911,
//  634898052,
//  994481106,
//  607894626,
//  1044251579,
//  763229919,
//  638368738,
// .
// .]
sequence(5).map(() => kt2002.unif_rand());
/*
[ 0.19581903796643027,
  0.7538668839260939,
  0.47241124697029613,
  0.19316043704748162,
  0.19501840975135573 ]
*/
```

_in R console_:

```R
> RNGkind("Knuth-TAOCP-2002")
> set.seed(0)
> runif(5)
[1] 0.1958190 0.7538669 0.4724112 0.1931604
[5] 0.1950184
```

#### "L'Ecuyer-CMRG":

A ‘combined multiple-recursive generator’ from L'Ecuyer (1999), each element of
which is a feedback multiplicative generator with three integer elements: thus
the seed is a (signed) integer vector of length 6. The period is around 2^191.

The 6 elements of the seed are internally regarded as 32-bit unsigned integers.
Neither the first three nor the last three should be all zero, and they are
limited to less than 4294967087 and 4294944443 respectively.

This is not particularly interesting of itself, but provides the basis for the
multiple streams used in package parallel.

usage example:

```javascript
const libR = require('lib-r-math.js');
const { rng: { LecuyerCMRG, timestamp }, R: { seq } } = libR.rng;

const sequence = seq()();
// Seeding possibilities shown below
const lc = new LecuyerCMRG(1234);

lc.init(timeseed()); //re-initialize with random seed based on timestamp

lc.init(0); //re-initialize with seed = 0
lc.seed;
/*
[ -835792825,
  1280795612,
  -169270483,
  -442010614,
  -603558397,
  -222347416 ]
*/
sequence(5).map(() => lc.unif_rand());
/*
[ 0.33292749227232266,
  0.890352617994264,
  0.1639634410628108,
  0.29905082406536015,
  0.3952390917599507 ]
*/
```

_in R console_:

```R
> RNGkind("L'Ecuyer-CMRG")
> set.seed(0)
> .Random.seed[2:7]  #show the seeds
[1] -835792825 1280795612 -169270483 -442010614
[5] -603558397 -222347416

#pick 6 random numbers
#same numbers as generated in javascript
> runif(5)
[1] 0.3329275 0.8903526 0.1639634 0.2990508
[5] 0.3952391
```

## Normal distributed Random Number Generators.

#### Summary

In 'R', the functions that generate random deviates of distributions (Example: Poisson (`rpois`), Student-t (`rt`), Normal (`rnorm`), etc) use uniform PRNG's directly or indirectly (as wrapped in a normal distributed PRNG). This section discusses the `normal distributed PRNG's` that have been ported from R to JS.

All 6 `normal random generators` have been ported and tested to yield exactly the
same as their R counterpart.

#### General Use

All normal random generator adhere to the same principles:

1. A constructor that takes an instance of a uniform PRNG as an argument
2. `unif_random`: get a random value, same as `rnorm(1)` in R
3. We adhere to the `R` default for _uniform_ PRNG when none is explicitly specified: `Mersenne-Twister`.
4. All PRNG producing normal variates are packaged under the name space `rng.normal`.

#### "Ahrens Dieter"

Ahrens, J. H. and Dieter, U. (1973) Extensions of Forsythe's method for random
sampling from the normal distribution. Mathematics of Computation 27, 927-937.

example usage:

```javascript
const libR = require('lib-r-math.js');

//helper
const sequence = libR.R.seq()();

// explicit specify uniform PRNG
const sd = new libR.rng.SuperDuper(0);
const ad1 = new libR.rng.normal.AhrensDieter(sd);

// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(9987);

// uses default: new MersenneTwister(0)
const ad2 = new libR.rng.normal.AhrensDieter();

// some helpers

const seq =
  // reference to uniform PRNG under rng property
  ad2.rng.init(0);
// bleed the normal PRNG
sequence(5).map(() => ad2.norm_rand());
/*
[
  -1.1761675317838745,
  0.674117731642815,
  1.0641435248508742,
  -0.1438972977736321,
  -1.2311497987786715
]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
ad2.unif_rand();
//0.2016819310374558
ad2.rng.unif_rand();
//0.8983896849676967
```

_in R console_

```R
> RNGkind("Mersenne-Twister",normal.kind="Ahrens-Dieter")
> set.seed(0)
> rnorm(5)
[1] -1.1761675  0.6741177  1.0641435 -0.1438973
[5] -1.2311498
> runif(2)
[1] 0.2016819 0.8983897
```

#### Box Muller

Box, G. E. P. and Muller, M. E. (1958) A note on the generation of normal random
deviates. Annals of Mathematical Statistics 29, 610–611.

The Box Muller has an internal state that is reset if the underlying uniform RNG
is reseted with `init`.

example usage:

```javascript
const libR = require('lib-r-math.js');
//helper
const sequence = libR.R.seq()();

// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const sd = new libR.rng.SuperDuper(0);
const bm1 = new libR.rng.normal.BoxMuller(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const bm2 = new libR.rng.normal.BoxMuller();

// reference to uniform PRNG under rng property
bm2.rng.init(0);
// bleed the normal PRNG
sequence(5).map(() => bm2.norm_rand());
/*
[ 1.2973875806285824,
  -0.9843785268998223,
  -0.7327988667466062,
  0.7597741978326533,
  1.4999887567977666 ]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
bm2.unif_rand();
//0.8983896849676967
bm2.rng.unif_rand();
//0.9446752686053514
```

_in R console_

```R
> RNGkind("Mersenne-Twister",normal.kind="Box-Muller")
> set.seed(0)
> rnorm(10)
[1]  1.2973876 -0.9843785 -0.7327989  0.7597742
[5]  1.4999888
> runif(2)
[1] 0.8983897 0.9446753
```

#### Buggy Kinderman Ramage

Kinderman, A. J. and Ramage, J. G. (1976) Computer generation of normal random variables. Journal of the American Statistical Association 71, 893-896.

The Kinderman-Ramage generator used in versions prior to 1.7.0 (now called "Buggy") had several approximation errors and should only be used for reproduction of old results.

example usage:

```javascript
const libR = require('lib-r-math.js');

//helper
const sequence = libR.R.seq()();

// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const sd = new libR.rng.SuperDuper(0);
const bkm1 = new libR.rng.normal.BuggyKindermanRamage(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const bkm2 = new libR.rng.normal.BuggyKindermanRamage();

// reference to uniform PRNG under rng property
bkm2.rng.init(0);
// bleed the normal PRNG
sequence(5).map(() => bkm2.norm_rand());
/*
[ 0.3216151001162507,
  1.2325156080942392,
  0.28036952823392824,
  -1.1751964095317355,
  -1.6047136089275855 ]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
bkm2.unif_rand();
//0.17655675252899528
bkm2.rng.unif_rand();
//0.6870228466577828
```

_in R Console_

```R
> RNGkind("Mersenne-Twister",normal.kind="Buggy")
> set.seed(0)
> rnorm(5)
[1]  0.3216151  1.2325156  0.2803695 -1.1751964
[5] -1.6047136
> runif(2)
[1] 0.1765568 0.6870228
```

#### Inversion

Inverse transform sampling [wiki](https://en.wikipedia.org/wiki/Inverse_transform_sampling)

example usage:

```javascript
const libR = require('lib-r-math.js');
// Possible to arbitraty uniform PRNG source (example: SuperDuper)

//helper
const sequence = libR.R.seq()();

const sd = new libR.rng.SuperDuper(0);
const inv1 = new libR.rng.normal.Inversion(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const inv2 = new libR.rng.normal.Inversion();

// reference to uniform PRNG under rng property
inv2.rng.init(0);
// bleed the normal PRNG
sequence(5).map(() => inv2.norm_rand());
/*
[ 1.2629542848807933,
  -0.3262333607056494,
  1.3297992629225006,
  1.2724293214294047,
  0.4146414344564082 ]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
inv2.unif_rand();
//0.061786270467564464
inv2.rng.unif_rand();
//0.20597457489930093
```

_in R console_

```R
> RNGkind("Mersenne-Twister",normal.kind="Inversion")
> set.seed(0)
> rnorm(5)
[1]  1.2629543 -0.3262334  1.3297993  1.2724293
[5]  0.4146414
> runif(2)
[1] 0.06178627 0.20597457
```

#### Kinderman Ramage

Kinderman, A. J. and Ramage, J. G. (1976) Computer generation of normal random variables. Journal of the American Statistical Association 71, 893-896.

_Non "buggy" version_

example usage:

```javascript
const libR = require('lib-r-math.js');
// Possible to arbitraty uniform PRNG source (example: SuperDuper)

//helper
const sequence = libR.R.seq()();

const sd = new libR.rng.SuperDuper(0);
const km1 = new libR.rng.normal.KindermanRamage(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const km2 = new libR.rng.normal.KindermanRamage();

// reference to uniform PRNG under rng property
km2.rng.init(0);
// bleed the normal PRNG
sequence(5).map(() => km2.norm_rand());
/*
[ 0.3216151001162507,
  1.2325156080972606,
  0.28036952823499206,
  -1.1751964095317355,
  -1.6047136089272598 ]
*/
// its possible to bleed the uniform PRNG from the normal PRNG
km2.unif_rand();
//0.17655675252899528
km2.rng.unif_rand();
//0.6870228466577828
```

_in R console_

```R
> RNGkind("Mersenne-Twister",normal.kind="Kinder")
> set.seed(0)
> rnorm(5)
[1]  0.3216151  1.2325156  0.2803695 -1.1751964
[5] -1.6047136
> runif(2)
[1] 0.1765568 0.6870228
>
```

## Canonical distributions

#### Summary

In the Section [1](#uniform-pseudo-random-number-generators)
and [2](#normal-distributed-random-number-generators)
we discussed uniform and normal PRNG classes. These classes can be used by themselves but mostly intended to be consumed to generate
random numbers with a particular distribution (like `Uniform`, `Normal`, `Gamma`,
`Weibull`, `Chi-square` etc).

\_It is also possible to provide your own uniform random source (example: real
random numbers fetched from services over the net). It is straightforward to create new PNRG (either uniform or normal). Review existing PRNG codes for examples.

### Uniform distribution

`dunif, qunif, punif, runif`

R documentation [here](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Uniform.html)

These functions are created with the factory method `Uniform` taking as argument a uniform PRNG (defaults to (Mersenne-Twister)[#mersenne-twister]).

Usage:

```javascript
const libR = require('lib-r-math.js');

// get the suite of functions working with uniform distributions
const { Uniform, rng } = libR;
const { SuperDuper } = libR.rng;

//Create Uniform family of functions using "SuperDuper"
const uni1 = Uniform(new SuperDuper(0));

// Create Uniform family of functions using default "Mersenne-Twister"
const uni2 = Uniform();

// functions exactly named as in `R`
const { runif, dunif, punif, qunif } = uni2;
```

#### `dunif`

The density function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/uniform.html)

_decl_

```typescript
function dunif(
  x: number | number[],
  min = 0,
  max = 1,
  giveLog = false
): number | number[];
```

* `x`: scalar or vector of quantiles
* `min, max` lower and upper limits of the distribution. Must be finite.
* `logP` if `true`, probabilities p are given as log(p).

Example:

```javascript
const libR = require('lib-r-math.js');
const uni = libR.Uniform(); // use default Mersenne-Twister PRNG
const { runif, dunif, punif, qunif } = uni;

dunif([-1, 0, 0.4, 1, 2]);
// [ 0, 1, 1, 1, 0 ]  Everythin is 1 for inputs between 0 and 1
dunif([-1, 0, 0.4, 1, 2], 0, 2);
// [ 0, 0.5, 0.5, 0.5, 0.5 ]
dunif([-1, 0, 0.4, 1, 2], 0, 2, true);
/*[
  -Infinity,
  -0.6931471805599453,
  -0.6931471805599453,
  -0.6931471805599453,
  -0.6931471805599453
  ]
  */
```

#### `punif`

The distribution function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/uniform.html)

_decl_

```typescript
function punif(
  q: number | number[],
  min = 0,
  max = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `x`: scalar or vector of quantiles
* `min, max` lower and upper limits of the distribution. Must be finite.
* `lowerTail` if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP` if `true`, probabilities p are given as log(p).

Example:

```javascript
const libR = require('lib-r-math.js');
const uni = libR.Uniform(); // use default Mersenne-Twister PRNG
const { runif, dunif, punif, qunif } = uni;

punif(0.25);
// 0.25

punif([-2, 0.25, 0.75, 2]);
// 0, 0.25, 0.75, 1

punif([-2, 0.25, 0.75, 2], 0, 1, false);
// 1, 0.75, 0.25, 0

punif([-2, 0.25, 0.75, 2], 0, 2, false, true);
//[ 0, -0.13353139262452263, -0.4700036292457356, -Infinity ]

punif([-2, 0.25, 0.75, 2], 0, 2, false, true);
//[ 0, -0.13353139262452263, -0.4700036292457356, -Infinity ]
```

#### `qunif`

The quantile function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/uniform.html)

_decl_

```typescript
function qunif(
  p: number | number[],
  min = 0,
  max = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: scalar or vector of quantiles
* `min, max` lower and upper limits of the distribution. Must be finite.
* `lowerTail` if `true` (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP` if `true`, probabilities p are given as log(p).

Example:

```javascript
const libR = require('lib-r-math.js');
const uni = libR.Uniform(); // use default Mersenne-Twister PRNG
const { runif, dunif, punif, qunif } = uni;

qunif(0);
//0
qunif([0, 0.1, 0.5, 0.9, 1], -1, 1, false);
//[ 1, 0.8, 0, -0.8, -1 ]

const { arrayrify } = libR.R;
const log = arrayrify(Math.log);

qunif(log([0, 0.1, 0.5, 0.9, 1]), -1, 1, false, true);
//[ 1, 0.8, 0, -0.8, -1 ]
```

#### `runif`

Generates random deviates. See [doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Uniform.html)

_decl_

```typescript
function runif(
  n: number = 1,
  min: number = 0,
  max: number = 1
): number | number[];
```

* `n`: number of deviates. Defaults to 1.
* `min, max` lower and upper limits of the distribution. Must be finite.

Example:

```javascript
const libR = require('lib-r-math.js');
const uni = libR.Uniform(); // use default Mersenne-Twister PRNG
const { runif, dunif, punif, qunif } = uni;

runif(4);
/*
[ 0.8966972001362592,
  0.2655086631421,
  0.37212389963679016,
  0.5728533633518964 ]
*/
runif(5, -1, 1, true);
/*
[ 0.8164155799895525,
  -0.5966361379250884,
  0.7967793699353933,
  0.8893505372107029,
  0.3215955849736929 ]
  */
```

_R console_ (exactly the same values for the same seed)

```R
> RNGkind("Mersenne")
> set.seed(0)
> runif(4)
[1] 0.8966972 0.2655087 0.3721239
[4] 0.5728534
> runif(5,-1,1)
[1]  0.8164156 -0.5966361  0.7967794
[4]  0.8893505  0.3215956
```

### Normal distribution

`dnorm, qnorm, pnorm, rnorm`

R documentation [here](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html).
These functions are created with the factory method `Normal` taking as argument an optional _normal PRNG_ (defaults to [Inversion](#inversion).

Usage:

```javascript
const libR = require('lib-r-math.js');

// get the suite of functions working with uniform distributions
const { Normal } = libR;
const { normal: { BoxMuller }, SuperDuper } = libR.rng;

//Create Normal family of functions using "BoxMuller" feeding from "SuperDuper"
const norm1 = Normal(new BoxMuller(new SuperDuper(0)));

// using the default "Inversion" feeding from "Mersenne-Twister".
const norm2 = Normal(); //

// functions exactly named as in `R`
const { rnorm, dnorm, pnorm, qnorm } = norm2;
```

#### `dnorm`

The density function of the [Normal distribution](). See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html)

_decl_

```typescript
function dnorm(
  x: number | number[],
  mu = 0,
  sigma = 1,
  giveLog = false
): number | number[];
```

* `x`:scalar or array of quantiles
* `mu`: mean (default 0)
* `sigma`: standard deviation
* `giveLog`: give result as log value

```javascript
const libR = require('lib-r-math.js');
const { Normal } = libR;
const { seq } = libR.R;
const { rnorm, dnorm, pnorm, qnorm } = Normal();

dnorm(0); //standard normal density, max value at '0'
//0.3989422804014327
dnorm(3, 4, 2); // standard normal with mean=4 and sigma=2, value at 3
//0.17603266338214976
dnorm(-10); // course the gaussian is almost zero 10 sigmas from the mean
//7.69459862670642e-23
dnorm([-Infinity, Infinity, NaN, -4, -3, -2, 0, 1, 2, 3, 4]);
/*
[ 0,
  0,
  NaN,
  0.00013383022576488537,
  0.0044318484119380075,
  0.05399096651318806,
  0.3989422804014327,
  0.24197072451914337,
  0.05399096651318806,
  0.0044318484119380075,
  0.00013383022576488537 ]
*/
dnorm(
  seq(0)(0)(-4, 4), //[-4,-3,..., 4]
  2, //mu = 2
  1, //sigma = 1
  true //give return values as log
);
/*
[ -18.918938533204674,
  -13.418938533204672,
  -8.918938533204672,
  -5.418938533204673,
  -2.9189385332046727,
  -1.4189385332046727,
  -0.9189385332046728,
  -1.4189385332046727,
  -2.9189385332046727 ]
*/
```

_Equivalent in R_

```R
> dnorm(seq(-4,4),2, 1, TRUE)
[1] -18.9189385 -13.4189385
[3]  -8.9189385  -5.4189385
[5]  -2.9189385  -1.4189385
[7]  -0.9189385  -1.4189385
[9]  -2.9189385
```

#### `pnorm`

The distribution function of the [Normal distribution](). See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html)

_decl_

```typescript
function pnorm(
  q: number | number[],
  mu = 0,
  sigma = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `q`:scalar or array of quantiles
* `mu`: mean (default 0)
* `sigma`: standard deviation
* `lowerTail`: if `true` (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: give result as log value

```javascript
const libR = require('lib-r-math.js');
const { Normal, arrayrify } = libR;
const { rnorm, dnorm, pnorm, qnorm } = Normal();

pnorm(0);
//0.5
pnorm([-1, 0, 1]);
//[ 0.15865525393145705, 0.5, 0.8413447460685429 ]

pnorm([-1, 0, 1], 0, 1, false); // propability upper tail, reverse above result
//[ 0.8413447460685429, 0.5, 0.15865525393145705 ]

pnorm([-1, 0, 1], 0, 1, false, true); // probabilities as log(p)
//[ -0.17275377902344988, -0.6931471805599453, -1.8410216450092636 ]

// Above result is the same as
const log = arrayrify(Math.log);
log(pnorm([-1, 0, 1], 0, 1, false));
//[ -0.1727537790234499, -0.6931471805599453, -1.8410216450092636 ]
```

_in R console_

```R
> pnorm(-1:1, 0, 1, FALSE, TRUE)
[1] -0.1727538 -0.6931472 -1.8410216
```

#### `qnorm`

The quantile function of the [Normal distribution](). See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html])

_decl_

```typescript
function qnorm(
  p: number | number[],
  mu = 0,
  sigma = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: probabilities (scalar or array).
* `mu`: normal mean (default 0).
* `sigma`: standard deviation (default 1).
* `logP`: probabilities are given as log(p).

```javascript
const libR = require('lib-r-math.js');
const { Normal, arrayrify } = libR;
const { rnorm, dnorm, pnorm, qnorm } = Normal();

// Math.log will work on both scalar or an array
const log = arrayrify(Math.log);

qnorm(0);
//-Infinity

qnorm([-1, 0, 1]); // -1 makes no sense
//[ NaN, -Infinity, Infinity ]

qnorm([0, 0.25, 0.5, 0.75, 1], 0, 2); // take quantiles of 25%
//[ -Infinity, -1.3489795003921634, 0, 1.3489795003921634, Infinity ]

qnorm([0, 0.25, 0.5, 0.75, 1], 0, 2, false); // same but use upper Tail of distribution
//[ Infinity, 1.3489795003921634, 0, -1.3489795003921634, -Infinity ]

qnorm(log([0, 0.25, 0.5, 0.75, 1]), 0, 2, false, true); //
//[ Infinity, 1.3489795003921634, 0, -1.3489795003921634, -Infinity ]
```

_in R console_

```R
#R console
> qnorm( c( 0, 0.05, 0.25 ,0.5 , 0.75, 0.95, 1));
[1] -Inf -1.6448536 -0.6744898  0.0000000  0.6744898  1.6448536 Inf
```

#### `rnorm`

Generates random normal deviates. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html])

_decl_

```typescript
function rnorm(n = 1, mu = 0, sigma = 1): number | number[];
```

* `n`: number of deviates
* `mu`: mean of the distribution. Defaults to 0.
* `sigma`: standard deviation. Defaults to 1.

```javascript
const libR = require('lib-r-math.js');
const { Normal } = libR;

//default Mersenne-Twister/Inversion
const { rnorm, dnorm, pnorm, qnorm } = Normal();

rnorm(5);
/*[ 1.2629542848807933,
  -0.3262333607056494,
  1.3297992629225006,
  1.2724293214294047,
  0.4146414344564082 ]
*/
rnorm(5, 2, 3);
/*[ -2.619850125711128,
  -0.7857011041406143,
  1.1158386596283194,
  1.9826984817573892,
  9.213960166573852 ]
*/
```

Same values as in R

_in R console_

```R
> RNGkind("Mersenne-Twister",normal.kind="Inversion")
> set.seed(0)
> rnorm(5)
[1]  1.2629543 -0.3262334
[3]  1.3297993  1.2724293
[5]  0.4146414
> rnorm(5,2,3)
[1] -2.6198501 -0.7857011
[3]  1.1158387  1.9826985
[5]  9.2139602
>
```

## Other Probability Distributions

#### summary

`libRmath.so` contains 19 probability distributions (other then `Normal` and `Uniform`) with their specific density, quantile and random generators, all are ported and have been verified to yield the same output.

### Beta distribution

`dbeta, qbeta, pbeta, rbeta`

See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).
See [wiki](https://en.wikipedia.org/wiki/Beta_distribution).

These functions are members of an object created by the `Beta` factory method. The factory method needs an instance of a [normal PRNG](#normal-distributed-random-number-generators). Various instantiation methods are given below.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Beta, rng: { SuperDuper, normal: { BoxMuller } } } = libR;

// explicit use of PRNG's
const explicitB = Beta(new BoxMuller(new SuperDuper(0))); //

// got with defaults 'MersenneTwister" and "Inversion"
const defaultB = Beta();

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const { dbeta, pbeta, qbeta, rbeta } = defaultB;
```

#### `dbeta`

The density function of the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).

$$ \frac{\Gamma(a+b)}{Γ(a) Γ(b)} x^{(a-1)}(1-x)^{(b-1)} $$

_decl_

```typescript
function dbeta(
  x: number | number[],
  shape1: number,
  shape2: number,
  ncp = undefined,
  giveLog = false
): number | number[];
```

* `x`: scalar or array of quantiles. 0 <= x <= 1
* `shape1`: non-negative `a` parameter of the Beta distribution.
* `shape2`: non-negative `b` parameter of the Beta distribution.
* `ncp`: non centrality parameter. _Note: `undefined` is different then `0`_
* `Log`: return result as log(p)

```javascript
const libR = require('lib-r-math.js');
const { Beta, R: { numberPrecision } } = libR;

//helpers
const precision = numberPrecision(9);

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const { dbeta, pbeta, qbeta, rbeta } = Beta();

//1. ncp argument = 1
const d1 = dbeta(0.4, 2, 2, 1);
precision(d1);
//1.28724574

//2.
const d2 = dbeta(0.4, 2, 2, undefined, true);
precision(d2);
//0.364643114

//3
const d3 = dbeta(0.4, 2, 2, 1, true);
precision(d3);
//0.252504851

//4
const d4 = dbeta([0, 0.2, 0.4, 0.8, 1, 1.2], 2, 2);
precision(d4);
//[ 0, 0.96, 1.44, 0.96, 0, 0 ]
```

_in R Console_

```R
#1
dbeta(0.4,2,2, ncp=1)
#[1] 1.287246

#2
dbeta(0.4,2,2, log = TRUE)
#[1] 0.3646431

#3
dbeta(0.4,2,2, ncp=1, TRUE)
#[1] 0.2525049

#4
dbeta( c(-1,0,0.2,0.4,0.8,1,1.2), 2, 2, 1)
#[1] 0.0000000 0.0000000
#[3] 0.7089305 1.2872457
#[5] 1.2392653 0.0000000
#[7] 0.0000000
```

#### `pbeta`

The cumulative probability function of the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).

```typescript
function pbeta(
  q: number | number[],
  shape1: number,
  shape2: number,
  ncp?: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `p`: quantiles. 0 <= x <= 1
* `shape1`: non-negative `a` parameter of the Beta distribution.
* `shape2`: non-negative `b` parameter of the Beta distribution.
* `ncp`: non centrality parameter. _Note: `undefined` is different then `0`_
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `Log`: return probabilities as log(p)

```javascript
const libR = require('lib-r-math.js');
const { Beta, rng: { arrayrify, numberPrecision } } = libR;

//helpers
const precision = numberPrecision(9);
const log = arrayrify(Math.log); // Make Math.log accept/return arrays aswell as scalars

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const { dbeta, pbeta, qbeta, rbeta } = Beta();
const q = [0, 0.2, 0.4, 0.6, 0.8, 1];
//1.
const p1 = pbeta(0.5, 2, 5);
precision(p1);
//0.890625

//2.
const p2 = pbeta(0.5, 2, 5, 4);
precision(p2);
//0.63923843

//3.
const p3 = pbeta(q, 2, 5, 4);
precision(p3);
//[ 0, 0.106517718, 0.438150345, 0.813539396, 0.986024517, 1 ]

//4.
const p4 = pbeta(q, 2, 5, undefined);
precision(p4);
//[ 0, 0.345027474, 0.76672, 0.95904, 0.9984, 1 ]

//5. Same as 4
const p5 = pbeta(q, 2, 5, undefined, false).map(
  v => 1 - v
);
precision(p5);
//[ 0, 0.345027474, 0.76672, 0.95904, 0.9984, 1 ]

//6.
const p6 = pbeta(q, 2, 5, undefined, true, true);
precision(p6);
/*[
  -Infinity,     -1.06413123,    -0.265633603,
  -0.0418224949, -0.00160128137,  0
  ]*/

//7. Same as 6
const p7 = log(pbeta(q, 2, 5, undefined, true));
precision(p7);
/*[
  -Infinity,      -1.06413123,  -0.265633603,  -0.0418224949,
  -0.00160128137, 0 
  ]*/
```

_Equivalent in R_

```R
q = c(0, 0.2, 0.4, 0.6, 0.8, 1);

#1
pbeta(0.5, 2, 5);
#[1] 0.890625

#2
pbeta(0.5, 2, 5, 4)
#[1] 0.6392384

#3
pbeta(q, 2, 5, 4);
#[1] 0.0000000 0.1061302 0.4381503 0.8135394
#[5] 0.9860245 1.0000000

#4
pbeta(q, 2, 5);
#[1] 0.00000 0.34464 0.76672 0.95904 0.99840 1.00000

#5
1-pbeta(q, 2, 5,lower.tail = FALSE);
#[1] 0.00000 0.34464 0.76672 0.95904 0.99840 1.00000

#6
pbeta(q, 2, 5, log.p=TRUE)
#[1]         -Inf -1.065254885 -0.265633603
#[4] -0.041822495 -0.001601281  0.000000000

#7
log(pbeta(q, 2, 5, log.p=FALSE))
#[1]         -Inf -1.065254885 -0.265633603
#[4] -0.041822495 -0.001601281  0.000000000
```

#### `qbeta`

The quantile function of the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).

_decl_

```typescript
function qbeta(
  p: number | number[],
  shape1: number,
  shape2: number,
  ncp = undefined,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: quantiles (scalar or array).
* `shape1`: non-negative `a` parameter of the Beta distribution.
* `shape2`: non-negative `b` parameter of the Beta distribution.
* `ncp`: non centrality parameter. _Note: `undefined` is different then `0`_
* `lowerTail`: if TRUE (default), _probabilities_ are P[X ≤ x], otherwise, P[X > x].
* `Log`: return _probabilities_ as log(p).

```javascript
const libR = require('lib-r-math.js');
const { Beta, R: { arrayrify, numberPrecision } } = libR;
//helpers
const log = arrayrify(Math.log); // Make Math.log accept/return arrays aswell as scalars
const precision = numberPrecision(9);

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const { dbeta, pbeta, qbeta, rbeta } = Beta();

const p = [0, 0.25, 0.5, 0.75, 1];

//1. always zero, regardless of shape params, because 0 ≤ x ≤ 1.
qbeta(0, 99, 66);
//0

//2. take quantiles of 25%
const q2 = qbeta(p, 4, 5);
precision(q2);
//[ 0, 0.329083427, 0.440155205, 0.555486315, 1 ]

//3 ncp = 3
const q3 = qbeta(p, 4, 5, 3);
precision(q3);
//[ 0, 0.406861514, 0.521344641, 0.631881288, 1 ]

//4. ncp = undefined, lowerTail = false, logP=false(default)
const q4 = qbeta(p, 4, 5, undefined, false); //
//[ 1, 0.555486315, 0.440155205, 0.329083427, 0 ]

//5. same as [5] but, logP=true,
const q5 = qbeta(
  log(p), //uses log!!
  4,
  5,
  undefined,
  false,
  true
);
//[ 1, 0.555486315, 0.440155205, 0.329083427, 0 ]
```

_Equivalent in R_

```R
p = c(0,.25,.5,.75,1);
#1
qbeta(0,99,66)
#[1] 0

#2
qbeta(p, 4,5)
#[1] 0.0000000 0.3290834 0.4401552 0.5554863
#[5] 1.0000000

#3
qbeta(p, 4,5,3)
#[1] 0.0000000 0.4068615 0.5213446 0.6318813
#[5] 1.0000000

#4
qbeta(p, 4,5, lower.tail = FALSE)
#[1] 1.0000000 0.5554863 0.4401552 0.3290834
#[5] 0.0000000

#5
qbeta(  log(p)  ,4,5, lower.tail = FALSE, log.p=TRUE)
#[1] 1.0000000 0.5554863 0.4401552 0.3290834
#[5] 0.0000000
```

#### `rbeta`

Generates random deviates for the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).

_decl_

```typescript
function rbeta(
  n: number,
  shape1: number,
  shape2: number,
  ncp = 0 // NOTE: normally the default is "undefined", but not here
): number | number[];
```

* `n`: number of deviates
* `shape1`: non-negative `a` parameter of the Beta distribution.
* `shape2`: non-negative `b` parameter of the Beta distribution.
* `ncp`: non centrality parameter.

```javascript
const libR = require('lib-r-math.js');
const {
  Beta,
  rng: { MersenneTwister, normal: { Inversion } },
  R: { arrayrify, numberPrecision }
} = libR;

//helpers
const log = arrayrify(Math.log); //
const precision = numberPrecision(9);

//explicit, in this case, same as default Beta()
const mt = new MersenneTwister(0);
const { dbeta, pbeta, qbeta, rbeta } = Beta(new Inversion(mt));

//1.
const r1 = rbeta(5, 0.5, 0.5);
precision(r1);
/*[
  0.0130980476,  0.740050681,  0.0101117743,
  0.208547515,  0.995681818
  ]*/

//2.
const r2 = rbeta(5, 2, 2, 4);
precision(r2);
//[ 0.598004601, 0.784536402, 0.387142813, 0.657481009, 0.513053436 ]

//3. // re-initialize seed
ms.init(0);

//3
const r3 = rbeta(5, 2, 2);
precision(r3);
//[ 0.821727531, 0.408565459, 0.834884807, 0.615747052, 0.127467311 ]

//4.
const r4 = rbeta(5, 2, 2, 5);
//[ 0.598004601, 0.784536402, 0.387142813, 0.744442431, 0.513053436 ]
```

Same values as in R

_in R console_

```R
RNGkind("Mersenne-Twister",normal.kind="Inversion")
set.seed(0)

#1
rbeta(5, 0.5, 0.5)
#[1] 0.01309805 0.74005068 0.01011177 0.20854752 0.99568182

#2
rbeta(5, 2, 2, 4)
#[1] 0.5980046 0.7845364 0.3871428 0.6574810 0.5130534

set.seed(0)

#3
rbeta(5, 2, 2);
#[1] 0.8217275 0.4085655 0.8348848 0.6157471 0.1274673

#4
rbeta(5, 2, 2, 5);
#[1] 0.5980046 0.7845364 0.3871428 0.7444424 0.5130534
```

### Binomial distribution

`dbinom, qbinom, pbinom, rbinom`

See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Binomial.html) and [wiki](https://en.wikipedia.org/wiki/Binomial_distribution).

These functions are members of an object created by the `Binomial` factory method. The factory method needs an instance of a [normal PRNG](#normal-distributed-random-number-generators). Various instantiation methods are given below.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Binomial, rng: { LecuyerCMRG } } = libR;

// explicit use if PRNG
const lc = new LecuyerCMRG(0);
const explicitB = Binomial(lc);

//default, used "Inversion" and "MersenneTwister"
const defaultB = Binomial();

const { dbinom, pbinom, qbinom, rbinom } = defaultB;
```

#### `dbinom`

The density function of the [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Binomial.html)

$$p(x) = \frac{n!}{x!(n-x)!} p^{x} (1-p)^{n-x}$$

_decl_

```typescript
declare function dbinom(
  x: number,
  size: number,
  p: number,
  asLog = false
): number | number[];
```

* `x`: scalar or array of quantiles.
* `size`: number of trails
* `p`: probability of success.
* `asLog`: return result as log(p)

```javascript
const libR = require('lib-r-math.js');
const { Binomial, R: { numberPrecision } } = libR;

//helper
const precision = numberPrecision(9);

//Binomial()  uses Normal() as default argument,
const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//1. 2 successes out of 4 trials, with success probility 0.3
const d1 = dbinom(2, 4, 0.3);
precision(d1);
//0.2646

//2. same as [1], but results as log
const d2 = dbinom(2, 4, 0.3, true);
//-1.32953603

//3. all possibilities out of 4 trials
dbinom([0, 1, 2, 3, 4], 4, 0.3);
//[ 0.2401, 0.4116, 0.2646, 0.0756, 0.0081 ]

dbinom([0, 1, 2, 3, 4], 4, 0.3, true);
//[ -1.42669978, -0.887703275, -1.32953603, -2.582299, -4.81589122 ]
```

_in R Console_

```R
#1
dbinom(2,4,0.3)
#[1] 0.2646

#2
dbinom(2,4,0.3, TRUE)
#[1] -1.329536

#3
dbinom(c(0,1,2,3,4),4,0.3)
#[1] 0.2401 0.4116 0.2646 0.0756 0.0081

#4
dbinom(c(0,1,2,3,4),4,0.3, TRUE)
#[1] -1.4266998 -0.8877033 -1.3295360 -2.5822990
#[5] -4.8158912
```

#### `pbinom`

The cumulative probability function of the [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Binomial.html)

```typescript
declare function pbinom(
  q: number | number[],
  size: number,
  prob: number,
  lowerTail = true,
  logP = false
): number | number[];
```

* `q`: scalar or array of quantiles.
* `size`: number of trails
* `prob`: probability of success.
* `lowerTail`: if TRUE (default), _probabilities_ are P[X ≤ x], otherwise, P[X > x].
* `Log`: return result as log(p)

```javascript
const libR = require('lib-r-math.js');
const { Binomial, R: { numberPrecision } } = libR;

//helper
const precision = numberPrecision(9);

const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//1.
const p1 = pbinom(4, 4, 0.5);
//1

//2.
pbinom([0, 1, 2, 3, 4], 4, 0.5);
//[ 0.0625, 0.3125, 0.6875, 0.9375, 1 ]

//3.
pbinom([0, 1, 2, 3, 4], 4, 0.5, true);
//[ 0.0625, 0.3125, 0.6875, 0.9375, 1 ]

//4.
pbinom([0, 1, 2, 3, 4], 4, 0.5, false);
//[ 0.9375, 0.6875, 0.3125, 0.0625, 0 ]

//5.
pbinom([0, 1, 2, 3, 4], 4, 0.5, false, true);
/*[
  -0.0645385211,
  -0.374693449,
  -1.16315081,
  -2.77258872,
  -Infinity
]*/
```

_in R console_

```R
#1
pbinom(4, 4, 0.5)
#[1] 1

#2
pbinom(c(0, 1, 2, 3, 4), 4, 0.5)
#[1] 0.0625 0.3125 0.6875 0.9375 1.0000

#3
pbinom(c(0, 1, 2, 3, 4), 4, 0.5, TRUE)
#[1] 0.0625 0.3125 0.6875 0.9375 1.0000

#4
pbinom(c(0, 1, 2, 3, 4), 4, 0.5, FALSE, TRUE)
#[1] -0.06453852 -0.37469345 -1.16315081
#[4] -2.77258872        -Inf
```

#### `qbinom`

The quantile function of the [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Binomial.html)

_decl_

```typescript
declare function qbinom(
  p: number | number[],
  size: number,
  prob: number,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: scalar or array of quantiles.
* `size`: number of trails
* `prob`: probability of success.
* `lowerTail`: if TRUE (default), _probabilities_ are P[X ≤ x], otherwise, P[X > x].
* `LogP`: return result as log(p)

```javascript
const libR = require('lib-r-math.js');

const { Binomial, R: { arrayrify, numberPrecision } } = libR;

//helpers
const precision = numberPrecision(9);
const log = arrayrify(Math.log);

const { dbinom, pbinom, qbinom, rbinom } = Binomial();

const p = [0, 0.25, 0.5, 0.75, 1];

//1
qbinom(0.25, 4, 0.3);
//1

//2.
qbinom(p, 40, 0.3);
//[0 10 12 14 40]

//3.
qbinom(p, 40, 0.3, false);
//[ 40, 14, 12, 10, 0 ]

//4.  same as 3.
qbinom(log(p), 40, 0.3, false, true);
//[ 40, 14, 12, 10, 0 ]
```

_Equivalent in R_

```R
p = c(0,0.25,0.5,0.75,1);

#1
qbinom(.25,4,.3)
#[1] 1

#2
qbinom(p, 40,.3)
#[1]  0 10 12 14 40

#3
qbinom(p, 40,.3, FALSE)
#[1] 40 14 12 10  0

#4
qbinom(log(p), 40,.3, FALSE, TRUE)
#[1] 40 14 12 10  0
```

#### `rbinom`

Generates random beta deviates for the [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Binomial.html).

_decl_

```typescript
declare function rbinom(
  n: number,
  size: number,
  prop: number
): number | number[];
```

* `n`: number of deviates
* `size`: number of trails
* `prob`: probability of success.

```javascript
const libR = require('lib-r-math.js');

const { Binomial, rng: { KnuthTAOCP2002 }, R: { numberPrecision } } = libR;

//helpers
const precision = numberPrecision(9);

const kn = new KnuthTAOCP2002(0);
const { dbinom, pbinom, qbinom, rbinom } = Binomial(kn);

kn.init(1234);
//1.
rbinom(2, 40, 0.5);
//[ 24, 19 ]

//2.
rbinom(3, 20, 0.5);
//[ 11, 13, 13 ]

//3.
rbinom(2, 10, 0.25);
//[ 2, 2 ]
```

Same values as in R

_in R console_

```R
RNGkind("Knuth-TAOCP-2002")
set.seed(1234)

#1
rbinom(2, 40, 0.5);
#[1] 24 18

#2
rbinom(3, 20, 0.5);
#[1] 11 13 13

#3
rbinom(2, 10, 0.25);
#[1] 2 2
```

### Negative Binomial distribution

`dnbinom, pnbinom, qnbinom, rnbinom.`

See [R doc](https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html)
See [wiki]()

These functions are members of an object created by the `NegativeBinomial` factory function. The factory method needs an instance of a [normal PRNG](#normal-distributed-random-number-generators). Various instantiation methods are given below.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { NegativeBinomial, rng: { SuperDuper, normal: { BoxMuller } } } = libR;

//explicit specify PRNG's
const sd = new SuperDuper(0);
const explicitNB = NegativeBinomial(new BoxMuller(sd));

//default uses PRNG "Inverion" and "MersenneTwister"
const defaultNB = NegativeBinomial();

const { dnbinom, pnbinom, qnbinom, rnbinom } = defaultNB;
```

#### `dnbinom`

The density function of the [Negative Binomial distribution](wiki).

$$ \frac{Γ(x+n)}{Γ(n) x!} p^{n} (1-p)^{x} $$

See [R doc]
(https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).

_decl_

```typescript
declare function dnbinom(
  x: number | number[],
  size: number,
  prob?: number,
  mu?: number,
  asLog = false
): number | number[];
```

* `x`: non-negative integer quantiles. Number of failures before reaching `size` successes.
* `size`: target for number of successful trials, or dispersion parameter (the shape parameter of the gamma mixing distribution). Must be strictly positive, need not be integer.
* `prob`: probability of success in each trial. 0 < prob <= 1
* `mu`: alternative parametrization via mean: see [‘Details’ section]().
* `asLog`: if `true`, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { NegativeBinomial, R: { numberPrecision } } = libR;
//some helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9);

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

//some data
const x = seq(0, 10, 2);

//1.
const d1 = dnbinom(x, 3, 0.5);
precision(d1);
//[ 0.125, 0.1875, 0.1171875, 0.0546875, 0.0219726562, 0.00805664062 ]

//2. alternative presentation with `mu` = n*(1-p)/p
const d2 = dnbinom(x, 3, undefined, 3 * (1 - 0.5) / 0.5);
//[ 0.125, 0.1875, 0.1171875, 0.0546875, 0.0219726562, 0.00805664062 ]
```

_Equivalent in R_

```R
#1
dnbinom(0:10, size = 3, prob = 0.5)
# [1] 0.125000000 0.187500000 0.187500000
# [4] 0.156250000 0.117187500 0.082031250
# [7] 0.054687500 0.035156250 0.021972656
#[10] 0.013427734 0.008056641

#2
dnbinom(0:10, size = 3, mu = 3*(1-0.5)/0.5)
# [1] 0.125000000 0.187500000 0.187500000
# [4] 0.156250000 0.117187500 0.082031250
# [7] 0.054687500 0.035156250 0.021972656
# [10] 0.013427734 0.008056641
```

#### `pnbinom`

The gives the cumulative probability function of the [Negative Binomial distribution](https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).
See [R doc](https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).

_decl_

```typescript
 declare function pnbinom(
    q: number | number[],
    size: number,
    prob?: number,
    mu?: number,
    lowerTail = true
    logP =  false
  ): number|number[]
```

* `q`: non-negative integer quantiles.
* `size`: target for number of successful trials, or dispersion parameter (the shape parameter of the gamma mixing distribution). Must be strictly positive, need not be integer.
* `prob`: probability of success in each trial. 0 < prob <= 1
* `mu`: alternative parametrization via mean: see [‘Details’ section]().
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if `true`, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { NegativeBinomial, R: { numberPrecision } } = libR;
//some helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9);

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

//some data
const x = [0, 2, 3, 4, 6, Infinity];

//1.
const p1 = pnbinom(x, 3, 0.5);
precision(p1);
//[ 0.125, 0.5, 0.65625, 0.7734375, 0.91015625, 1 ]

//2. alternative presentation of 1 with mu = n(1-p)/p
const p2 = pnbinom(x, 3, undefined, 3 * (1 - 0.5) / 0.5);
precision(p2);
//[ 0.125, 0.5, 0.65625, 0.7734375, 0.91015625, 1 ]

//3
const p3 = pnbinom(x, 3, 0.5, undefined, false);
//[ 0.875, 0.5, 0.34375, 0.2265625, 0.08984375, 0 ]

//4
const p4 = pnbinom(x, 3, 0.5, undefined, false, true);
precision(p4);
/*[
  -0.133531393,  -0.693147181,  -1.06784063,
  -1.48473443,   -2.40968323,   -Infinity ]*/
```

_Equivalent in R_

```R
#1
pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5)
#[1] 0.1250000 0.5000000 0.6562500 0.7734375
#[5] 0.9101562 1.0000000

#2
pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, mu=3*(1-0.5)/0.5)
#[1] 0.1250000 0.5000000 0.6562500 0.7734375
#[5] 0.9101562 1.0000000

#3
pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5, lower.tail=FALSE);
#[1] 0.87500000 0.50000000 0.34375000 0.22656250 0.08984375
#[6] 0.00000000

#4
pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5, lower.tail=FALSE, log.p=TRUE);
#[1] -0.1335314 -0.6931472 -1.0678406 -1.4847344 -2.4096832
#[6]       -Inf
```

#### `qnbinom`

The quantile function of the
[Negative Binomial distribution]
(https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).
See [R doc](https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).

_decl_

```typescript
declare function qnbinom(
  p: number | number[],
  size: number,
  prob?: number,
  mu?: number,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: probabilities (scalar or array).
* `size`: target for number of successful trials, or dispersion parameter (the shape parameter of the gamma mixing distribution). Must be strictly positive, need not be integer.
* `prob`: probability of success in each trial. 0 < prob <= 1
* `mu`: alternative parametrization via mean: see [‘Details’ section]().
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if `true`, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { NegativeBinomial, R: { numberPrecision } } = libR;
//some helpers
const precision = numberPrecision(9);
const log = arrayrify(Math.log);

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

//some data
const x = [0, 2, 3, 4, 6, Infinity];

//1. inversion
const q1 = qnbinom(pnbinom(x, 3, 0.5), 3, 0.5);
//[ 0, 2, 4, 6, Infinity ]

//2. lowerTail=false
const q2 = qnbinom(pnbinom(x, 3, 0.5), 3, 0.5, undefined, false);
//[ 6, 2, 1, 0, 0 ]

//3. with logP=true
const q3 = qnbinom(log(pnbinom(x, 3, 0.5)), 3, 0.5, undefined, false, true);
//[ 6, 2, 1, 0, 0 ]
```

_Equivalent in R_

```R
#1
qnbinom(pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5 ),3,0.5);
#[1] 0 2 3 4 6 Inf

#2
qnbinom(pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5 ),3,0.5, lower.tail = FALSE);
#[1] 6 2 2 1 0 0

#3
qnbinom(log(pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5 )),3,0.5, lower.tail = FALSE, log.p = TRUE);
#[1] 6 2 2 1 0 0
```

#### `rnbinom`

Generates random deviates for the
[Negative binomial distribution]
(https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).
See [R doc](https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).

_decl_

```typescript
declare function rnbinom(
  n: number,
  size: number,
  prob: number
): number | number[];
```

* `n`: ensemble size.
* `size`: target of successful trials.
* `prob`: probability of success in each trial. 0 < prob <= 1

Usage:

```javascript
const {
  NegativeBinomial,
  R: { numberPrecision, arrayrify },
  rng: { SuperDuper, normal: { BoxMuller } }
} = libR;
//some helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9);
const log = arrayrify(Math.log);

//explicit use of PRNG
const sd = new SuperDuper(12345);
const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial(
  new BoxMuller(sd)
);

//1. size = 100, prob=0.5, so expect success/failure to be approximatly equal
rnbinom(7, 100, 0.5);
//[ 94, 81, 116, 101, 71, 112, 85 ]

//2. size = 100, prob=0.1, so expect failure to be approx 10 x size
rnbinom(7, 100, 0.1);
//[ 889, 747, 1215, 912, 1105, 993, 862 ]

//3. size = 100, prob=0.9, so expect failure to be approx 1/10 x size
rnbinom(7, 100, 0.9);
//[ 9, 14, 12, 18, 15, 14, 7 ]

//4
sd.init(98765); //reset
rnbinom(7, 100, undefined, 100 * (1 - 0.5) / 0.5);
//[ 87, 120, 113, 107, 87, 95, 88 ]
```

_Equivalent in R_

```R
RNGkind("Super-Duper", normal.kind="Box-Muller")
set.seed(12345);

#1
rnbinom(7, 100, 0.5);
#[1] 109  95  89 112  88  90  90

#2
rnbinom(7, 100, 0.1);
#[1]  989 1004  842  974  820  871  798

#3
rnbinom(7, 100, 0.9);
#[1] 10 14  9  7 12 11 10

#4
set.seed(98765)
rnbinom(7,100, mu= 100*(1-0.5)/0.5)
#[1]  87 120 113 107  87  95  88
```

### Cauchy distribution

`dcauchy, qcauchy, pcauchy, rcauchy`

See [R doc](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html). See [wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)

These functions are members of an object created by the `Cauchy` factory method. The factory method needs as optional argument an instance of one of the [uniform PRNG](#uniform-pseudo-random-number-generators) generators.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Cauchy, rng: { WichmannHill } } = libR;

//explcit use of PRNG
const wh = new WichmannHill(1234);
const explicitC = Cauchy(wh);

//default, uses MersenneTwister
const defaultC = Cauchy();

const { dcauchy, pcauchy, qcauchy, rcauchy } = defaultC;
```

#### `dcauchy`

The density function of the [The Cauchy density](https://en.wikipedia.org/wiki/Cauchy_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html).

Lemma formula: `s` is the _"scale"_ parameter and `l` is the _"location"_ parameter.

$$ f(x) = \frac{1}{ π s (1 + ( \frac{x-l}{s} )^{2}) } $$

_decl_

```typescript
declare function dcauchy(
  x: number | number[],
  location = 0,
  scale = 1,
  asLog = false
): number | number[];
```

* `x`: scalar or array of quantile(s).
* `location`: the location parameter.
* `scale`: the scale parameter.
* `asLog`: return values as log(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Cauchy, R: { numberPrecision } } = libR;

// some usefull tools
const seq = libR.R.seq()();
const precision = numberPrecision(9);

// initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();

//data
const x = seq(-4, 4, 2);

//1.
const d1 = dcauchy(x, -2, 0.5);
precision(d1);
/*[
  0.0374482219,  0.636619772,  0.0374482219,
  0.00979415034,  0.00439048119 ]*/

//2.
const d2 = dcauchy(x, -2, 0.5, true);
precision(d2);
/*[
  -3.28479605,  -0.451582705,  -3.28479605,
  -4.62596998,  -5.42831645 ]*/

//3.
const d3 = dcauchy(x, 0, 2);
precision(d3);
/*[
  0.0318309886,  0.0795774715,  0.159154943,
  0.0795774715,  0.0318309886 ]*/
```

_Equivalent in R_

```R
x=seq(-4,4,2);

#1
dcauchy(seq(-4,4,2), location=-2, scale=0.5);
#[1] 0.037448222 0.636619772 0.037448222 0.009794150 0.004390481

#2
dcauchy(seq(-4,4,2), location=-2, scale=0.5, log=TRUE);
#[1] -3.2847960 -0.4515827 -3.2847960 -4.6259700 -5.4283164

#3
dcauchy(seq(-4,4,2), location=0, scale=2);
#[1] 0.03183099 0.07957747 0.15915494 0.07957747 0.03183099
```

#### `pcauchy`

The cumulative probability function of the [Cauchy distribution](https://en.wikipedia.org/wiki/Cauchy_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html).

_decl_

```typescript
declare function pcauchy(
  q: T,
  location = 0,
  scale = 1,
  lowerTail = true,
  logP = false
): T;
```

* `q`: Scalar or array of quantile(s).
* `location`: The location parameter.
* `scale`: The scale parameter.
* `lowerTail`: If TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: If TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Cauchy, R: { numberPrecision } } = libR;

// some usefull tools
const seq = libR.R.seq()();
const precision = numberPrecision(9);

// initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();
//data
const x = seq(-4, 4, 2);

//1
const p1 = pcauchy(x, -2, 0.5);
precision(p1);
//[ 0.0779791304, 0.5, 0.92202087, 0.960416576, 0.973535324 ]

//2.
const p2 = pcauchy(x, -2, 0.5, true, true);
precision(p2);
/*[
  -2.55131405,  -0.693147181,  -0.0811874205,
  -0.0403881555,-0.0268211693 ]*/

//3.
const p3 = pcauchy(x, 0, 2);
precision(p3);
//[ 0.147583618, 0.25, 0.5, 0.75, 0.852416382 ]
```

_Equivalent in R_

```R
x=seq(-4,4,2)

#1
pcauchy(seq(-4,4,2), location=-2, scale=0.5);
#[1] 0.07797913 0.50000000 0.92202087 0.96041658 0.97353532

#2
pcauchy(seq(-4,4,2), location=-2, scale=0.5, log=TRUE);
#[1] -2.55131405 -0.69314718 -0.08118742 -0.04038816 -0.02682117

#3
pcauchy(seq(-4,4,2), location=0, scale=2);
#[1] 0.1475836 0.2500000 0.5000000 0.7500000 0.8524164
```

#### `qcauchy`

The quantile function of the [Cauchy distribution](https://en.wikipedia.org/wiki/Cauchy_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html).

_decl_

```typescript
declare function qcauchy(
  p: number | number[],
  location = 0,
  scale = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: Scalar or array of probabilities(s).
* `location`: The location parameter.
* `scale`: The scale parameter.
* `lowerTail`: If TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: If TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Cauchy, R: { numberPrecision } } = libR;

// some usefull tools
const seq = libR.R.seq()();
const precision = numberPrecision(9);

// initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();

// data
const x = seq(-4, 4, 2);

//1
const q1 = qcauchy(pcauchy(x, -2, 0.5), -2, 0.5);
precision(q1);
//[ -4, -2, -8.8817842e-16, 2, 4 ]

//2.
const q2 = qcauchy(pcauchy(x, -2, 0.5, false), -2, 0.5, false);
precision(q2);
//[ -4, -2, 0, 2, 4 ]

//3.
const q3 = qcauchy(pcauchy(x, 0, 2), 0, 2);
precision(q3);
//[ -4, -2, 0, 2, 4 ]
```

_Equivalent in R_

```R
x=seq(-4, 4, 2);

#1
qcauchy( pcauchy(x, -2, 0.5),  -2,  0.5 );
#[1] -4.000000e+00 -2.000000e+00 -8.881784e-16  2.000000e+00  4.000000e+00

#2
qcauchy(pcauchy(x, -2, 0.5, lower.tail=FALSE),  -2,  0.5, lower.tail=FALSE)
#[1] -4 -2  0  2  4

#3
qcauchy(pcauchy(x, 0, 2), 0, 2);
#[1] -4 -2  0  2  4
```

#### `rcauchy`

Generates random deviates from the [Cauchy distribution](https://en.wikipedia.org/wiki/Cauchy_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html).

_decl_

```typescript
declare function rcauchy(
  n: number,
  location = 0,
  scale = 1
): number | number[];
```

* `n`: number of deviates to generate.
* `location`: The location parameter.
* `scale`: The scale parameter.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Cauchy,
  rng: {
    MersenneTwister
  }
} = libR;
// some usefull tools

//initialize Cauchy
const sd = new SuperDuper(0);
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy(sd);

//1.
sd.init(43210);
const r1 = rcauchy(5, 0, 0.5);
//[ 0.0472614703, 0.577704013, 6.76536712, -0.0360997453, 0.719042522 ]

//2.
const r2 = rcauchy(5, 2, 2);
precision(r2);
//[ 3.19844084, 3.28147192, 1.24543133, 2.04599347, 3.5392328 ]

//3.
sd.init(9876);
const r3 = rcauchy(5, -2, 0.25);
precision(r3);
//[ -9.8223614, 3.25884168, -0.918724179, -1.7870667, -1.76212205 ]
```

_Equivalent in R_

```R
RNGkind("Super-Duper");
set.seed(43210)

#1
rcauchy(5, 0, 0.5);
#[1]  0.04726147  0.57770401  6.76536712 -0.03609975  0.71904252

#2
rcauchy(5, 2, 2);
#[1] 3.198441 3.281472 1.245431 2.045993 3.539233

#3
set.seed(9876)
rcauchy(5, -2, 0.25);
#[1] -9.8223614  3.2588417 -0.9187242 -1.7870667 -1.7621220
```

### Chi-Squared (non-central) Distribution

`dchisq, qchisq, pchisq, rchisq`

These functions are members of an object created by the `ChiSquared` factory method. The factory method needs as optional argument an instance of a [normal PRNG](#normal-distributed-random-number-generators). See [wiki](https://en.wikipedia.org/wiki/Chi-squared_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html)

Usage:

```javascript
const libR = require('lib-r-math.js');
const { ChiSquared, rng: { WichmannHill, normal: { AhrensDieter } } } = libR;

//uses as default: "Inversion" and "Mersenne-Twister"
const defaultChi = ChiSquared();

//uses explicit PRNG
const wh = new WichmannHill();
const explicitChi = ChiSquared(new AhrensDieter(wh));

const { dchisq, pchisq, qchisq, rchisq } = explicitChi;
```

#### `dchisq`

The [X<sup>2</sup>](https://en.wikipedia.org/wiki/Chi-squared_distribution) density function, see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

$$ f\_{n}(x) = \frac{1}{2^{\frac{n}{2}} Γ(\frac{n}{2})} x^{\frac{n}{2}-1} e^{\frac{-x}{2}} $$

_decl_

```typescript
declare function dchisq(
  x: number | number[],
  df: number,
  ncp?: number,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles (array or scalar).
* `df`: degrees of freedom.
* `ncp`: non centrality parameter.
* `asLog`: return probabilities as log(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const { ChiSquared, R: { precision } } = libR;

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

//helpers
const seq = libR.R.seq()();

//data
x = seq(0, 10, 2);

//1. df=5
const d1 = dchisq(x, 5);
precision(d1);
/*[
  0,                0.138369166,  0.143975911,  0.0973043467,
  0.0551119609,     0.0283345553 ]*/

//2. df=3, ncp=4
const d2 = dchisq(x, 3, 4);
precision(d2);
/*[
  0,            0.0837176564,  0.0997021125,  0.0901474176,
  0.070764993,  0.0507582667 ]*/

//3. df=3, ncp=4, log=true
const d3 = dchisq(x, 3, 4, true);
precision(d3);
/*[
  -Infinity,  -2.48030538,  -2.30556841,
  -2.40630898,-2.64839085,  -2.98068078 ]
*/
```

_Equivalent in R_

```R
x=seq(0, 10, 2);
#1
dchisq(x, 5);
#[1] 0.00000000 0.13836917 0.14397591 0.09730435 0.05511196 0.02833456

#2
dchisq(x, 3, 4);
#[1] 0.00000000 0.08371766 0.09970211 0.09014742 0.07076499 0.05075827

#3
dchisq(x, 3, 4, TRUE);
#[1]      -Inf -2.480305 -2.305568 -2.406309 -2.648391 -2.980681
```

#### `pchisq`

The [X<sup>2</sup>](https://en.wikipedia.org/wiki/Chi-squared_distribution) cumulative probability function, see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

_decl_

```typescript
declare function pchisq(
  q: number | number[],
  df: number,
  ncp?: number,
  lowerTail = true,
  logP = false
): number | number[];
```

* `q`: quantiles (array or scalar).
* `df`: degrees of freedom.
* `ncp`: non centrality parameter.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: return probabilities as log(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const { ChiSquared, R: { numberPrecision } } = libR;

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

const x = [...seq(0, 10, 2), Infinity];

//1.
const p1 = pchisq(x, 3);
precision(p1);
/*[
  0,            0.427593296,  0.73853587,  0.888389775,
  0.953988294,  0.981433865,  1 ]*/

//2. df=8, ncp=4, lowerTail=false
const p2 = pchisq(x, 8, 4, false);
precision(p2);
/*[ 1,            0.996262804,   0.96100264,  0.872268946,
    0.739243049,  0.587302859 ]*/

//3. df=8, ncp=4, lowerTail=true, logP=true
const p3 = pchisq(x, 8, 4, true, true);
precision(p2);
/*[
  -Infinity,  -5.58941966,  -3.24426132,
  -2.05782837,-1.34416653,  -0.885041269 ]*/
```

_Equivalent in R_

```R
x= c(seq(0, 10, 2), Inf);

#1
pchisq(x, 3);
#[1] 0.0000000 0.4275933 0.7385359 0.8883898 0.9814339 1.0000000

#2
pchisq(x, 8, 4, lower.tail=FALSE);
#[1] 1.0000000 0.9962628 0.9610026 0.8722689 0.5873029 0.0000000

#3
pchisq(x, 8, 4, lower.tail=FALSE, log.p=TRUE);
#[1]  0.000000000 -0.003744197 -0.039778123 -0.136657478 -0.532214649
#[6]         -Inf
```

#### `qchisq`

The [X<sup>2</sup>](https://en.wikipedia.org/wiki/Chi-squared_distribution) quantile function, see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

_decl_

```typescript
declare function qchisq(
  p: number | number[],
  df: number,
  ncp?: number,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: probabilities (array or scalar).
* `df`: degrees of freedom.
* `ncp`: non centrality parameter.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: probabilities are as log(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const { ChiSquared, R: { arrayrify, numberPrecision } } = libR;

//helpers
const seq = libR.R.seq()();
const log = arrayrify(Math.log);
const precision = numberPrecision(9);

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

// data
const x = seq(0, 1, 0.2);

//1. df=3,
const q1 = qchisq(x, 3);
precision(q1);
//[ 0, 1.00517401, 1.8691684, 2.94616607, 4.64162768, Infinity ]

//2. df=3, ncp=undefined, lowerTail=false
const q2 = qchisq(x, 50, undefined, false);
precision(q2);
//[ Infinity, 58.1637966, 51.8915839, 46.8637762, 41.4492107, 0 ]

//3. df=50, ncp=0, lowerTail=false, logP=true
const q3 = qchisq(log(x), 50, 0, false, true);
//[ Infinity, 58.1637966, 51.8915839, 46.8637762, 41.4492107, 0 ]
```

_Equivalence in R_

```R
#R-script
#data
x=seq(0, 1, 0.2);

#1
qchisq(x, 3);
#[1] 0.000000 1.005174 1.869168 2.946166 4.641628      Inf

#2
qchisq(x, 50, lower.tail=FALSE);
#[1]      Inf 58.16380 51.89158 46.86378 41.44921  0.00000

#3
qchisq(log(x), 50, 0, lower.tail=FALSE, log.p=TRUE);
#[1]      Inf 58.16380 51.89158 46.86378 41.44921  0.00000
```

#### `rchisq`

Creates random deviates for the [X<sup>2</sup> distribution](https://en.wikipedia.org/wiki/Chi-squared_distribution), see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

_decl_

```typescript
declare function rchisq(n: number, df: number, ncp?: number): number | number[];
```

* `p`: probabilities (array or scalar).
* `df`: degrees of freedom.
* `ncp`: non centrality parameter.

```javascript
const libR = require('lib-r-math.js');
const {
  ChiSquared,
  rng: {
    LecuyerCMRG:,
    normal: { AhrensDieter }
  },
  R: { arrayrify, numberPrecision }
} = libR;

//helpers
const seq = libR.R.seq()();
const log = arrayrify(Math.log);
const precision = numberPrecision(9);

//explicit use of PRNG
const lc = new LecuyerCMRG(0);
const { dchisq, pchisq, qchisq, rchisq } = ChiSquared(new AhrensDieter(lc));

//1
lc.init(1234);
const r1 = rchisq(5, 6);
precision(r1);
//[ 12.4101973, 6.79954177, 9.80911877, 4.64604085, 0.351985504 ]


//2. df=40, ncp=3
const r2 = rchisq(5, 40, 3);
precision(r2);
//[ 22.2010553, 44.033609, 36.3201158, 44.6212447, 40.1142555 ]


//3. df=20
const r3 = rchisq(5, 20);
precisio(r3);
//[ 24.4339678, 19.0379177, 26.6965258, 18.1288566, 26.7243317 ]
```

_Equivalent in R_

```R
RNGkind("L'Ecuyer-CMRG", normal.kind="Ahrens-Dieter")
set.seed(1234)

#1
rchisq(5, 6);
#[1] 12.4101973  6.7995418  9.8091188  4.6460409  0.3519855

#2
rchisq(5, 40, 3);
#[1] 22.20106 44.03361 36.32012 44.62124 40.11426

#3
rchisq(5, 20);
#[1] 24.43397 19.03792 26.69653 18.12886 26.72433
```

### Exponential Distribution

`dexp, qexp, pexp, rexp`

See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html)

These functions are members of an object created by the `Exponential` factory method. The factory method needs as optional argument an instance of an [uniform PRNG](#uniform-pseudo-random-number-generators) class.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Exponential, rng: { MarsagliaMultiCarry } } = libR;

//1. initialize default
const defaultExponential = Exponential();

//2. alternative: initialize with explicit uniform PRNG
const mmc = new MarsagliaMultiCarry(123456); //keep reference so we can do mt.init(...)
const customExponential = Exponential(mmc);

//get functions
const { dexp, pexp, qexp, rexp } = defaultExponential;
```

#### `dexp`

The [Exponential density function](https://en.wikipedia.org/wiki/Exponential_distribution), see [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html).

$$ f(x) = λ {e}^{- λ x} $$

_decl_

```typescript
declare function dexp(
  x: number | number[],
  rate: number = 1,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles (array or scalar).
* `rate`: the λ parameter.
* `asLog`: return probabilities as log(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Exponential, R: { numberPrecision } } = libR;

//helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9); //9 significant digits

const { dexp, pexp, qexp, rexp } = Exponential();

const x = seq(0, 0.3, 0.05);

//1
const d1 = dexp(x, 3);
precision(d1);
/*[ 3,          2.58212393, 2.22245466, 1.91288445,
    1.64643491, 1.41709966, 1.21970898 ]*/

//2.
const d2 = dexp(x, 3, true);
precision(d2);
/*[ 1.09861229,  0.948612289,  0.798612289, 0.648612289,
    0.498612289, 0.348612289,  0.198612289 ]*/

//3
const d3 = dexp(x, 0.2);
precision(d3);
/*[
    0.2,          0.198009967,  0.196039735,  0.194089107,
    0.192157888,  0.190245885,  0.188352907 ]*/
```

_Equivalent in R_

```R
x = seq(0, 0.3, 0.05);

#1
dexp(x, 3)
#[1] 3.000000 2.582124 2.222455 1.912884 1.646435 1.417100 1.219709

#2
dexp(x, 3, TRUE)
#[1] 1.0986123 0.9486123 0.7986123 0.6486123 0.4986123 0.3486123 0.1986123

#3
dexp(x, 0.2)
#[1] 0.2000000 0.1980100 0.1960397 0.1940891 0.1921579 0.1902459 0.1883529
```

#### `pexp`

The cumulative probability of the [Exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution), see [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html).

_decl_

```typescript
declare function pexp(
  q: number | number[],
  rate: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `q`: quantiles (array or scalar).
* `rate`: the λ parameter.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ q], otherwise, P[X > q].
* `logP`: return probabilities as log(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Exponential, R: { numberPrecision } } = libR;

//helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9);

const { dexp, pexp, qexp, rexp } = Exponential();

//data
const q = seq(0, 0.3, 0.05);

///1
const p1 = pexp(q, 3);
precision(p1);
/*[
  0,            0.139292024,  0.259181779,
  0.362371848,  0.451188364,  0.527633447,
  0.59343034
  ]*/

//2
const p2 = pexp(q, 7, false, true);
precision(p2);
//[ 0, -0.35, -0.7, -1.05, -1.4, -1.75, -2.1 ]

//3
const p3 = pexp(seq(0, 10, 2), 0.2);
precision(p3);
/*[
  0,            0.329679954,  0.550671036,
  0.698805788,  0.798103482,  0.864664717
  ]*/
```

_Equivalent in R_

```R
#data
q = seq(0, 0.3, 0.05);

#1
pexp(q, 3);
#[1] 0.0000000 0.1392920 0.2591818 0.3623718 0.4511884 0.5276334 0.5934303

#2
pexp(q, 7, FALSE, TRUE);
#[1]  0.00 -0.35 -0.70 -1.05 -1.40 -1.75 -2.10

#3
pexp(seq(0,10,2),0.2)
#[1] 0.0000000 0.3296800 0.5506710 0.6988058 0.7981035 0.8646647
```

#### `qexp`

The quantile function of the [Exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution), see [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html).

_decl_

```typescript
declare function qexp(
  p: number | number[],
  rate: number = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: probabilities (array or scalar).
* `rate`: the λ parameter.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: return probabilities as log(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Exponential, R: { arrayrify, numberPrecision } } = libR;

//helpers
const log = arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = numberPrecision(9);

const { dexp, pexp, qexp, rexp } = Exponential();

//data
const q = seq(0, 10, 2);
//1
const pp1 = pexp(q, 0.2);
const q1 = qexp(log(pp1), 0.2, true, true);
precision(q1);
//[ 0, 2, 4, 6, 8, 10 ]

//2
const pp2 = pexp(seq(0, 10, 2), 0.2);
const q2 = qexp(pp1, 0.2);
precision(q2);
//[ 0, 2, 4, 6, 8, 10 ]

//3
const pp3 = pexp(seq(0, 0.3, 0.05), 3);
const q3 = qexp(pp3, 3);
precision(q3);
//[ 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3 ]
```

_Equivalent in R_

```R
q = seq(0,10,2);

#1
pp1 = pexp(q,0.2);
qexp(log(pp1),0.2, TRUE, TRUE)
#[1]  0  2  4  6  8 10

#2
pp2 = pexp(q ,0.2);
qexp(pp2,0.2)
#[1]  0  2  4  6  8 10

#3
pp3 = pexp(seq(0, 0.3, 0.05), 3);
q3 = qexp(pp3,3)
#[1] 0.00 0.05 0.10 0.15 0.20 0.25 0.30
```

#### `rexp`

Creates random deviates for the [Exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution), see [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html).

_decl_

```typescript
declare function rexp(n: number, rate: number = 1): number | number[];
```

* `n`: number of deviates to generate (array or scalar).
* `rate`: the λ parameter.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Exponential, rng: { WichmannHill }, R: { numberPrecision } } = libR;

//helper
const precision = numberPrecision(9);

const wh = new WichmannHill(1234); //seed 1234
const { dexp, pexp, qexp, rexp } = Exponential(wh);

//1
wh.init(12345);
const r1 = rexp(5);
precision(r1);
//[ 0.189141121, 1.56731395, 3.80442336, 3.15394116, 2.66186551 ]

//2
const r2 = rexp(5, 0.1);
precision(r2);
//[ 6.23691783, 3.69025109, 4.06170046, 9.35617011, 17.9486493 ]

//3
const r3 = rexp(5, 3);
precision(r3);
//[ 0.103834413, 0.18975976, 0.329332554, 0.462307908, 0.426360565 ]
```

_Equivalent in R_

```R
RNGkind("Wichmann-Hill")
set.seed(12345)

#1
rexp(5)
#[1] 0.1891411 1.5673139 3.8044234 3.1539412 2.6618655

#2
rexp(5,0.1)
#[1]  6.236918  3.690251  4.061700  9.356170 17.948649

#3
rexp(5,3)
#[1] 0.1038344 0.1897598 0.3293326 0.4623079 0.4263606
```

### F (non-central) Distribution

`df, qf, pf, rf`

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html)

These functions are members of an object created by the `FDist` factory method. The factory method needs as optional argument an instance of one of the [normal PRNG's](#normal-distributed-random-number-generators).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  FDist,
  rng: {
    MersenneTwister,
    normal: { KindermanRamage }
  }
} = libR;

//1. initialize default
const defaultF = FDist();

//2. alternative: initialize with explicit uniform PRNG
const mt = new MersenneTwister(1234); //keep reference so we can do mt.init(...)
const customF = FDist(new KindermanRamage(mt));

//get functions
const { df, pf, qf, rf } = customF; // or use "defaultF"
```

#### `df`

The density function of the [F distribution](https://en.wikipedia.org/wiki/F-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html)

With `df1` and `df2` degrees of freedom:

$$ \large f(x) = \frac{ Γ(\frac{df1 + df2}{2}) } { Γ(\frac{df1}{2}) Γ(\frac{df2}{2}) } {(\frac{n1}{n2})}^{(\frac{df1}{2})} x^{(\frac{df1}{2} - 1)} (1 + \frac{df1}{df2} x)^{-(n1 + n2)/2} $$

_decl_

```typescript
declare function df(
  x: number | number[],
  df1: number,
  df2: number,
  ncp?: number,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles (array or scalar).
* `df1`: degrees of freedom. `Infinity` is allowed.
* `df2`: degrees of freedom. `Infinity` is allowed.
* `ncp`: non-centrality parameter. If omitted the central F is assumed.
* `asLog`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { FDist, R: { numberPrecision } } = libR;

//helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9);

const { df, pf, qf, rf } = FDist();

const x = seq(0, 4, 0.5);

//1.
const d1 = df(x, 5, 10, 8);
precision(d1);
/*[
  0,            0.0972906993,  0.219523567,  0.270256085,
  0.262998414,  0.229004229,   0.188412981,  0.150538493,
  0.118556123 ]*/

//2.
const d2 = df(x, 50, 10, undefined, true);
precision(d2);
/*[
  -Infinity,  -0.688217839,  -0.222580527,  -0.940618761,
  -1.7711223, -2.55950945,   -3.28076319,   -3.93660717,
  -4.53440492 ]*/

//3.
const d3 = df(x, 6, 25);
precision(d3);
/*[
  0,            0.729921524,  0.602808536,  0.323999956,
  0.155316972,  0.0724829398, 0.0340225684, 0.0162807852,
  0.00798668195 ]*/

//4.
const d4 = df(x, 6, 25, 8, true);
precision(d4);
/*[ -Infinity,  -2.43273687,  -1.38207439,  -1.08123445,
  -1.09408866,  -1.27043349,  -1.54026185,  -1.86581606,
  -2.22490033 ]*/
```

_Equivalence in R_

```R
x = seq(0, 4, 0.5);

#1.
df(x, df1=5,df2=10, ncp=8)
#[1] 0.0000000 0.0972907 0.2195236 0.2702561 0.2629984 0.2290042 0.1884130
#[8] 0.1505385 0.1185561

#2.
df(x, df1=50,df2=10, log = TRUE)
#[1]       -Inf -0.6882178 -0.2225805 -0.9406188 -1.7711223 -2.5595094 -3.2807632
#[8] -3.9366072 -4.5344049

#3
df(x, 6, 25)
#[1] 0.000000000 0.729921524 0.602808536 0.323999956 0.155316972 0.072482940
#[7] 0.034022568 0.016280785 0.007986682

#4
df(x, 6, 25, 8, log=TRUE)
#[1]      -Inf -2.432737 -1.382074 -1.081234 -1.094089 -1.270433 -1.540262
#[8] -1.865816 -2.224900
```

#### `pf`

The cumulative probability function of the [F distribution](https://en.wikipedia.org/wiki/F-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html).

_decl_

```typescript
declare function pf(
  q: number[] | number,
  df1: number,
  df2: number,
  ncp?: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number[] | number;
```

* `q`: quantiles (array or scalar).
* `df1`: degrees of freedom. `Infinity` is allowed.
* `df2`: degrees of freedom. `Infinity` is allowed.
* `ncp`: non-centrality parameter. If omitted the central F is assumed.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `asLog`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  FDist,
  R: { numberPrecision }
} = libR;

//some usefull tools
const seq = libR.R.seq()();
const precision = numberPrecision(9);

//strip functions
const { df, pf, qf, rf } = FDist();

const x = seq(0, 4, 0.5);

//1. df1 = 5, df2=10, ncp=8
const p1 = pf(x, 5, 10, 8);
precision(p1);
/*[
  0,            0.0189961379,  0.100468407,  0.225990517,
  0.361015189,  0.484609879,   0.588981209,  0.673508458,
  0.740516322 ]*/

//2. df1=50, df2=10, lowerTail=false
const p2 = pf(x, 50, 10, undefined, false);
pecision(p2);
/*[
  1,            0.946812312,  0.543643095,  0.25065625,
  0.118135409,  0.0595867293, 0.0321901407, 0.0184730352,
  0.0111614023 ]*/

//3.
const p3 = pf(x, 50, 10, undefined, false, true);
precision(p3);
/*[
  0,            -0.0546543979,  -0.609462324,
  -1.3836728,   -2.13592378,    -2.82032239,
  -3.43609506,  -3.99144317,    -4.49529367 ]*/

//4. "undefined" will skip and use defaults (if specified)
const p4 = pf(x, 6, 25, 8, undefined, true);
precision(p4);
/*[
  -Infinity,    -4.20235111,  -2.29618223,  -1.376145,
  -0.85773694,  -0.546177623, -0.35253857,  -0.229797274,
  -0.15099957 ]*/
```

_Equivalent in R_

```R
x = seq(0, 4, 0.5);

#1
pf(x, 5, 10, 8);
#[1] 0.00000000 0.01899614 0.10046841 0.22599052 0.36101519 0.48460988 0.58898121
#[8] 0.67350846 0.74051632

#2
pf(x, 50, 10, lower.tail=FALSE);
#[1] 1.00000000 0.94681231 0.54364309 0.25065625 0.11813541 0.05958673 0.03219014
#[8] 0.01847304 0.01116140

#3
pf(x, 50, 10,  lower.tail=FALSE, log.p=TRUE);
#[1]  0.0000000 -0.0546544 -0.6094623 -1.3836728 -2.1359238 -2.8203224 -3.4360951
#[8] -3.9914432 -4.4952937

#4
pf(x, 6, 25, 8, log.p=TRUE);
#[1]       -Inf -4.2023511 -2.2961822 -1.3761450 -0.8577369 -0.5461776 -0.3525386
#[8] -0.2297973 -0.1509996
```

#### `qf`

The quantile function of the [F distribution](https://en.wikipedia.org/wiki/F-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html).

_decl_

```typescript
declare function qf(
  p: number | number[],
  df1: number,
  df2: number,
  ncp?: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `p`: probabilities (array or scalar).
* `df1`: degrees of freedom. `Infinity` is allowed.
* `df2`: degrees of freedom. `Infinity` is allowed.
* `ncp`: non-centrality parameter. If omitted the central F is assumed.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `asLog`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { FDist } = libR;

//helpers
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9);

//strip functions
const { df, pf, qf, rf } = FDist();

//data
const q = [ ...seq(0,4), Infinity];

//1
const pp1 = pf(q, 50,  10,  undefined,  false);
const q1 = qf( pp1, 50, 10, undefined, false);
precision(q1);
//[ 0, 1, 2, 3, 4, Infinity ]

//2
const pp2 = pf(q, 50, 10, 9, false, true);
const q2 = qf(pp2, 50, 10, 9, false, true);
precision(q2);
//[ 0, 1, 2, 3, 4, Infinity ]

//3.
const pp3 = pf(q, 6, 25, 8);
const q3 = qf(pp3, 6, 25, 8);
precision(q3);
//[ 0, 1, 2, 3, 4, Infinity ]

//4
const pp4 = pf(q, 3, 9000, undefined, false);
const q4 = qf(pp4, 3, 9000, undefined, false);
//[ 0, 1, 2, 3, 4, Infinity ]
```

_Equivlent in R_

```R
q = c( seq(0,4), Inf);

#1.
pp1=pf(q, 50, 10, lower.tail=FALSE);
qf(pp1, 50, 10, lower.tail=FALSE);
#[1]   0   1   2   3   4 Inf

#2
pp2 = pf(q, 50, 10, 9, lower.tail=FALSE, log.p=TRUE);
qf(pp2, 50, 10, 9, lower.tail=FALSE, log.p=TRUE);
#[1]   0   1   2   3   4 Inf

#3
pp3 = pf(q, 6, 25, 8);
qf(pp3, 6, 25, 8);
#[1]   0   1   2   3   4 Inf

#4
pp4 = pf(q, 3, 9000, lower.tail=FALSE);
qf(pp4, 3, 9000, lower.tail=FALSE);
#[1]   0   1   2   3   4 Inf
```

#### `rf`

Generates deviates for the [F distribution](https://en.wikipedia.org/wiki/F-distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html).

_decl_

```typescript
declare function rf(
  n: number,
  df1: number,
  df2: number,
  ncp?: number
): number | number[];
```

* `n`: number of deviates to generate.
* `df1`: degrees of freedom. `Infinity` is allowed.
* `df2`: degrees of freedom. `Infinity` is allowed.
* `ncp`: non-centrality parameter. If omitted the central F is assumed.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    FDist,
    rng: {
        MersenneTwister,
        normal: { KindermanRamage }
    },
    R: { numberPrecision }
} = libR;

//helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9);

const mt = new MersenneTwister(1234);
const { df, pf, qf, rf } = FDist(new KindermanRamage(mt));

//seed is already set to 1234
//1.
precision(rf(5, 8, 6));
//[ 0.391172977, 0.528225588, 1.09478902, 2.4961292, 0.143678921 ]

//2.
precision(rf(5, Infinity, Infinity));
//[ 1, 1, 1, 1, 1 ]

//3. produces NaNs because df1 or/and df2 is Infinity and ncp !== undefined (yes, ncp=0 produces NaNs!)
precision(rf(5, 40, Infinity, 0));
//[ NaN, NaN, NaN, NaN, NaN ]

//4.
precision(rf(5, 400, Infinity));
//[ 1.00424008, 1.00269156, 1.03619851, 0.965292995, 0.904786448 ]
```

_in R Console:_

```R
RNGkind("Mersenne-Twister", normal.kind="Kinderman-Ramage");
set.seed(1234);

#1.
rf(5,8,6)
#[1] 0.3986174 2.1329082 2.0211488 2.5957924 4.0114025

#2.
rf(5, Inf, Inf)
#[1] 1 1 1 1 1

#3.
rf(5, 40, Inf, 0)
#[1] NaN NaN NaN NaN NaN

#4.
rf(5, 400, Inf)
#[1] 1.0042401 1.0026916 1.0361985 0.9652930 0.9047864
```

### Gamma distribution

`dgamma, qgamma, pgamma, rgamma`

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html). See [wiki](https://en.wikipedia.org/wiki/Gamma_distribution).

These functions are members of an object created by the `Gamma` factory method. The factory method needs as optional argument an instance of one of the [normal PRNG's](#normal-distributed-random-number-generators).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Gamma,
  rng: { 
    KnuthTAOCP2002,
    normal: { AhrensDieter } 
  }
} = libR;

//1. initialize default, always "MersenneTwister" and "Inversion"
const defaultGamma = Gamma();

//2. alternative: initialize with explicit uniform PRNG
const mt = new KnuthTAOCP2002(123456); //keep reference so we can do mt.init(...)
const customG = Gamma(new AhrensDieter(mt));

//get functions
const { dgamma, pgamma, qgamma, rgamma } = customG; // or use "defaultGamma"
```

#### `dgamma`

The density function of the [Gamma distribution](https://en.wikipedia.org/wiki/Gamma_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html)

$$ f(x)= \frac{1}{s^{a} \Gamma(a)} x^{a-1} e^{-x/s} $$

* `a`: shape parameter
* `s`: scale parameter
* `x`: x >= 0

Alternative represention using _shape_ parameter `a` and _rate_ parameter `β`= $1/s$:

$$ f(x)= \frac{β^{a}}{\Gamma(a)} x^{a-1} e^{-xβ} $$

You must either specify `scale` or `rate` parameters _but not both_ (unless rate = 1/scale).

_decl_

```typescript
declare function dgamma(
  x: number | number[],
  shape: number,
  rate: number = 1,
  scale: number = 1 / rate,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles (scalar or array).
* `shape`: [shape](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, must be positive.
* `rate`: The [rate](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, when specified, leave `scale` undefined (or set `rate = 1/scale`). Must be strictly positive.
* `scale`: The [scale](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, when specified, leave `rate` undefined (or set `scale = 1/rate`). Must be strictly positive.
* `asLog`: if _true_, probabilities/densities p are returned as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Gamma,
  R: { numberPrecision, arrayrify }
} = libR;

//helpers
const log = arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = numberPrecision(9); //restrict to 9 significant digits

const { dgamma, pgamma, qgamma, rgamma } = Gamma();

const x =  seq(0, 10, 2);
//1.
const d1 =  dgamma( x, 1, 0.5); //using rate
precision(d1);
/*[ 0.5,            0.183939721,    0.0676676416,     0.0248935342,
    0.00915781944,  0.0033689735 ]*/

//2.
const d2 =  dgamma(x, 2, 1/2); //using rate
precision(d2);
/*[
  0,            0.183939721,  0.135335283,  0.0746806026,
  0.0366312778, 0.0168448675 ]*/

//3.
const d3 = dgamma(x, 5, 1); //using rate
precision(d3);
/*[
  0,            0.0902235222,  0.195366815,
  0.133852618,  0.0572522885,  0.0189166374]*/

//4.
const d4 = dgamma( x, 7.5, 1, undefined, true);
precision(d4);
/*[ -Infinity,   -5.02890756,  -2.52345089,
    -1.88792769, -2.01799422,  -2.56756113 ]*/
```

_in R Console_

```R
#1. these 2 give the same output
dgamma( seq(0, 10, 2), 1, scale = 2);
dgamma( seq(0, 10, 2), 1, rate = 1/2);
#[1] 0.500000000 0.183939721 0.067667642 0.024893534 0.009157819 0.003368973

#2.
dgamma( seq(0, 10, 2), 2, scale = 2);
dgamma( seq(0, 10, 2), 2, rate = 1/2);
#[1] 0.00000000 0.18393972 0.13533528 0.07468060 0.03663128 0.01684487

#3.
dgamma( seq(0, 10, 2), 5, scale = 1);
dgamma( seq(0, 10, 2), 5, rate = 1);
#[1] 0.00000000 0.09022352 0.19536681 0.13385262 0.05725229 0.01891664

#4.
dgamma( seq(0, 10, 2), 7.5, scale = 1, log = TRUE)
dgamma( seq(0, 10, 2), 7.5, rate = 1, log = TRUE)
#[1]      -Inf -5.028908 -2.523451 -1.887928 -2.017994 -2.567561
```

#### `pgamma`

The cumulative probability function of the [Gamma distribution](https://en.wikipedia.org/wiki/Gamma_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html).

_decl_

```typescript
declare function pgamma(
  x: number | number[],
  shape: number,
  rate: number = 1,
  scale: number = 1 / rate, //alternative for rate
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `x`: quantiles (scalar or array).
* `shape`: [shape](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, must be positive.
* `rate`: The [rate](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, when specified, leave `scale` undefined (or set `rate = 1/scale`). Must be strictly positive.
* `scale`: The [scale](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, when specified, leave `rate` undefined (or set `scale = 1/rate`). Must be strictly positive.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if _true_, probabilities/densities p are as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Gamma,
  R: { arrayrify, numberPrecision }
} = libR;

//helpers
const log = arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = numberPrecision(9); //restrict to 9 significant digits

const { dgamma, pgamma, qgamma, rgamma } = Gamma();

const x = seq(0, 10, 2);

//1.
const p1 = pgamma(x, 1, 0.5);
const p1Equavalent = pgamma(x, 1, undefined, 2);
precision(p1);
/*[
  0,            0.632120559,  0.864664717,  0.950212932,
  0.981684361,  0.993262053 ]*/

//2.
const p2 = pgamma(x, 2, 0.5);
const p2Equivalent = pgamma(x, 2, undefined, 2);
precision(p2);
/*
[ 0,            0.264241118,  0.59399415,  0.800851727,
  0.908421806,  0.959572318 ]*/

//3.
const p3 = pgamma(x, 5, 1, undefined, false, true);
const p3Equivalent = pgamma(x, 5, undefined, 1, false, true);
precision(p3);
/*[
  0,            -0.0540898509,  -0.4638833,  -1.25506787,
  -2.30626786,  -3.53178381 ]*/

//4.
const p4 = pgamma(x, 7.5, 1, undefined, false, true);
const p4Equivalent = pgamma(x, 7.5, undefined, 1, false, true);
precision(p4);
/*
[ 0,            -0.00226521952,  -0.0792784046,
  -0.387091358, -0.96219944,     -1.76065222 ]*/
```

_Equivalent in R_

```R
x=seq(0,10,2);

#1
pgamma(x, 1, rate = 0.5);
#[1] 0.0000000 0.6321206 0.8646647 0.9502129 0.9816844 0.9932621

#2
pgamma(x, 2, rate = 0.5);
#[1] 0.0000000 0.2642411 0.5939942 0.8008517 0.9084218 0.9595723

#3
pgamma(x, 5, rate=1, lower.tail = FALSE, log.p = TRUE);
#[1]  0.00000000 -0.05408985 -0.46388330 -1.25506787 -2.30626786 -3.53178381

#4
pgamma(x, 7.5, rate = 7.5, lower.tail = FALSE , log.p = TRUE );
#[1]  0.00000000 -0.00226522 -0.07927840 -0.38709136 -0.96219944 -1.76065222
```

#### `qgamma`

The quantile function of the [Gamma distribution](https://en.wikipedia.org/wiki/Gamma_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html).

_decl_

```typescript
declare function pgamma(
  x: number | number[],
  shape: number,
  rate: number = 1,
  scale: number = 1 / rate, //alternative for rate
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `x`: quantiles (scalar or array).
* `shape`: [shape](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, must be positive.
* `rate`: The [rate](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, when specified, leave `scale` undefined (or set `rate = 1/scale`). Must be strictly positive.
* `scale`: The [scale](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, when specified, leave `rate` undefined (or set `scale = 1/rate`). Must be strictly positive.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if _true_, probabilities/densities p are as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Gamma,
  R: { numberPrecision, arrayrify }
} = libR;

//some tools
const log = arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = numberPrecision(9); //restrict to 9 significant digits

const { dgamma, pgamma, qgamma, rgamma } = Gamma();

const x = seq(0, 10, 2);

//1.
const pp1 = pgamma(x, 1, 0.5);
const q1 = qgamma(pp1, 1, 0.5);
precision(q1);
//[ 0, 2, 4, 6, 8, 10 ]

//2.
const pp2 = pgamma(x, 2, 0.5);
const q2 = qgamma(pp2, 2, 0.5);
precision(q2);
//[ 0, 2, 4, 6, 8, 10 ]

//3.
const pp3 = pgamma(x, 5, 1, undefined, false, true);
const q3 = qgamma(pp3, 5, undefined, 1, false, true);
precision(q3);
//[ 0, 2, 4, 6, 8, 10 ]

//4.
const pp4 = pgamma(x, 7.5, 1, undefined, false);
const q4 = qgamma(log(pp4), 7.5, 1, undefined, false, true);
precision(q4);
//[ 0, 2, 4, 6, 8, 10 ]
```

_Equivalent in R_

```R
x = seq(0, 10, 2);

#1.
pp1 = pgamma(x, 1, 0.5)
qgamma(pp1, 1, 0.5)
#[1]  0  2  4  6  8 10

#2.
pp2 = pgamma(x, 2, 0.5);
qgamma(pp2, 2, 0.5);
#[1]  0  2  4  6  8 10

#3.
pp3 = pgamma(x, 5, 1, lower.tail= FALSE, log.p=TRUE);
qgamma(pp3, 5, scale= 1, lower.tail=FALSE, log.p=TRUE);
#[1]  0  2  4  6  8 10

#4
pp4 = pgamma(x, 7.5, 1, lower.tail=FALSE);
qgamma(log(pp4), 7.5, 1, lower.tail=FALSE , log.p=TRUE);
#[1]  0  2  4  6  8 10
```

#### `rgamma`

Generates random deviates for the [Gamma distribution](https://en.wikipedia.org/wiki/Gamma_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html).

```typescript
declare function rgamma(
  n: number,
  shape: number,
  rate: number = 1,
  scale: number = 1 / rate //alternative for rate
): number | number[];
```

* `n`: number of deviates generated.
* `shape`: [shape](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, must be positive.
* `rate`: The [rate](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, when specified, leave `scale` undefined (or set `rate = 1/scale`). Must be strictly positive.
* `scale`: The [scale](https://en.wikipedia.org/wiki/Gamma_distribution) parameter, when specified, leave `rate` undefined (or set `scale = 1/rate`). Must be strictly positive.

Usage:

```typescript
const libR = require('lib-r-math.js');
const {
  Gamma,
  rng: {
    LecuyerCMRG,
    normal: { BoxMuller }
  },
  R: { arrayrify, numberPrecision }
} = libR;

//some tools
const log = arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const lc = new LecuyerCMRG(1234);
const { dgamma, pgamma, qgamma, rgamma } = Gamma(new BoxMuller(lc));

//1.
const r1 = rgamma(5, 1, 0.5);
precision(r1);
//[ 0.245895782, 1.18079997, 0.121397968, 1.9369898, 0.00324084998 ]

//2.
const r2 = rgamma(5, 2, 0.5);
precision(r2);
//[ 2.70358022, 2.13849656, 3.20216826, 2.99776528, 1.78394229 ]

//3.
const r3 = rgamma(5, 7.5, 1);
precision(r3);
//[ 8.87110239, 5.34863306, 10.805079, 9.07713185, 9.39337443 ]
```

_Equivalent in R_

```R
RNGkind("L'Ecuyer-CMRG", normal.kind="Box-Muller")
set.seed(1234);

#1
rgamma(5, 1, 0.5);
#[1] 0.24589578 1.18079997 0.12139797 1.93698980 0.00324085

#2
rgamma(5, 2, 0.5);
#[1] 2.703580 2.138497 3.202168 2.997765 1.783942

#3
rgamma(5, 7.5, 1);
#[1]  8.871102  5.348633 10.805079  9.077132  9.393374
```

### Geometric distribution.

`dgeom, qgeom, pgeom, rgeom`

See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html) and [wiki](https://en.wikipedia.org/wiki/Geometric_distribution).

These functions are properties of an object created by the `Geometric` factory method. The factory method needs as optional argument an instance of one of the [normal PRNG's](#normal-distributed-random-number-generators).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Geometric,
  rng: {
    SuperDuper,
    normal: { BoxMuller }
  }
} = libR;

//1. initialize default, "Inversion" and "MersenneTwister"
const defaultG = Geometric();

//2. alternative: initialize with explicit uniform PRNG
const sd = new SuperDuper(3456); //keep reference so we can do mt.init(...)
const explicitG = Geometric(new BoxMuller(mt));

//get functions
const { dgeom, pgeom, qgeom, rgeom } = explicitG; // or use "defaultGamma"
```

#### `dgeom`

The density function of the [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html).

$$ \large p(x) = p (1-p)^{x} $$

_decl_

```typescript
declare function dgeom(
  x: number | number[],
  prob: number,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles (array or scalar).
* `prob`: probability of success in each trial. 0 < prob <= 1.
* `asLog`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { 
  Geometric,
  R: { numberPrecision }
} = libR;

//helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9); //restrict to 9 significant digits

const { dgeom, pgeom, qgeom, rgeom } = Geometric();

//data
const x = seq(0,4);
//1
const d1 = dgeom(x, 0.5);
precision(d1);
//[ 0.5, 0.25, 0.125, 0.0625, 0.03125 ]

//2
const d2 = dgeom(x, 0.2, true);
precision(d2);
//[ -1.60943791, -1.83258146, -2.05572502, -2.27886857, -2.50201212 ]
```

_Equivalent in R_

```R
x = seq(0,4);

#1
> dgeom(x, 0.5)
[1] 0.50000 0.25000 0.12500 0.06250 0.03125

#2
> dgeom(x, 0.2, TRUE)
[1] -1.609438 -1.832581 -2.055725 -2.278869 -2.502012
```

#### `pgeom`

The distribution function of the [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html).

_decl_

```typescript
declare function pgeom(
  q: number | number[],
  prob: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `q`: the number of failures before success.
* `prob`: probability of success.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

```javascript
const libR = require('lib-r-math.js');
const {
  Geometric,
  R: { numberPrecision }
} = libR;

//helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9); //restrict to 9 significant digits
const { dgeom, pgeom, qgeom, rgeom } = Geometric();

const q = seq(5, 9);

//1.
const p1 = pgeom(q, 0.1);
precision(p1);
//[ 0.468559, 0.5217031, 0.56953279, 0.612579511, 0.65132156 ]

//2.
const p2 = pgeom(q, 0.1, false);
precision(p2);
//[ 0.531441, 0.4782969, 0.43046721, 0.387420489, 0.34867844 ]

//3.
const p3 = pgeom(q, 0.2, false, true);
precision(p3);
//[ -1.33886131, -1.56200486, -1.78514841, -2.00829196, -2.23143551 ]
```

_Equivalent in R_

```R
q=seq(5, 9);
#1
pgeom(q, 0.1);
#[1] 0.4685590 0.5217031 0.5695328 0.6125795 0.6513216

#2
pgeom(q, 0.1, FALSE)
#[1] 0.5314410 0.4782969 0.4304672 0.3874205 0.3486784

#3
pgeom(q, 0.2, FALSE, TRUE)
#[1] -1.338861 -1.562005 -1.785148 -2.008292 -2.231436
```

#### `qgeom`

The quantile function of the [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html).

_decl_

```typescript
declare function qgeom(
  p: number | number[],
  prob: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `p`: probabilities (scalar or array).
* `prob`: probability of success.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Geometric,
  R:{ numberPrecision }
} = libR;

//helpers
const seq = libR.R.seq()();
const precision = numberPrecision(9); //restrict to 9 significant digits

const { dgeom, pgeom, qgeom, rgeom } = Geometric();

const q = seq(5, 9);

//1
const pp1 = pgeom(q, 0.2, false, true);
const q1 = qgeom(pp1, 0.2, false, true);
precision(q1);
//[ 5, 6, 7, 8, 9 ]

//2
const pp2 = pgeom(q, 0.9, true, true);
const q2 = qgeom(pp2, 0.9, true, true);
precision(q2);
//[ 5, 6, 7, 8 , 9 ]

//3
const pp3 = pgeom([...q, Infinity], 0.5);
const q3 = qgeom(pp3, 0.5);
precision(q3);
//[ 5, 6, 7, 8, 9, Infinity ]
```

_Equivalent in R_

```R
q = seq(5, 9);

#1
pp1 = pgeom(q, 0.2, FALSE, TRUE)
qgeom(pp1, 0.2, FALSE, TRUE)
#[1] 5 6 7 8 9

#2
pp2 = pgeom(q, 0.9, TRUE, TRUE);
qgeom(pp2, 0.9, TRUE, TRUE);
#[1] 5 6 7 8 9

#3
pp3 = pgeom(c(q, Inf), 0.5);
qgeom(pp3, 0.5);
#[1] 5 6 7 8 9, Inf
```

#### `rgeom`

Generates random deviates for the [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html).

_decl_

```typescript
declare function rgeom(
  n: number,
  prob: number
): number | number[];
```

* `n`: number of deviates to generate.
* `prob`: probability of success.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Geometric,
  rng: {
    KnuthTAOCP,
    normal: { KindermanRamage }
  },
  R: { arrayrify, numberPrecision, seq: seqCR }
} = libR;

//helpers
const log = arrayrify(Math.log);
const seq = seqCR()();
const precision = numberPrecision(9); //restrict to 9 significant digits

//explicit PRNG
const k97 = new KnuthTAOCP(1234);
const { dgeom, pgeom, qgeom, rgeom } = Geometric(new KindermanRamage(mt));

//1
k97.init(3456);
rgeom(5, 0.001);
//[ 573, 1153, 75, 82, 392 ]

//2
k97.init(9876);
rgeom(5, 0.999);
//[ 0, 0, 0, 0, 0 ]  low failure rate!!

//3
k97.init(934);
rgeom(10, 0.4);
//[ 1, 2, 6, 1, 0, 1, 0, 0, 1, 2 ]
```

_in R Console_

```R
RNGkind("Mersenne-Twister", normal.kind = "Inversion");

#1.
> set.seed(3456)
> rgeom(5, 0.001)
[1]  573 1153   75   82  392

#2
> set.seed(9876)
> rgeom(5, 0.999);
[1] 0 0 0 0 0

#3
> set.seed(934)
> rgeom(10, 0.4);
 [1] 1 2 6 1 0 1 0 0 1 2
```

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

_decl_

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

* `x`: is the number of observed successes.
* `m`: is the number of success states in the population
* `n`: is the number of failure states in the population
* `k`: is the number of draws from the population (n+m) sample.

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

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

* `q`: is the number of observed successes.
* `m`: is the number of success states in the population
* `n`: is the number of failure states in the population
* `k`: is the number of draws from the population (n+m) sample.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

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

* `p`: is probability of observed successes.
* `m`: is the number of success states in the population
* `n`: is the number of failure states in the population
* `k`: is the number of draws from the population (n+m) sample.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function rhyper(
  N: number,
  m: number,
  n: number,
  k: number
): number | number[];
```

* `N`: number of deviates to generate.
* `m`: is the number of success states in the population
* `n`: is the number of failure states in the population
* `k`: is the number of draws from the total population (n+m) sample.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { HyperGeometric, rng: { MersenneTwister } } = libR;

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
const libR = require('lib-r-math.js');
const { Logistic, rng: { MersenneTwister, SuperDuper } } = libR;

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

_decl_

```typescript
declare function dlogis(
  x: number | number[],
  location: number = 0,
  scale: number = 1,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles (scalar or array).
* `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
* `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.
* `asLog`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function plogis(
  q: number | number[],
  location: number = 0,
  scale: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `q`: quantiles (scalar or array).
* `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
* `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function qlogis(
  p: number | number[],
  location: number = 0,
  scale: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `p`: probabilities (scalar or array). 0 ≤ p ≤ 1.
* `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
* `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function rlogis(
  N: number,
  location: number = 0,
  scale: number = 1
): number | number[];
```

* `N`: number of random deviates to generate.
* `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
* `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Logistic, rng: { MersenneTwister } } = libR;

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
const libR = require('lib-r-math.js');
const {
  Normal,
  LogNormal,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
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

_decl_

```typescript
declare function dlnorm(
  x: number | number[],
  meanLog: number = 0,
  sdLog: number = 1,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles, with distribution $x ~ N(\mu, \sigma)$
* `meanLog`: the mean of the normally distributed `x`
* `sdLog`: the standard deviation ($\sigma$) of the normal distributed `x`.
* `asLog`: return the densities as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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
> x = seq(0,3,0.5)
> options(scipen=999)
> options(digits=9)

#1
> dlnorm(x, 0, 0.25)
[1] 0.0000000000000 0.0683494950964 1.5957691216057 0.2855537757193
[5] 0.0170873737741 0.0007726807882 0.0000340783543

#2
> dlnorm(x, 0, 0.5, TRUE);
[1]         -Inf -0.493550200 -0.225791353 -0.960060369 -1.879844561
[6] -2.821259495 -3.738301563

#3
> dlnorm(x, 0, 1);
[1] 0.0000000000 0.6274960771 0.3989422804 0.2449736517 0.1568740193
[6] 0.1048710669 0.0727282561
```

#### `plnorm`

The distribution function of the [Log Normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Lognormal.html).

$$ f(x) = \frac{1}{2} + \frac{1}{2} \cdot erf \left( \frac{(ln(x)-\mu)}{\sigma \cdot \sqrt{2}} \right) $$

_Note:_ deviate `x` has a normal distribution with mean $\mu$ and standard deviation $\sigma$.

_decl_

```typescript
declare function plnorm(
  q: number | number[],
  meanLog: number = 0,
  sdLog: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `q`: quantiles, with distribution $x ~ N(\mu, \sigma)$
* `meanLog`: the mean of the normally distributed `x`
* `sdLog`: the standard deviation ($\sigma$) of the normal distributed `x`.
* `lowerTail`: if TRUE (default), probabilities are P[X <= x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function qlnorm(
  p: number | number[],
  meanLog: number = 0,
  sdLog: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `p`: probabilities.
* `meanLog`: the mean of the normally distributed `x`
* `sdLog`: the standard deviation ($\sigma$) of the normal distributed `x`.
* `lowerTail`: if TRUE (default), probabilities are P[X <= x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function rlnorm(
  n: number,
  meanlog: number = 0,
  sdlog: number = 1
): number | number[];
```

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Normal,
  LogNormal,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
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
const libR = require('lib-r-math.js');
const { MultiNomial, rng: { MersenneTwister, SuperDuper } } = libR;

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

_decl_

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

* `x`: array of quantiles (minimal item count is 2)
* `prob`: array of corresponding non-zero probabilities corresponding with the quantiles.
* `size`: optional, you can safely omit it, functions as a kind of checksum: size = $\sum*{i=1}^{k} x*{i}$
* `asLog`: probabilities are returned as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Multinomial } = libR;

//some tools
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dmultinom, rmultinom } = Multinomial();

//1. binomial analog
const d1 = dmultinom({
  x: [3, 5],
  prob: [0.25, 0.75]
});
precision(d1);
//0.207641602

//2. binomial analog
const d2 = dmultinom({
  x: [3, 5, 9],
  prob: [0.2, 0.7, 0.1]
});
precision(d2);
//0.0000018304302

//3. binomial analog
const d3 = dmultinom({
  x: [3, 5, 9, 4],
  prob: [2, 8, 4, 6], // will normalized to = [ 2/20, 8/20, 4/20, 6/20 ]
  asLog: true
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

_decl_

```typescript
declare function rmultinom(
  n: number,
  size: number,
  prob: number | number[]
): (number[]) | (number[][]); //return an array of arrays n x prob.length elements.
```

* `n`: returns an array of size `n` nested arrays of dimension `prob.length`.
* `size`: distribute size elements amongst `prob.length` bins for each deviate.
* `prob`: an array (in case of a scalar or array of length 1) describing the probabilities for success for ech bin.
* `@return`: returns `n` arrays each of length `k = (prob.length)`.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Multinomial,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } },
  R: { sum, div, mult }
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
const libR = require('lib-r-math.js');
const { Poisson, rng: { SuperDuper }, rng: { normal: { BoxMuller } } } = libR;

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

_decl_

```typescript
declare function dpois(
  x: number | number[],
  lambda: number,
  asLog: boolean = false
): number | number[];
```

* `x`: quantile(s). Scalar or array.
* `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
* `asLog`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
function ppois(
  q: number | number[],
  lambda: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `q`: quantile(s). A Scalar or array.
* `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function qpois(
  p: number | number[],
  lambda: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `p`: probabilities, scalar or array.
* `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Poisson, R: { arrayrify } } = libR;

//some tools
const seq = libR.R.seq()();
const log = arrayrify(Math.log);
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dpois, ppois, qpois, rpois } = Poisson();

const p = seq(0, 1, 0.2);

//1
const q1 = qpois(log(p), 1, false, true);
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
> qpois( log(p) , 1, FALSE, TRUE)
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

_decl_

```typescript
declare function rpois(N: number, lambda: number): number | number[];
```

* `N`: number of deviates to generate.
* `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Poisson,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
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

### Wilcoxon signed rank statistic distribution.

`dsignrank, psignrank, qsignrank, rsignrank`

Density, distribution function, quantile function and random generation for the distribution of the [Wilcoxon Signed Rank statistic](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/SignRank.html).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { SignRank, rng: { MarsagliaMultiCarry } } = libR;

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

_decl_

```typescript
declare function dsignrank(
  x: number | number[],
  n: number,
  aslog: boolean = false
): number | number[];
```

* `x`: quantiles (scalar or array of values the rank W+).
* `n`: total number of observations.
* `asLog`: give probabilities as ln(p). Default is false.

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function psignrank(
  q: number | number[],
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `q`: quantiles (scalar or array of values the rank W+).
* `n`: total number of observations.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function qsignrank(
  p: number | number[],
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `p`: probabilities.
* `n`: total number of observations.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function rsignrank(N: number, n: number): number | number[];
```

* `N`: Number of deviates to generate..
* `n`: total number of observations.

Usage:

```javascript
const libR = require('lib-r-math.js');
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
const libR = require('lib-r-math.js');
const {
  StudentT,
  rng: { MarsagliaMultiCarry },
  rng: { normal: { AhrensDieter } }
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

_decl_

```typescript
declare function dt(
  x: number | number[],
  df: number,
  ncp?: number,
  asLog = false
): number | number[];
```

* `x`: quantiles.(Scalar or array).
* `df`: degrees of freedom.
* `ncp`: non-central parameter.
* `asLog`: return result as ln(p);

Usage:

```javascript
const libR = require('lib-r-math.js');
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

* `q`: quantiles, array or scalar.
* `df`: degrees of freedom.
* `ncp`: non central parameter.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
function qt(
  p: number | number[],
  df: number,
  ncp?: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `p`: probabilities, array or scalar.
* `df`: degrees of freedom.
* `ncp`: non central parameter.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
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

_decl_

```typescript
declare function rt(n: number, df: number, ncp?: number): number | number[];
```

* `n`: number of random deviates to generate.
* `df`: degrees of freedom.
* `ncp`: non central parameter.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Normal,
  StudentT,
  rng: { MarsagliaMultiCarry },
  rng: { normal: { AhrensDieter } }
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
//[ 4.82388236, 7.39995919, 16.9449549, 9.30852366, 13.450456 ]

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
