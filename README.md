# libRmath.js

Javascript ( TypeScript ) Pure Implementation of Statistical R "core" numerical
`libRmath.so` library found here https://svn.r-project.org/R/trunk/src/nmath/

#### Summary

Porting `R nmath` core is a daunting task, we _VERIFIED_ fidelity with `R` on
all functions that are ported from `R` to `javascript` by using static fixtures
(generated in R language) to guarantee exact output replication of the ported
functions.

All functions in lib-R-core has been re-written to `Javascript` (`Typescript`).
We are now in process of testing against fixture files generated from R and to
prove fidelity with `R`.

#### Node and Web

No node specific features are used, you can either deploy for client web or
server.

## Installation

```bash
npm install --save lib-r-math.js
```

# Table of Contents

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
  * [Χ<sup>2</sup> distribution](#Χ<sup>2</sup>-distribution)
  * [Exponential distribution](#exponential-distribution)
  * [F distribution](#f-distribution)
  * [Gamma distribution](#gamma-distribution)
  * [Geometric distribution](#geometric-distribution)
  * [Hypergeometric distribution](#hypergeometric-distribution)
  * [Logistic distribution](#logistic-distribution)
  * [LogNormal distribution](#lognormal-distribution)
  * [Multinomial distribution](#multinomial-distribution)
  * [Poisson distribution](#poisson-distribution)
  * [Wilcoxon signed rank statistic distribution](#wilcoxon-signed-rank-statistic-distribution)
  * [Student's t-distribution](#student's-t-distribution)
  * [Studentized Range (_Tukey_) distribution](#studentized-range-distribution)
  * [Weibull distribution](#weibull-distribution)
  * [Wilcoxon rank sum statistic distribution](#wilcoxon-rank-sum-statistic-distribution)
* [Special Functions of Mathematics](#special-functions-of-mathematics)
  * [Bessel functions](#bessel-functions)
  * [Beta functions](#beta-functions)
  * [Gamma functions](#gamma-functions)
  * [Functions for working with Combinatorics](#functions-for-working-with-combinatorics)
* [Road map](#road-map)

# Helper functions for porting `R`.

#### Summary

R language operators and functions can work `vectors` and `list`.
These Javascript helper functions are used to make the porting process to ES6 easier for R programmers.

### `arrayrify`

Wraps an existing function for it to accept the first argument as a scalar or vectorized input.

_Note: Only the first function argument is vectorized_

_decl:_

```typescript
function arrayrify<T, R>(fn: (x: T, ...rest: any[]) => R);
```

trivial R list example

```R
# R console
# devide each vector element by 5
> c(1,2,3,4)/5
[1] 0.2 0.4 0.6 0.8
```

Javascript equivalent

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

Recursively flatten all arguments (some possible arrays with possible nested arrays) into one array.

_decl:_

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

Return the first argument wrapped in an array. If it is already an array just return the reference to the array.

_decl:_

```typescript
function forceToArray<T>(x: T | T[]): T[];
```

Example:

```javascript
const libR = require('lib-r-math.js');
const { forceToArray } = libR.R;

forceToArray(3);
//[3]
forceToAray([4, 5]);
//[4,5]
```

### `forEach`

Functional analog to `Array.prototype.forEach`, but also takes **non-array** arguments. The return type can be either an new array or a scalar (see `Example`)

_decl:_

```typescript
function forEach<T>(xx: T): { (fn: (x: number) => number): number | number[] };
```

Example:

```javascript
const libR = require('lib-r-math.js');
const { forEach } = libR.R;

forEach(11)(v => v * 2);
//22

// single element array result are forced to scalar
forEach([3])(v => v * 2);
//6

forEach([11, 12])(v => v * 2);
// [22, 24]
```

### `selector`

Filter function generator, to be used with `Array.prototype.filter` to pick elements based on their order (zero based index) in the array.
Usually used together with `seq` to pick items from an array.

**NOTE:** Always returns an instance of Array.

_decl:_

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

_decl:_

```typescript
const seq = (adjust = 0) => (adjustMin = adjust) => (
  start: number,
  end: number,
  step?: number
) => number[];
```

R analog to the `seq` function in R. Generates an array between `start` and `end` (inclusive) using `step` (defaults to `1`). This function ignores the entered **sign** of the
`step` argument and only looks at its absolute value.

If `(end-start)/step` is not an exact integer, `seq` will not overstep the bounds while counting up (or down).

* `adjust`: If `end` >= `start` then `adjust` value is added to every element in the array.
* `adjustMin`: if `start` >= `end` then `adjustMin` value is added to every element in the array.

First we look how `seq` works in R.

_R analog ( R Console):_

```R
> seq(1,3,0.5)
[1] 1.0 1.5 2.0 2.5 3.0

> seq(7,-2, -1.3)
[1]  7.0  5.7  4.4  3.1  1.8  0.5 -0.8
```

Using `lib-r-math.js`:

```javascript
const libR = require('lib-r-math.js');
const seqGenerator = libR.R.seq;

let seqA = seqGenerator()();

seqA(1, 5);
//[ 1, 2, 3, 4, 5 ]
seqA(5, -3);
//[ 5, 4, 3, 2, 1, 0, -1, -2, -3 ]

let seqB = seqGenerator(1)(-2);

seqB(0, 4); //range will be adjusted with '1'
//[ 1, 2, 3, 4]
seqB(6, 5, 0.3); //range will be adjusted with '-2', step
//[ 4, 4.7, 4.4, 4.1 ]  will not overstep boundery '4'
```

# Uniform Pseudo Random Number Generators.

#### Summary

In 'R' numerous random number generators are documented with their particular
distributions. For example `rt` (_random generator having a distribution of
Student-T_) is documented with all functions related to the student-T
distribution, like `qt` (quantile function), `pt` (cumulative probability
function), `dt` (probability density function).

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

1. `init`: set the random generator seed (it will be pre-scrambled)
2. `seed (read/write property)`: get/set the current seed values as an array.
3. `unif_random`: get a random value, same as `runif(1)` in R

#### "Mersenne Twister"

From Matsumoto and Nishimura (1998). A twisted GFSR with period `2^19937 - 1`
and equi-distribution in 623 consecutive dimensions (over the whole period). The
_`seed`_ is a 624-dimensional set of 32-bit integers plus a current position in
that set.

usage example:

```javascript
const libR = require('lib-r-math.js');
const { MersenneTwister, timeseed } = libR.rng;

const mt = new MersenneTwister(12345); // initialize with seed = 12345

mt.init(timeseed()); // Use seed derived from system clock

mt.init(0); // re-initialize with seed = 0

// get internal seed buffer of 625 32 bit signed integer
let s = lt.seed;
/*
  [ 624,
  1280795612,
  -169270483,
  -442010614,
  -603558397,
  .
  .
  .]
*/

new Array(5).fill('').map(() => mt.unif_rand());
/*
[ 0.8966972001362592,
  0.2655086631421,
  0.37212389963679016,
  0.5728533633518964,
  0.9082077899947762 ]
*/
```

_in R console_:

```R
  > RNGkind("Mersenne-Twister")
  > set.seed(0)
  > runif(5)
[1] 0.8966972 0.2655087 0.3721239 0.5728534
[5] 0.9082078
```

#### "Wichmann-Hill"

The seed, is an integer vector of length 3, where each element is in `1:(p[i] - 1)`, where p is the length 3 vector of primes, `p = (30269, 30307, 30323)`. The
`Wichmann–Hill` generator has a cycle length of `6.9536e12 = ( 30269 * 30307 * 30323 )`, see Applied Statistics (1984) 33, 123 which corrects the original
article).

usage example:

```javascript
const libR = require('lib-r-math.js');
const { WichmannHill, timeseed } = libR.rng;

// Some options on seeding given below
const wh = new WichmannHill(1234); // initialize seed with 1234 on creation (default 0)
//
wh.init( timeseed() ); // re-init seed with a random seed based on timestamp

wh.init(0); // re-init seed to zero
wh.seed; // show seed
//[ 2882, 21792, 10079 ]
> new Array(5).fill('').map( () => wh.unif_rand() )
/*[ 0.4625531507458778,
  0.2658267503314409,
  0.5772107804324318,
  0.5107932055258312,
  0.33756055865261403 ]
*/
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
const { MarsagliaMultiCarry, timeseed } = libR.rng;

// Some options on seeding given below
const mmc = new MarsagliaMultiCarry(1234); // use seed = 1234 on creation

mmc.init(timeseed());

mmc.init(0); // also, defaults to '0' if seed is not specified

mmc.seed;
//[ -835792825, 1280795612 ]
new Array(5).fill('').map(() => mm.unif_rand());
/*[ 0.16915375533726848,
  0.5315435299490446,
  0.5946052972214773,
  0.23331540595584438,
  0.45765617989414736 ]
*/
```

_in R console_:

```R
> RNGkind("Marsaglia-Multicarry")
> set.seed(0)
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
const { SuperDuper, timeseed } = libR.rng;

// Seeding possibilities shown below
const sd = new SuperDuper(1234); // use seed = 1234 on creation
sd.init(timeseed()); // re-initialize with random seed based on timestamp
sd.init(0); // re-initialize with any seed = 0.
//
sd.seed;
//[ -835792825, 1280795613 ]
new Array(5).fill('').map(() => sd.unif_rand());
/*
[ 0.6404035621416762,
  0.5927312545461418,
  0.41296871248934613,
  0.18772939946216746,
  0.26790581137591635 
]
*/
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
const { KnuthTAOCP, timeseed } = libR.rng;

// Seeding possibilities shown below
const kn97 = new KnuthTAOCP(1234); // use seed = 1234 on creation
kn97.init(timeseed()); // re-initialize with random seed based on timestamp
kn97.init(0); // re-initialize with any seed = 0.

kn97.seed;
// 101 unsigned integer array, only shown the first few values
/*[ 673666444,
  380305043,
  1062889978,
  926003693,
 .
 .]*/
new Array(5).fill('').map(() => kn97.unif_rand());
/*[ 0.6274007670581344,
  0.35418667178601043,
  0.9898934308439498,
  0.8624081434682015,
  0.6622992046177391 ]*/
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
const { KnuthTAOCP2002, timeseed } = libR.rng;

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
new Array(5).fill('').map(() => kt2002.unif_rand());
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
const { LecuyerCMRG, timestamp } = libR.rng;

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
new Array(5).fill('').map(() => lc.unif_rand());
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

These PRNG classes can be used by themselves but mostly intended to be consumed
to generate random numbers with a particular distribution (like `Normal`,
`Gamma`, `Weibull`, `Chi-square` etc). Type in your R-console the command
`?RNGkind` for an overview.

All 6 normal random generators have been ported and tested to yield exactly the
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

// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const sd = new libR.rng.SuperDuper(0);
const ad1 = new libR.rng.normal.AhrensDieter(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const ad2 = new libR.rng.normal.AhrensDieter();

// reference to uniform PRNG under rng property
ad2.rng.init(0);
// bleed the normal PRNG
new Array(5).fill('').map(() => ad2.norm_rand());
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
new Array(5).fill('').map(() => bm2.norm_rand());
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
new Array(5).fill('').map(() => bkm2.norm_rand());
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
const sd = new libR.rng.SuperDuper(0);
const inv1 = new libR.rng.normal.Inversion(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const inv2 = new libR.rng.normal.Inversion();

// reference to uniform PRNG under rng property
inv2.rng.init(0);
// bleed the normal PRNG
new Array(5).fill('').map(() => inv2.norm_rand());
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
const sd = new libR.rng.SuperDuper(0);
const km1 = new libR.rng.normal.KindermanRamage(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default: new MersenneTwister(0)
const km2 = new libR.rng.normal.KindermanRamage();

// reference to uniform PRNG under rng property
km2.rng.init(0);
// bleed the normal PRNG
new Array(5).fill('').map(() => km2.norm_rand());
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

_decl:_

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

_decl:_

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

_decl:_

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

_decl:_

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
R documentation [here](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html)

These functions are created with the factory method `Normal` taking as argument an optional _normal PRNG_ (defaults to [Inversion](#inversion).

Usage:

```javascript
const libR = require('lib-r-math.js');

// get the suite of functions working with uniform distributions
const { Normal } = libR;
const { normal: { BoxMuller }, SuperDuper }

//Create Normal family of functions using "BoxMuller" feeding from "SuperDuper"
const norm1 = Normal(new BoxMuller( new SuperDuper(0)));

// using the default "Inversion" feeding from "Mersenne-Twister".
const norm2 = Normal(); //

// functions exactly named as in `R`
const { rnorm, dnorm, pnorm, qnorm } = norm2;
```

#### `dnorm`

The density function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html)

_decl:_

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

_in R Console_

```R
> dnorm(seq(-4,4),2, 1, TRUE)
[1] -18.9189385 -13.4189385
[3]  -8.9189385  -5.4189385
[5]  -2.9189385  -1.4189385
[7]  -0.9189385  -1.4189385
[9]  -2.9189385
```

#### `pnorm`

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

The quantile function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html])

_decl:_

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

_decl:_

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

See [R doc]()

These functions are members of an object created by the `Beta` factory method. The factory method needs the return object of the `Normal` factory method. Various instantiation methods are given below.

Instantiation:

```javascript
const libR = require('lib-r-math.js');
const { Normal, Beta, rng } = libR;

// All options specified in creating Beta distribution object.
const beta1 = Beta(
  Normal(
    new rng.normal.BoxMuller(new rng.SuperDuper(0)) //
  )
);

// Or

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const betaDefault = Beta();
const { dbeta, pbeta, qbeta, rbeta } = betaDefault;
```

#### `dbeta`

The density function. See [R doc]()

$$ \frac{\Gamma(a+b)}{Γ(a) Γ(b)} x^{(a-1)}(1-x)^{(b-1)} $$

_decl:_

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
const { Beta } = libR;

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const betaDefault = Beta();
const { dbeta, pbeta, qbeta, rbeta } = betaDefault;

// ncp argument = 1
dbeta(0.4, 2, 2, 1);
//1.287245740256553

// give as log
dbeta(0.4, 2, 2, undefined, true);
//0.36464311358790935

dbeta(0.4, 2, 2, 1, true);
//0.25250485075747914

dbeta([0, 0.2, 0.4, 0.8, 1, 1.2], 2, 2);
/*
    [ 0,
      0.9600000000000001,
      1.4400000000000002,
      0.9599999999999999,
      0,
      0 ]
*/
```

_in R Console_

```R
> dbeta(0.4,2,2, ncp=1)
> [1] 1.287246
> dbeta(0.4,2,2, log = TRUE)
> [1] 0.3646431
> dbeta(0.4,2,2, ncp=1, TRUE)
> [1] 0.2525049
> dbeta( c(-1,0,0.2,0.4,0.8,1,1.2), 2, 2, 1)
[1] 0.0000000 0.0000000
[3] 0.7089305 1.2872457
[5] 1.2392653 0.0000000
[7] 0.0000000
```

#### `pbeta`

```typescript
function pbeta(
  q: number|number[],
  shape1: number,
  shape2: number,
  ncp?: number,
  lowerTail: boolean = true,
  logP: boolean = false
  ): number|number[]
```

* `x`: scalar or array of quantiles. 0 <= x <= 1
* `shape1`: non-negative `a` parameter of the Beta distribution.
* `shape2`: non-negative `b` parameter of the Beta distribution.
* `ncp`: non centrality parameter. _Note: `undefined` is different then `0`_
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `Log`: return probabilities as log(p)

```javascript
const libR = require('lib-r-math.js');
const { Normal, arrayrify } = libR;
const { arrayrify } = libR.R;

const log = arrayrify(Math.log); // Make Math.log accept/return arrays aswell as scalars

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const betaDefault = Beta();
const { dbeta, pbeta, qbeta, rbeta } = betaDefault;

pbeta(0.5, 2, 5);

pbeta(0.5, 2, 5, 4);

pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, 4);

pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, 4, undefined, false);

const logP = log([0, 0.2, 0.4, 0.6, 0.8, 1]);
pbeta(logP, 2, 5, 4, undefined, false, true);
```

_in R console_


```R
> pnorm(-1:1, 0, 1, FALSE, TRUE)
[1] -0.1727538 -0.6931472 -1.8410216
```

#### `qnorm`

The quantile function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html])

_decl:_

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

_decl:_

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
