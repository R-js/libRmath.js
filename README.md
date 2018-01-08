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

* [Bugs in R discovered during porting](#bugs-in-r-discovered-during-porting)
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
  * [Hypergeometric distr,ibution](#hypergeometric-distribution)
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
const { normal: { BoxMuller }, SuperDuper } = libR.rng;

//Create Normal family of functions using "BoxMuller" feeding from "SuperDuper"
const norm1 = Normal(new BoxMuller(new SuperDuper(0)));

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

Usage:

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

The density function:

$$ \frac{\Gamma(a+b)}{Γ(a) Γ(b)} x^{(a-1)}(1-x)^{(b-1)} $$

See [R doc]()

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
const { Normal, arrayrify } = libR;
const { arrayrify } = libR.R;

const log = arrayrify(Math.log); // Make Math.log accept/return arrays aswell as scalars

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const betaDefault = Beta();
const { dbeta, pbeta, qbeta, rbeta } = betaDefault;

//1.
pbeta(0.5, 2, 5);
//0.890625

//2.
pbeta(0.5, 2, 5, 4);
//0.6392384298407979

//3.
pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, 4);
/*
[ 0,
  0.10651771838654696,
  0.4381503446552259,
  0.8135393957100374,
  0.9860245167373386,
  1 ]
*/

//4.
pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined);
/*[ 0,
  0.3450274742710367,
  0.7667200000000001,
  0.9590399999999999,
  0.9984,
  1 ]*/

//5. Same as 4
pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined, false).map(v => 1 - v);
//[ 0, 0.34502747427103664, 0.7667200000000001, 0.95904, 0.9984, 1 ]

//6.
pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined, true, true);
/*[ -Infinity,
  -1.0641312295532985,
  -0.2656336029351618,
  -0.04182249485383877,
  -0.0016012813669738792,
  0 ]
  */

//7. Same as 6
log(pbeta([0, 0.2, 0.4, 0.6, 0.8, 1], 2, 5, undefined, true));
/*[ -Infinity,
  -1.0641312295532985,
  -0.2656336029351618,
  -0.04182249485383877,
  -0.0016012813669738792,
  0 ]*/
```

_in R console_

```R
> pbeta(0.5, 2, 5);
[1] 0.890625

> pbeta(0.5, 2, 5, 4)
[1] 0.6392384

> pbeta(c(0, 0.2, 0.4, 0.6, 0.8, 1), 2, 5, 4);
[1] 0.0000000 0.1061302 0.4381503 0.8135394
[5] 0.9860245 1.0000000

> pbeta(c(0, 0.2, 0.4, 0.6, 0.8, 1), 2, 5);
[1] 0.00000 0.34464 0.76672 0.95904 0.99840 1.00000

> 1-pbeta(c(0, 0.2, 0.4, 0.6, 0.8, 1), 2, 5,lower.tail = FALSE);
[1] 0.00000 0.34464 0.76672 0.95904 0.99840 1.00000

> pbeta(c(0, 0.2, 0.4, 0.6, 0.8, 1), 2, 5, log.p=TRUE)
[1]         -Inf -1.065254885 -0.265633603
[4] -0.041822495 -0.001601281  0.000000000

> log(pbeta(c(0, 0.2, 0.4, 0.6, 0.8, 1), 2, 5, log.p=FALSE))
[1]         -Inf -1.065254885 -0.265633603
[4] -0.041822495 -0.001601281  0.000000000
```

#### `qbeta`

The quantile function. See [R doc]()

_decl:_

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
const { Normal, arrayrify } = libR;
const { arrayrify } = libR.R;

const log = arrayrify(Math.log); // Make Math.log accept/return arrays aswell as scalars

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const betaDefault = Beta();
const { dbeta, pbeta, qbeta, rbeta } = betaDefault;

//1. always zero, regardless of shape params, because 0 ≤ x ≤ 1.
qbeta(0, 99, 66);

//2.
qbeta([0, 1], 99, 66);
//[0, 1]

//3. take quantiles of 25%
qbeta([0, 0.25, 0.5, 0.75, 1], 4, 5);
//[0, 0.3290834273473526, 0.4401552046347658, 0.555486315052315, 1]

//4. ncp = 3
qbeta([0, 0.25, 0.5, 0.75, 1], 4, 5, 3);
/*[0,
    0.4068615143975546,
    0.5213446410803881,
    0.6318812884183387,
    1
]*/

//5. ncp = undefined, lowerTail = false, logP=false(default)
qbeta([0, 0.25, 0.5, 0.75, 1], 4, 5, undefined, false); //
//[1, 0.555486315052315, 0.4401552046347658, 0.3290834273473526, 0]

//6. same as [5] but, logP=true,
qbeta(
  log([0, 0.25, 0.5, 0.75, 1]), //uses log!!
  4,
  5,
  undefined,
  false,
  true //logP=true (default=false)
);
//[1, 0.5554863150523149, 0.4401552046347659, 0.3290834273473526,0]
```

_in R console_

```R
> qbeta(0,99,66)
[1] 0
> qbeta(c(0,1),99,66)
[1] 0 1
> qbeta(c(0,.25,.5,.75,1),4,5)
[1] 0.0000000 0.3290834 0.4401552 0.5554863
[5] 1.0000000
> qbeta(c(0,.25,.5,.75,1),4,5,3)
[1] 0.0000000 0.4068615 0.5213446 0.6318813
[5] 1.0000000
> qbeta(c(0,.25,.5,.75,1),4,5, lower.tail = FALSE)
[1] 1.0000000 0.5554863 0.4401552 0.3290834
[5] 0.0000000
> qbeta(  log(c(0,.25,.5,.75,1))  ,4,5, lower.tail = FALSE, log.p=TRUE)
[1] 1.0000000 0.5554863 0.4401552 0.3290834
[5] 0.0000000
```

#### `rbeta`

Generates random beta deviates. See [R doc]()

_decl:_

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
const { Normal, arrayrify } = libR;
const { arrayrify } = libR.R;

const log = arrayrify(Math.log); //

const ms = new rng.MersenneTwister();
const normal = Normal(
  new rng.normal.Inversion(ms) //
);

const { dbeta, pbeta, qbeta, rbeta } = Beta(normal);

//1.
rbeta(5, 0.5, 0.5);
/*[ 
  0.013098047643758154,
  0.7400506805879669,
  0.010111774256128941,
  0.20854751527938128,
  0.9956818177201189 ]
*/
//2.
rbeta(5, 2, 2, 4);
/*[
  0.5980046007391424,
  0.7845364019165674,
  0.38714281264097156,
  0.6574810088488372,
  0.5130534358873073 ]*/

//3. // re-initialize seed
ms.init(0);

rbeta(5, 2, 2);
/*[
  0.8217275310624295,
  0.40856545946555944,
  0.8348848069043071,
  0.6157470523244717,
  0.12746731085753737 ]
*/

//4.
rbeta(5, 2, 2, 5);
/*[
  0.5980046007391424,
  0.7845364019165674,
  0.38714281264097156,
  0.7444424314387296,
  0.5130534358873073 ]
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
> set.seed(0)
> rbeta(5,2,2)
[1] 0.8217275 0.4085655 0.8348848 0.6157471
[5] 0.1274673
> rbeta(5,2,2,5)
[1] 0.5980046 0.7845364 0.3871428 0.7444424
[5] 0.5130534
```

### Binomial distribution

`dbinom, qbinom, pbinom, rbinom`

See [R doc]()

These functions are members of an object created by the `Binomial` factory method. The factory method needs the result of a call to the function `Normal(..)` factory method. Various instantiation methods are given below.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Normal, Binomial, rng } = libR;

// All options specified in creating Beta distribution object.
const binom1 = Binomial(new rng.MersenneTwister(1234)); //
);

// Or

//just go with defaults
const binom2 = Binomial();
const { dbinom, pbinom, qbinom, rbinom } = binom2;
```

#### `dbinom`

The density function $p(x) = \frac{n!}{x!(n-x)!} p^{x} (1-p)^{n-x}$. See [R doc]()

_decl_

```typescript
declare function dbinom(
  x: number,
  size: number,
  p: number,
  Log = false
): number | number[];
```

* `x`: scalar or array of quantiles.
* `size`: number of trails
* `p`: probability of success.
* `Log`: return result as log(p)

```javascript
const libR = require('lib-r-math.js');
const { Binomial } = libR;

//Binomial()  uses Normal() as default argument,
const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//1. 2 successes out of 4 trials, with success probility 0.3
dbinom(2, 4, 0.3);
//0.2646000000000001

//2. same as [1], but results as log
dbinom(2, 4, 0.3, true);
//-1.3295360273012813

//3. all possibilities out of 4 trials
dbinom([0, 1, 2, 3, 4], 4, 0.3);
/*[ 0.24009999999999992,
  0.41159999999999997,
  0.2646000000000001,
  0.0756,
  0.008099999999999996 ]
*/
dbinom([0, 1, 2, 3, 4], 4, 0.3, true);
/*[ -1.4266997757549298,
  -0.8877032750222426,
  -1.3295360273012813,
  -2.58229899579665,
  -4.8158912173037445 ]*/
```

_in R Console_

```R
> dbinom(2,4,0.3)
[1] 0.2646
> dbinom(2,4,0.3, TRUE)
[1] -1.329536
> dbinom(c(0,1,2,3,4),4,0.3)
[1] 0.2401 0.4116 0.2646 0.0756 0.0081
> dbinom(c(0,1,2,3,4),4,0.3, TRUE)
[1] -1.4266998 -0.8877033 -1.3295360 -2.5822990
[5] -4.8158912
```

#### `pbinom`

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
const { Binomial } = libR;

//Binomial()  uses Normal() as default argument,
const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//1.
pbinom(4, 4, 0.5);
//1

//2.
pbinom([0, 1, 2, 3, 4], 4, 0.5);
//[ 0.0625, 0.31250000000000006, 0.6875, 0.9375, 1 ]

//3.
pbinom([0, 1, 2, 3, 4], 4, 0.5, true);
//[ 0.0625, 0.31250000000000006, 0.6875, 0.9375, 1 ]

//4.
pbinom([0, 1, 2, 3, 4], 4, 0.5, false);
//[ 0.9375, 0.6875, 0.31250000000000006, 0.0625, 0 ]

//5.
pbinom([0, 1, 2, 3, 4], 4, 0.5, false, true);
/*
[ -0.06453852113757118,
  -0.3746934494414107,
  -1.1631508098056806,
  -2.772588722239781,
  -Infinity]
*/
```

_in R console_

```R
> pbinom(4, 4, 0.5)
[1] 1

> pbinom(c(0, 1, 2, 3, 4), 4, 0.5)
[1] 0.0625 0.3125 0.6875 0.9375 1.0000

> pbinom(c(0, 1, 2, 3, 4), 4, 0.5, TRUE)
[1] 0.0625 0.3125 0.6875 0.9375 1.0000

> pbinom(c(0, 1, 2, 3, 4), 4, 0.5, FALSE, TRUE)
[1] -0.06453852 -0.37469345 -1.16315081
[4] -2.77258872        -Inf
```

#### `qbinom`

The quantile function. See [R doc]()

_decl:_

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

const { Binomial } = libR;
const { arrayrify } = libR.R;

const log = arrayrify(Math.log); //
//Binomial(), uses Normal() as default argument,
const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//1. always zero, regardless of shape params, because 0 ≤ x ≤ 1.
qbinom(0.25, 4, 0.3);
// 1

//2.
qbinom([0, 0.25, 0.5, 0.75, 1], 40, 0.3);
//[0 10 12 14 40]

//3.
qbinom([0, 0.25, 0.5, 0.75, 1], 40, 0.3, false);
//[ 40, 14, 12, 10, 0 ]

//4.  same as 3.
qbinom(log([0, 0.25, 0.5, 0.75, 1]), 40, 0.3, false, true);
//[ 40, 14, 12, 10, 0 ]
```

_in R console_

```R
> qbinom(.25,4,.3)
[1] 1
> qbinom(c(0,0.25,0.5,0.75,1),40,.3)
[1]  0 10 12 14 40
> qbinom(c(0,0.25,0.5,0.75,1),40,.3, FALSE)
[1] 40 14 12 10  0
> qbinom(log(c(0,0.25,0.5,0.75,1)),40,.3, FALSE, TRUE)
[1] 40 14 12 10  0
```

#### `rbinom`

Generates random beta deviates. See [R doc]()

_decl:_

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

const { Binomial } = libR;
const { arrayrify } = libR.R;

const log = arrayrify(Math.log); //
//Binomial(), uses Normal() as default argument,
const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//1.
rbinom(2, 40, 0.5);
//[ 24, 18 ]

//2.
rbinom(3, 20, 0.5);
//[ 9, 10, 13 ]

//3.
rbinom(2, 10, 0.25);
//[ 1, 4 ]
```

Same values as in R

_in R console_

```R
> RNGkind("Mersenne-Twister", normal.kind = "Inversion")
> set.seed(0)
> rbinom(2, 40, 0.5);
[1] 24 18
> rbinom(3, 20, 0.5);
[1]  9 10 13
> rbinom(2, 10, 0.25);
[1] 1 4
```

### Negative Binomial distribution

`dnbinom, pnbinom, qnbinom, rnbinom.`

See [R doc]()

These functions are members of an object created by the `NegativeBinomial` factory function. The factory method needs the result of a call to the `Normal(..)` factory function. Various instantiation methods are given below.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Normal, NegativeBinomial, rng } = libR;

// All options specified in creating NegativeBinomial distribution object.
const negBinom1 = NegativeBinomial(
  Normal(
    new rng.normal.BoxMuller(new rng.SuperDuper(0)) //
  )
);
//
// Or
// Just go with defaults
const negBinom2 = NegativeBinomial();
const { dnbinom, pnbinom, qnbinom, rnbinom } = negBinom2;
```

#### `dnbinom`

The density function $\frac{Γ(x+n)}{Γ(n) x!} p^{n} (1-p)^{x}$. See [R doc]()

_decl:_

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

```javascript
const libR = require('lib-r-math.js');
const { NegativeBinomial } = libR;
const seq = libR.R.seq()();

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

//1. note: sequence has step 2
dnbinom(
  seq(0, 10, 2), // array[0,2,4,6,8,10]
  3,
  0.5
);
/*
   [0.12500000000000003,
    0.18749999999999997,
    0.11718749999999997,
    0.05468750000000006,
    0.02197265624999999,
    0.008056640624999997]
*/

//2. alternative presentation with `mu` = n*(1-p)/p
dnbinom(
  seq(0, 10, 2), // array[0,2,4,6,8,10]
  3, //size
  undefined, //prop
  3 * (1 - 0.5) / 0.5
);
/*[0.12500000000000003,
    0.18749999999999997,
    0.11718749999999997,
    0.05468750000000006,
    0.02197265624999999,
    0.008056640624999997]
*/
```

_in R console_

```R
> dnbinom(0:10, size = 3, prob = 0.5)
 [1] 0.125000000 0.187500000 0.187500000
 [4] 0.156250000 0.117187500 0.082031250
 [7] 0.054687500 0.035156250 0.021972656
[10] 0.013427734 0.008056641
> dnbinom(0:10, size = 3, mu = 3*(1-0.5)/0.5)
 [1] 0.125000000 0.187500000 0.187500000
 [4] 0.156250000 0.117187500 0.082031250
 [7] 0.054687500 0.035156250 0.021972656
[10] 0.013427734 0.008056641
```

#### `pnbinom`

The gives the distribution function. See [R doc]()

_decl:_

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

```javascript
const libR = require('lib-r-math.js');
const { NegativeBinomial } = libR;
const seq = libR.R.seq()();

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

//1.
pnbinom([0, 2, 3, 4, 6, 8, 10, Infinity], 3, 0.5);
/*[ 0.12500000000000003,
      0.5000000000000001,
      0.65625,
      0.7734374999999999,
      0.91015625,
      0.96728515625,
      0.98876953125,
      1
    ]
*/

//2. alternative presentation of 1 with mu = n(1-p)/p
pnbinom([0, 2, 3, 4, 6, Infinity], 3, undefined, 3 * (1 - 0.5) / 0.5);
/*[0.12500000000000003,
    0.5000000000000001,
    0.65625,
    0.7734374999999999,
    0.91015625,
    0.96728515625,
    0.98876953125,
    1
]*/

//3
pnbinom([0, 2, 3, 4, 6, Infinity], 3, 0.5, undefined, false);
/*[ 0.875,
  0.4999999999999999,
  0.34374999999999994,
  0.2265625000000001,
  0.08984375000000003,
  0 ]
  */

//4
pnbinom([0, 2, 3, 4, 6, Infinity], 3, 0.5, undefined, false, true);
/*[
  -0.13353139262452263,
  -0.6931471805599455,
  -1.067840630001356,
  -1.4847344339331427,
  -2.4096832285504126,
  -Infinity
]*/
```

_in R Console_

```R
> pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5)
[1] 0.1250000 0.5000000 0.6562500 0.7734375
[5] 0.9101562 1.0000000

> pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, mu=3*(1-0.5)/0.5)
[1] 0.1250000 0.5000000 0.6562500 0.7734375
[5] 0.9101562 1.0000000

> pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5, lower.tail=FALSE);
[1] 0.87500000 0.50000000 0.34375000 0.22656250 0.08984375
[6] 0.00000000

> pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5, lower.tail=FALSE, log.p=TRUE);
[1] -0.1335314 -0.6931472 -1.0678406 -1.4847344 -2.4096832
[6]       -Inf
```

#### `qnbinom`

The gives the quantile function. See [R doc]()

_decl:_

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

```javascript
const libR = require('lib-r-math.js');
const { NegativeBinomial } = libR;
const { arrayrify } = libR.R;
const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

const log = arrayrify(Math.log);

//1. inversion
qnbinom(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5), 3, 0.5);
//[ 0, 2, 4, 6, Infinity ]

//2. lowerTail=false
qnbinom(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5), 3, 0.5, undefined, false);
//[ 6, 2, 1, 0, 0 ]

//3. with logP=true
qnbinom(
  log(pnbinom([0, 2, 4, 6, Infinity], 3, 0.5)),
  3,
  0.5,
  undefined,
  false,
  true
);
//[ 6, 2, 1, 0, 0 ]
```

_in R Console_

```R
> qnbinom(pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5 ),3,0.5);
[1] 0 2 3 4 6 Inf

> qnbinom(pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5 ),3,0.5, lower.tail = FALSE);
[1] 6 2 2 1 0 0

> qnbinom(log(pnbinom(c(0, 2, 3, 4, 6, Inf), size=3, prob=0.5 )),3,0.5, lower.tail = FALSE, log.p = TRUE);
[1] 6 2 2 1 0 0
```

#### `rnbinom`

Generates random negative binomial deviates. Returns the number of failures to reach `size` successes. See [R doc]()

_decl:_

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

```javascript
const libR = require('lib-r-math.js');
const { NegativeBinomial, Normal } = libR;
const { normal: { Inversion }, MersenneTwister } = libR.rng;

const mt = new MersenneTwister(0);

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial(
  Normal(new Inversion(mt))
);

//1. size = 100, prob=0.5, so expect success/failure to be approximatly equal
rnbinom(7, 100, 0.5);
//[ 109, 95, 89, 112, 88, 90, 90 ]

//2. size = 100, prob=0.1, so expect failure to be approx 10 x size
rnbinom(7, 100, 0.1);
//[ 989, 1004, 842, 974, 820, 871, 798 ]

//3. size = 100, prob=0.9, so expect failure to be approx 1/10 x size
rnbinom(7, 100, 0.9);
//[ 10, 14, 9, 7, 12, 11, 10 ]

mt.init(0); //reset
//4. same as (1.)
rnbinom(7, 100, undefined, 100 * (1 - 0.5) / 0.5);
//[ 109, 95, 89, 112, 88, 90, 90 ]
```

_in R Console_

```R
> rnbinom(7, 100, 0.5);
[1] 109  95  89 112  88  90  90

> rnbinom(7, 100, 0.1);
[1]  989 1004  842  974  820  871  798

> rnbinom(7, 100, 0.9);
[1] 10 14  9  7 12 11 10

> set.seed(0)
> rnbinom(7, 100, mu=100*(1-0.5)/0.5);
[1] 109  95  89 112  88  90  90
```

### Cauchy distribution

`dcauchy, qcauchy, pcauchy, rcauchy`

See [R doc](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html)

These functions are members of an object created by the `Cauchy` factory method. The factory method needs as optional argument an instance of [one of the](#uniform-pseudo-random-number-generators) PRNG uniform generators.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Cauchy, rng: { MersenneTwister } } = libR;
// some usefull tools
const { arrayrify } = libR.R;
const log = arrayrify(Math.log);
const seq = libR.R.seq()();

//example 1: default
const defaultCauchy = Cauchy();

//example 2: explicit PRNG usage
const mt = new MersenneTwister(0);
const cauchy1 = Cauchy(mt);

//strip the needed functions
const { dcauchy, pcauchy, qcauchy, rcauchy } = cauchy1;
```

#### `dcauchy`

[The Cauchy density](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html) function, with `s` is the _"scale"_ parameter and `l` is the _"location"_ parameter.

$$ f(x) = \frac{1}{ π s (1 + ( \frac{x-l}{s} )^{2}) } $$

_decl:_

```typescript
declare function dcauchy(
  x: number | number[],
  location = 0,
  scale = 1,
  asLog = false
): number | number[];
```

* `x`: scalar or array of quantile(s).
* `location`: the location parameter [wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)
* `scale`: the scale parameter [wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)
* `asLog`: return values as log(p)

```javascript
const libR = require('lib-r-math.js');
const { Cauchy } = libR;
// some usefull tools
const log = arrayrify(Math.log);
const seq = libR.R.seq()();
// initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();

//1.
dcauchy(seq(-4, 4, 2), -2, 0.5);
/*
[ 0.03744822190397537,
  0.6366197723675814,
  0.03744822190397537,
  0.009794150344116638,
  0.00439048118874194 ]
*/

//2.
dcauchy(seq(-4, 4, 2), -2, 0.5, true);
/*
[ -3.284796049345671,
  -0.4515827052894548,
  -3.284796049345671,
  -4.625969975185092,
  -5.42831644771003 ]
*/

//3.
dcauchy(seq(-4, 4, 2), 0, 2);
/*[ 0.03183098861837907,
  0.07957747154594767,
  0.15915494309189535,
  0.07957747154594767,
  0.03183098861837907 ]
*/
```

_in R console_

```R
> dcauchy(seq(-4,4,2), location=-2, scale=0.5);
[1] 0.037448222 0.636619772 0.037448222 0.009794150 0.004390481

> dcauchy(seq(-4,4,2), location=-2, scale=0.5, log=TRUE);
[1] -3.2847960 -0.4515827 -3.2847960 -4.6259700 -5.4283164

> dcauchy(seq(-4,4,2), location=0, scale=2);
[1] 0.03183099 0.07957747 0.15915494 0.07957747 0.03183099
```

#### `pcauchy`

The [Cauchy distribution](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html) function.

_decl:_

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
* `location`: The location parameter ([wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)].
* `scale`: The scale parameter ([wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)).
* `lowerTail`: If TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: If TRUE, probabilities p are given as log(p).

```javascript
const libR = require('lib-r-math.js');
const { Cauchy } = libR;
// some usefull tools
const log = arrayrify(Math.log);
const seq = libR.R.seq()();
// initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();

//1
pcauchy(seq(-4, 4, 2), -2, 0.5);
/*
[ 0.07797913037736932,
  0.5,
  0.9220208696226306,
  0.9604165758394345,
  0.9735353239404101 ]
*/

//2.
pcauchy(seq(-4, 4, 2), -2, 0.5, true);
/*
[ 0.07797913037736932,
  0.5,
  0.9220208696226306,
  0.9604165758394345,
  0.9735353239404101 ]
*/

//3.
pcauchy(seq(-4, 4, 2), 0, 2);
/*
[
  0.14758361765043326,
  0.25,
  0.5,
  0.75,
  0.8524163823495667
]
*/
```

_in R console_

```R
> pcauchy(seq(-4,4,2), location=-2, scale=0.5);
[1] 0.07797913 0.50000000 0.92202087 0.96041658 0.97353532

> pcauchy(seq(-4,4,2), location=-2, scale=0.5, log=TRUE);
[1] -2.55131405 -0.69314718 -0.08118742 -0.04038816 -0.02682117

> pcauchy(seq(-4,4,2), location=0, scale=2);
[1] 0.1475836 0.2500000 0.5000000 0.7500000 0.8524164
```

#### `qcauchy`

The [Cauchy quantile](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html) function.

```typescript
declare function qcauchy(
  p: number | number[],
  location = 0,
  scale = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `p`: Scalar or array of propbabilities(s).
* `location`: The location parameter ([wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)].
* `scale`: The scale parameter ([wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)).
* `lowerTail`: If TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: If TRUE, probabilities p are given as log(p).

```javascript
const libR = require('lib-r-math.js');
const { Cauchy } = libR;
// some usefull tools
const log = arrayrify(Math.log);
const seq = libR.R.seq()();
// initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();

//1. qcauchy is the inverse of pcauchy, see comments below on '0'
// Note, all results are within Number.EPSILON accuracy!!
qcauchy(pcauchy(seq(-4, 4, 2), -2, 0.5), -2, 0.5);
/*[ -4,
  -2,
  -8.881784197001252e-16, ==> 0
  2.000000000000006, ==> 2
  3.999999999999992 ] ==> 4
*/

//2.
qcauchy(pcauchy(seq(-4, 4, 2), -2, 0.5, true), -2, 0.5, true);
/*
[
   -4,
  -2,
  -8.881784197001252e-16,
  2.000000000000006,
  3.999999999999992
]
*/

//3.
qcauchy(pcauchy(seq(-4, 4, 2), 0, 2), 0, 2);
/*
[ -4.000000000000001,
  -2.0000000000000004,
  0,
  2.0000000000000004,
  4.000000000000001 ]
*/
```

_in R Console_

```R
> qcauchy( pcauchy(seq(-4, 4, 2), -2, 0.5),  -2,  0.5 );
[1] -4.000000e+00 -2.000000e+00 -8.881784e-16  2.000000e+00  4.000000e+00

> qcauchy(pcauchy(seq(-4, 4, 2), -2, 0.5, lower.tail=TRUE),  -2,  0.5, lower.t$
[1] -4.000000e+00 -2.000000e+00 -8.881784e-16  2.000000e+00  4.000000e+00

> qcauchy(pcauchy(seq(-4, 4, 2), 0, 2),0,2);
[1] -4 -2  0  2  4
```

#### `rcauchy`

Generates random deviates from the [Cauchy distribution](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html).

```typescript
declare function rcauchy(n: number, location = 0, scale = 1): number | number[];
```

* `n`: number of deviates to generate.
* `location`: The location parameter ([wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)].
* `scale`: The scale parameter ([wiki](https://en.wikipedia.org/wiki/Cauchy_distribution)).

```javascript
const libR = require('lib-r-math.js');
const { Cauchy, rng: { MersenneTwister } } = libR;
// some usefull tools

//initialize Cauchy
const mt = new MersenneTwister(0);
const cauchy1 = Cauchy(mt);

const { dcauchy, pcauchy, qcauchy, rcauchy } = cauchy1;

//1.
rcauchy(5, 0, 0.5);
/*
[ -0.16821519851781444,
  0.5512599516629566,
  1.1769152991110212,
  -2.146313122236451,
  -0.14832127864320446 
*/

//2.
rcauchy(5, 2, 2);
/*[
  3.4692937226517686,
  1.3389560106559817,
  1.6488412505516226,
  -1.6164861613921215,
  -2.657248785268937
]*/

//3.
mt.init(0);
rcauchy(5, -2, 0.25);
/*
[ -2.0841075992589073,
  -1.7243700241685218,
  -1.4115423504444893,
  -3.0731565611182257,
  -2.0741606393216023 ]
*/
```

```R
>RNGkind("Mersenne-Twister", normal.kind="Inversion")
>set.seed(0)

> rcauchy(5, 0, 0.5);
[1] -0.1682152  0.5512600  1.1769153 -2.1463131 -0.1483213

> rcauchy(5, 2, 2);
[1]  3.469294  1.338956  1.648841 -1.616486 -2.657249

> set.seed(0)
> rcauchy(5, -2, 0.25);
[1] -2.084108 -1.724370 -1.411542 -3.073157 -2.074161
```

### Chi-Squared (non-central) Distribution

`dchisq, qchisq, pchisq, rchisq`

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html)

These functions are members of an object created by the `ChiSquared` factory method. The factory method needs as optional argument the result produced by the [_Normal_](#normal-distribution) factory method.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Normal,
  ChiSquared,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
} = libR;

//initialize ChiSquared
const defaultChiSquared = ChiSquared();
const mt = new MersenneTwister(0); //keep reference so we can do mt.init(123)
const inv = new Inversion(mt);
const normal = Normal(inv);

const customChi2 = ChiSquared(normal);

const { dchisq, pchisq, qchisq, rchisq } = customChi2;
```

#### `dchisq`

The X<sup>2</sup> density function, see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

$$ f\_{n}(x) = \frac{1}{2^{\frac{n}{2}} Γ(\frac{n}{2})} x^{\frac{n}{2}-1} e^{\frac{-x}{2}} $$

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

```javascript
const libR = require('lib-r-math.js');
const { ChiSquared } = libR;

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

// some usefull tools
const seq = libR.R.seq()();

//1. seq(0,10)=[0, 2, 4, 6, 8, 10], df=5
dchisq(seq(0, 10, 2), 5);
/*
[ 0,
  0.13836916580686492,
  0.1439759107018348,
  0.09730434665928292,
  0.05511196094424547,
  0.02833455534173448 ]
*/

//2. seq(0,10)=[0, 2, 4, 6, 8, 10], df=3, ncp=4
dchisq(seq(0, 10, 2), 3, 4);
/*
[ 0,
  0.08371765638067052,
  0.09970211254391682,
  0.090147417612482,
  0.07076499302415257,
  0.050758266663356165 ]
*/
//3. seq(0,10)=[0, 2, 4, 6, 8, 10], df=3, ncp=4, log=true
dchisq(seq(0, 10, 2), 3, 4, true);
/*
[ -Infinity,
  -2.4803053753380837,
  -2.3055684132326415,
  -2.4063089751953237,
  -2.6483908493739903,
  -2.9806807844070144 ]
*/
```

_in R Console_

```R
> dchisq(seq(0, 10, 2), 5);
[1] 0.00000000 0.13836917 0.14397591 0.09730435 0.05511196 0.02833456

> dchisq(seq(0, 10, 2), 3, 4);
[1] 0.00000000 0.08371766 0.09970211 0.09014742 0.07076499 0.05075827

> dchisq(seq(0, 10, 2), 3, 4, TRUE);
[1]      -Inf -2.480305 -2.305568 -2.406309 -2.648391 -2.980681
```

#### `pchisq`

The X<sup>2</sup> probability function, see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

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

```javascript
const libR = require('lib-r-math.js');
const { ChiSquared } = libR;

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

//1.
pchisq([0, 2, 4, 6, 10, Infinity], 3);
/*
[ 0,
  0.42759329552912073,
  0.7385358700508893,
  0.8883897749052875,
  0.9814338645369568,
  1 ]
*/

//2. df=8, ncp=4, lowerTail=false
pchisq([0, 2, 4, 6, 10, Infinity], 8, 4, false);
/*
[ 1,
  0.9962628039343348,
  0.961002639616864,
  0.8722689463714985,
  0.5873028585053277,
  0 ]
*/

//3. df=8, ncp=4, lowerTail=true, logP=true
pchisq([0, 2, 4, 6, 10, Infinity], 8, 4, true, true);
/*
[ -Infinity,
  -5.589419663795327,
  -3.244261317626745,
  -2.0578283690888397,
  -0.8850412685992426,
  -0 ]
*/
```

_in R Console_

```R
> pchisq(c(0, 2, 4, 6, 10, Inf), 3);
[1] 0.0000000 0.4275933 0.7385359 0.8883898 0.9814339 1.0000000

> pchisq(c(0, 2, 4, 6, 10, Inf), 8, 4, lower.tail=FALSE);
[1] 1.0000000 0.9962628 0.9610026 0.8722689 0.5873029 0.0000000

> pchisq(c(0, 2, 4, 6, 10, Inf), 8, 4, lower.tail=FALSE, log.p=TRUE);
[1]  0.000000000 -0.003744197 -0.039778123 -0.136657478 -0.532214649
[6]         -Inf
```

#### `qchisq`

The X<sup>2</sup> quantile function, see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

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

```javascript
const libR = require('lib-r-math.js');
const { ChiSquared } = libR;

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

// some usefull tools
const seq = libR.R.seq()();
const log = libR.R.arrayrify(Math.log);

//1. df=3,
qchisq(seq(0, 1, 0.2), 3);
/*
[ 0,
  1.0051740130523492,
  1.8691684033887155,
  2.9461660731019514,
  4.641627676087445,
  Infinity ]
*/

//2. df=3, ncp=undefined, lowerTail=false
qchisq(seq(0, 1, 0.2), 50, undefined, false);
/*
[ Infinity,
  58.16379657992839,
  51.89158387457867,
  46.86377615520892,
  41.44921067362021,
  0 ]
*/

//3. df=50, ncp=0, lowerTail=false, logP=true
qchisq(log(seq(0, 1, 0.2)), 50, 0, false, true);
/*
[ Infinity,
  58.16379657992839,
  51.89158387457867,
  46.86377615520892,
  41.44921067362021,
  0 ]
*/
```

_in R Console_

```R
> qchisq(seq(0, 1, 0.2), 3);
[1] 0.000000 1.005174 1.869168 2.946166 4.641628      Inf

> qchisq(seq(0, 1, 0.2), 50, lower.tail=FALSE);
[1]      Inf 58.16380 51.89158 46.86378 41.44921  0.00000

> qchisq(log(seq(0, 1, 0.2)), 50, 0, lower.tail=FALSE, log.p=TRUE);
[1]      Inf 58.16380 51.89158 46.86378 41.44921  0.00000
```

#### `rchisq`

Creates random deviates for the X<sup>2</sup> distribution, see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

```typescript
declare function rchisq(n: number, df: number, ncp?: number): number | number[];
```

* `p`: probabilities (array or scalar).
* `df`: degrees of freedom.
* `ncp`: non centrality parameter.

```javascript
const libR = require('lib-r-math.js');

const {
  Normal,
  ChiSquared,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
} = libR;

const mt = new MersenneTwister(0);
const inv = new Inversion(mt);
const normal = Normal(inv);

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared(normal);

mt.init(1234);
rchisq(5, 6);
/*
[ 1.9114268080337742,
  6.043534576038884,
  6.200716357774979,
  2.956836564898939,
  6.7283355255601744 ]
*/

//2. df=40, ncp=3
rchisq(5, 40, 3);
/**
 [ 52.209386584322935,
  34.70775047728965,
  47.16016110974318,
  46.5265673840001,
  33.621513245840234 ]
 */

//3. df=20
rchisq(5, 20);
/*
[ 19.835565127330135,
  16.09559531198466,
  19.030877450490838,
  18.7687394986203,
  11.121314102478944 ]
*/
```

_in R Console_

```R
> RNGkind("Mersenne-Twister", normal.kind ="Inversion")
> set.seed(1234)
> rchisq(5, 6);
[1] 1.911427 6.043535 6.200716 2.956837 6.728336

> rchisq(5, 40, 3);
[1] 52.20939 34.70775 47.16016 46.52657 33.62151

> rchisq(5, 20);
[1] 19.83557 16.09560 19.03088 18.76874 11.12131
```

### Exponential Distribution

`dexp, qexp, pexp, rexp`

See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html)

These functions are members of an object created by the `Exponential` factory method. The factory method needs as optional argument an instance of an [uniform PRNG](#uniform-pseudo-random-number-generators) class.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Exponential, rng: { MersenneTwister } } = libR;

//1. initialize default
const defaultExponential = Exponential();

//2. alternative: initialize with explicit uniform PRNG
const mt = new MersenneTwister(123456); //keep reference so we can do mt.init(...)
const customExponential = Exponential(mt);

//get functions
const { dexp, pexp, qexp, rexp } = defaultExponential;
```

#### `dexp`

The exponential density function, see [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html).

$$ f(x) = λ {e}^{- λ x} $$

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

```javascript
const libR = require('lib-r-math.js');
const { Exponential } = libR;

const { dexp, pexp, qexp, rexp } = Exponential();

// some usefull tools
const seq = libR.R.seq()();

//1
dexp(seq(0, 0.3, 0.05), 3);
/*
    [ 3,
      2.5821239292751734,
      2.2224546620451533,
      1.9128844548653197,
      1.6464349082820793,
      1.4170996582230442,
      1.2197089792217974 
    ]
    */

//2.
dexp(seq(0, 0.3, 0.05), 3, true);
/*
        [ 1.0986122886681098,
            0.9486122886681098,
            0.7986122886681097,
            0.6486122886681097,
            0.4986122886681097,
            0.3486122886681098,
            0.19861228866810976 ]
    */

//3
dexp(seq(0, 10, 2), 0.2);
/*
    [ 0.2,
        0.13406400920712785,
        0.08986579282344431,
        0.06023884238244041,
        0.04037930359893108,
        0.027067056647322542 ]
    */
```

_in R Console_

```R
#1
>  dexp(seq(0,0.3,0.05),3)
[1] 3.000000 2.582124 2.222455 1.912884
[5] 1.646435 1.417100 1.219709

#2
>  dexp(seq(0,0.3,0.05),3, TRUE)
[1] 1.0986123 0.9486123 0.7986123
[4] 0.6486123 0.4986123 0.3486123
[7] 0.1986123

#3
> dexp(seq(0,10,2),0.2)
[1] 0.20000000 0.13406401 0.08986579
[4] 0.06023884 0.04037930 0.02706706
```

#### `pexp`

The Exponential probability function, see [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html).

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

```javascript
const libR = require('lib-r-math.js');
const { Exponential } = libR;

const seq = libR.R.seq()();

const { dexp, pexp, qexp, rexp } = ChiSquared();

///1
pexp(seq(0, 0.3, 0.05), 3);
/*[ 0,
      0.13929202357494222,
      0.2591817793182822,
      0.3623718483782268,
      0.4511883639059736,
      0.5276334472589853,
      0.5934303402594009 ]
    */

//2
pexp(seq(0, 0.3, 0.05), 3, true);
/*[ 0,
      0.13929202357494222,
      0.2591817793182822,
      0.3623718483782268,
      0.4511883639059736,
      0.5276334472589853,
      0.5934303402594009 ]
    */

//3
pexp(seq(0, 10, 2), 0.2);
/*[ 0,
      0.32967995396436073,
      0.5506710358827784,
      0.6988057880877979,
      0.7981034820053446,
      0.8646647167633873 ]
*/
```

_in R Console_

```R
#1
> pexp(seq(0,0.3,0.05),3)
[1] 0.0000000 0.1392920 0.2591818
[4] 0.3623718 0.4511884 0.5276334
[7] 0.5934303

#2
> pexp(seq(0,0.3,0.05),3, TRUE)
[1] 0.0000000 0.1392920 0.2591818
[4] 0.3623718 0.4511884 0.5276334
[7] 0.5934303

#3
> pexp(seq(0,10,2),0.2)
[1] 0.0000000 0.3296800 0.5506710
[4] 0.6988058 0.7981035 0.8646647
```

#### `qexp`

The Exponential quantile function, see [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html).

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

```javascript
const libR = require('lib-r-math.js');
const { Exponential } = libR;

const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();

const { dexp, pexp, qexp, rexp } = ChiSquared();

//1
qexp(log(pexp(seq(0, 10, 2), 0.2)), 0.2, true, true);
//[ 0, 2, 4, 6.000000000000001, 8.000000000000002, 10 ]

//2
qexp(pexp(seq(0, 10, 2), 0.2), 0.2);
//[ 0, 2, 4, 6.000000000000001, 8.000000000000002, 10 ]

//3
qexp(pexp(seq(0, 0.3, 0.05), 3, true), 3, true);
// [1] 0.00 0.05 0.10 0.15 0.20 0.25 0.30
```

_in R Console_

```R
#1
> qexp(log(pexp(seq(0,10,2),0.2)),0.2, TRUE, TRUE)
[1]  0  2  4  6  8 10

#2
> qexp(pexp(seq(0,10,2),0.2),0.2)
[1]  0  2  4  6  8 10

#3
> qexp(pexp(seq(0,0.3,0.05),3, TRUE),3, TRUE)
[1] 0.00 0.05 0.10 0.15 0.20 0.25 0.30
```

#### `rexp`

Creates random deviates for the Exponential distribution, see [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Exponential.html).

```typescript
declare function rexp(n: number, rate: number = 1): number | number[];
```

* `n`: number of deviates to generate (array or scalar).
* `rate`: the λ parameter.

```javascript
const libR = require('lib-r-math.js');
const { Exponential, rng: { MersenneTwister } } = libR;

const mt = new MersenneTwister(1234); //seed 1234
const { dexp, pexp, qexp, rexp } = Exponential(mt);

//1
rexp(5);
/*[ 2.501758604962226,
  0.24675888335332274,
  0.00658195674547719,
  1.742746089841709,
  0.38718258356675506 ]
*/

//2
rexp(5, 0.1);
/*[ 0.8994967117905617,
  8.240815149200083,
  2.0261790050608974,
  8.380403192293764,
  7.604303005662682 ]
*/

//3
rexp(5, 3);
/*[ 0.6266922261285862,
  0.5320351392051192,
  0.5528874614306372,
  1.0174860332842828,
  0.5835600444988374 ]
*/
```

_in R Console_

```R
> RNGkind("Mersenne-Twister")
> set.seed(1234)
#1.
> rexp(5)
[1] 2.501758605 0.246758883 0.006581957
[4] 1.742746090 0.387182584

#2.
> rexp(5,0.1)
[1] 0.8994967 8.2408151 2.0261790 8.3804032
[5] 7.6043030

#3.
> rexp(5,3)
[1] 0.6266922 0.5320351 0.5528875 1.0174860
[5] 0.5835600
```

### F (non-central) Distribution

`df, qf, pf, rf`

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html)

These functions are members of an object created by the `FDist` factory method. The factory method needs as optional argument the result of the factory function [Normal](#normal-distribution).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Normal,
  FDist,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
} = libR;

//1. initialize default
const defaultF = FDist();

//2. alternative: initialize with explicit uniform PRNG
const mt = new MersenneTwister(1234); //keep reference so we can do mt.init(...)
const customF = FGDist(Normal(new Inversion(mt)));

//get functions
const { df, pf, qf, rf } = customF; // or use "defaultF"
```

#### `df`

The density function of the F distribution. See [R doc]((https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html)

With `df1` and `df2` degrees of freedom:

$$ \large f(x) = \frac{ Γ(\frac{df1 + df2}{2}) } { Γ(\frac{df1}{2}) Γ(\frac{df2}{2}) } {(\frac{n1}{n2})}^{(\frac{df1}{2})} x^{(\frac{df1}{2} - 1)} (1 + \frac{df1}{df2} x)^{-(n1 + n2)/2} $$

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

```javascript
const libR = require('lib-r-math.js');
const { FDist } = libR;

//some usefull tools
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9);

//get functions
const { df, pf, qf, rf } = FDist();

//1.
precision(df(seq(0, 4, 0.5), 5, 10, 8));
/*
[ 0,
  0.0972906993,
  0.219523567,
  0.270256085,
  0.262998414,
  0.229004229,
  0.188412981,
  0.150538493,
  0.118556123 ]
*/

//2.
precision(df(seq(0, 4, 0.5), 50, 10, undefined, true));
/*[ -Infinity,
  -0.688217839,
  -0.222580527,
  -0.940618761,
  -1.7711223,
  -2.55950945,
  -3.28076319,
  -3.93660717,
  -4.53440492 ]*/

//3.
precision(df(seq(0, 4, 0.5), 6, 25));
/*[ 0,
  0.729921524,
  0.602808536,
  0.323999956,
  0.155316972,
  0.0724829398,
  0.0340225684,
  0.0162807852,
  0.00798668195 ]*/

//4.
precision(df(seq(0, 4), 6, 25, 8, true));
//[ -Infinity, -1.38207439, -1.09408866, -1.54026185, -2.22490033 ]
```

_in R Console:_

```R
#1.
>df(seq(0,4,0.5), df1=5,df2=10, ncp=8)
[1] 0.0000000 0.0972907 0.2195236 0.2702561
[5] 0.2629984 0.2290042 0.1884130 0.1505385
[9] 0.1185561

#2.
>df(seq(0,4,0.5), df1=50,df2=10, log = TRUE)
[1]       -Inf -0.6882178 -0.2225805 -0.9406188
[5] -1.7711223 -2.5595094 -3.2807632 -3.9366072
[9] -4.5344049

#3
> df(seq(0, 4, 0.5), 6, 25)
[1] 0.000000000 0.729921524 0.602808536
[4] 0.323999956 0.155316972 0.072482940
[7] 0.034022568 0.016280785 0.007986682

#4
> df(seq(0, 4), 6, 25, 8,log=TRUE)
[1]      -Inf -1.382074 -1.094089 -1.540262 -2.22490
```

#### `pf`

The probability function of the F distribution. See [R doc]((https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html).

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

```javascript
const libR = require('lib-r-math.js');
const { FDist } = libR;

//some usefull tools
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9);

//strip functions
const { df, pf, qf, rf } = FDist();

//1. df1 = 5, df2=10, ncp=8
precision(pf(seq(0, 4, 0.5), 5, 10, 8));
/*[
  0,
  0.0189961379,
  0.100468407,
  0.225990517,
  0.361015189,
  0.484609879,
  0.588981209,
  0.673508458,
  0.740516322 ]
*/

//2. df1=50, df2=10, lowerTail=false
precision(pf(seq(0, 4, 0.5), 50, 10, undefined, false));
/*[
  1,
  0.946812312,
  0.543643095,
  0.25065625,
  0.118135409,
  0.0595867293,
  0.0321901407,
  0.0184730352,
  0.0111614023 ]
*/

//3.
precision(pf(seq(0, 4, 0.5), 50, 10, undefined, false, true));
/*[
  0,
  -0.0546543979,
  -0.609462324,
  -1.3836728,
  -2.13592378,
  -2.82032239,
  -3.43609506,
  -3.99144317,
  -4.49529367 
]*/

//4.
precision(pf(seq(0, 4, 0.5), 6, 25, 8, true, true));
/*[ -Infinity,
  -4.20235111,
  -2.29618223,
  -1.376145,
  -0.85773694,
  -0.546177623,
  -0.35253857,
  -0.229797274,
  -0.15099957 ]
*/
```

_in R Console_

```R
#1
> pf(seq(0, 4, 0.5), 5, 10, 8)
[1] 0.00000000 0.01899614 0.10046841 0.22599052 0.36101519 0.48460988 0.58898121
[8] 0.67350846 0.74051632

#2
> pf(seq(0, 4, 0.5), 50, 10, lower.tail=FALSE)
[1] 1.00000000 0.94681231 0.54364309 0.25065625 0.11813541 0.05958673 0.03219014
[8] 0.01847304 0.01116140

#3
> pf(seq(0, 4, 0.5), 50, 10, lower.tail=FALSE, log.p=TRUE)
[1]  0.0000000 -0.0546544 -0.6094623 -1.3836728 -2.1359238 -2.8203224 -3.4360951
[8] -3.9914432 -4.4952937

#4
pf(seq(0, 4, 0.5), 6, 25, 8, TRUE, TRUE);
[1] -Inf -4.2023511 -2.2961822 -1.3761450 -0.8577369 -0.5461776 -0.3525386
[8] -0.2297973 -0.1509996
```

#### `qf`

The probability function of the F distribution. See [R doc]((https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html).

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

```javascript
const libR = require('lib-r-math.js');
const { FDist } = libR;

// some  usefull tools
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9);

//strip functions
const { df, pf, qf, rf } = FDist();

//1
let q1 = qf(
  [
    0,
    0.0189961379,
    0.100468407,
    0.225990517,
    0.361015189,
    0.484609879,
    0.588981209,
    0.673508458,
    0.740516322,
    1
  ],
  5,
  10,
  8
);
precision(q1); //returns limited precsions numbers
//[ 0, 0.5, 0.999999998, 1.5, 2, 2.5, 3, 3.5, 4, Infinity ]

//2
let q2 = qf(
  [
    1,
    0.946812312,
    0.543643095,
    0.25065625,
    0.118135409,
    0.0595867293,
    0.0321901407,
    0.0184730352,
    0.0111614023,
    0
  ],
  50,
  10,
  undefined,
  false
);
precision(q2);
//[ 0, 0.5, 0.999999998, 1.5, 2, 2.5, 3, 3.5, 4, Infinity ]

//3.
let q3 = qf(
  [
    0,
    -0.0546543979,
    -0.609462324,
    -1.3836728,
    -2.13592378,
    -2.82032239,
    -3.43609506,
    -3.99144317,
    -4.49529367
  ],
  50,
  10,
  undefined,
  false,
  true
);
precision(q3);
//[ 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4 ]

//4
let q4 = qf(
  [
    -Infinity,
    -4.20235111,
    -2.29618223,
    -1.376145,
    -0.85773694,
    -0.546177623,
    -0.35253857,
    -0.229797274,
    -0.15099957
  ],
  6,
  25,
  8,
  true,
  true
);
precision(q4);
//[ 0, 0.500000001, 1, 1.5, 2, 2.5, 3, 3.5, 4 ]
```

_in R Console:_

```R
#1.
>qf(c(0, 0.0189961379, 0.100468407,
     0.225990517, 0.361015189, 0.484609879,
     0.588981209, 0.673508458, 0.740516322,
     1
    ),
    5,
    10,
    8
)
#[1] 0.0 0.5 1.0 1.5 2.0 2.5 3.0 3.5 4.0 Inf

#2.
>qf( c(1, 0.946812312, 0.543643095, 0.25065625,
    0.118135409, 0.0595867293, 0.0321901407, 0.0184730352,
    0.0111614023, 0),
    50,
    10,
    lower.tail = FALSE
);
# [1] 0.0 0.5 1.0 1.5 2.0 2.5 3.0 3.5 4.0 Inf

#3.
> qf(c( 0, -0.0546543979, -0.609462324,
        -1.3836728, -2.13592378, -2.82032239,
        -3.43609506, -3.99144317, -4.49529367
),
    50,
    10,
    lower.tail = FALSE,
    log.p = TRUE
);
#[1] 0.0 0.5 1.0 1.5 2.0 2.5 3.0 3.5 4.0

#4.
qf(c(-Inf, -4.20235111, -2.29618223,
    -1.376145, -0.85773694, -0.546177623,
    -0.35253857, -0.229797274, -0.15099957),
    df1 = 6,
    df2 = 25,
    ncp= 8,
    lower.tail = TRUE,
    log.p = TRUE
);
#[1] 0.0 0.5 1.0 1.5 2.0 2.5 3.0 3.5 4.0
```

#### `rf`

Generates deviates for the F distribution. See [R doc]((https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Fdist.html).

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

```javascript
const libR = require('lib-r-math.js');
const {
  FDist,
  Normal,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
} = libR;

//some tools
const precision = libR.R.numberPrecision(9);

//init
const mt = new MersenneTwister(1234);
const { df, pf, qf, rf } = FDist(Normal(new Inversion(mt)));

//1.
precision(rf(5, 8, 6));
//[0.3986174, 2.13290818, 2.02114876, 2.5957924, 4.01140249]

//2.
precision(rf(5, Infinity, Infinity));
//[ 1, 1, 1, 1, 1 ]

//3. produces NaNs because df1 or/and df2 is Infinity and ncp !== undefined (yes, ncp=0 produces NaNs!)
precision(rf(5, 40, Infinity, 0));
//[ NaN, NaN, NaN, NaN, NaN ]

//4.
precision(rf(5, 400, Infinity));
//[ 0.952329364, 1.00699208, 0.963147631, 0.997853633, 0.994844237 ]
```

_in R Console:_

```R
RNGkind("Mersenne-Twister", normal.kind="Inversion");
set.seed(1234);

#1.
> rf(5,8,6)
[1] 0.3986174 2.1329082 2.0211488 2.5957924 4.0114025

#2.
> rf(5, Inf, Inf)
[1] 1 1 1 1 1

#3.
> rf(5, 40, Inf, 0)
[1] NaN NaN NaN NaN NaN

#4.
> rf(5, 400, Inf)
[1] 0.9523294 1.0069921 0.9631476 0.9978536 0.9948442
```

### Gamma distribution

`dgamma, qgamma, pgamma, rgamma`

See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html).

These functions are members of an object created by the `Gamma` factory method. The factory method needs as optional argument the result of the factory function [Normal](#normal-distribution).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Normal,
  Gamma,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
} = libR;

//1. initialize default
const defaultGamma = Gamma();

//2. alternative: initialize with explicit uniform PRNG
const mt = new MersenneTwister(123456); //keep reference so we can do mt.init(...)
const customG = Gamma(Normal(new Inversion(mt)));

//get functions
const { dgamma, pgamma, qgamma, rgamma } = customG; // or use "defaultGamma"
```

#### `dgamma`

The density function of the Gamma distribution with _shape_ parameter `a` and _scale_ parameter `s` and `x` >= 0. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html)

$$ f(x)= \frac{1}{s^{a} \Gamma(a)} x^{a-1} e^{-x/s} $$

Alternative represention using _shape_ parameter `a` and _rate_ parameter `β`:

$$ f(x)= \frac{β^{a}}{\Gamma(a)} x^{a-1} e^{-xβ} $$

You must either specify `scale` or `rate` parameters _but not both_ (unless rate = 1/scale).

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
const { Gamma } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dgamma, pgamma, qgamma, rgamma } = Gamma();

//1.
const d1 =  dgamma( seq(0, 10, 2), 1, 0.5);
const d1Alt = dgamma( seq(0, 10, 2), 1, undefined, 2); //gives same as d1
precision(d1);
/*[ 0.5,
  0.183939721,
  0.0676676416,
  0.0248935342,
  0.00915781944,
  0.0033689735 ]*/

//2.
const d2 =  dgamma( seq(0, 10, 2), 2, 1/2);
const d2Alt = dgamma( seq(0, 10, 2), 2, undefined, 2); //gives same as d2
precision(d2);
/*[ 0,
  0.183939721,
  0.135335283,
  0.0746806026,
  0.0366312778,
  0.0168448675 ]*/

//3.
const d3 = dgamma( seq(0, 10, 2), 5, 1) );
const d3Alt = dgamma( seq(0, 10, 2), 5, undefined, 1); //gives same as d3
precision(d3);
/*[ 0,
  0.0902235222,
  0.195366815,
  0.133852618,
  0.0572522885,
  0.0189166374 ]
*/

//4.
const d4 = dgamma( seq(0, 10, 2), 7.5, 1, undefined true);
const d4Alt = dgamma( seq(0, 10, 2), 7.5, undefined, 1, true);
precision(d4);
/*[
  -Infinity,
  -5.02890756,
  -2.52345089,
  -1.88792769,
  -2.01799422,
  -2.56756113 ]
*/
```

_in R Console_

```R
#1. these 2 give the same output
> dgamma( seq(0, 10, 2), 1, scale = 2);
> dgamma( seq(0, 10, 2), 1, rate = 1/2);
[1] 0.500000000 0.183939721 0.067667642 0.024893534 0.009157819 0.003368973

#2.
> dgamma( seq(0, 10, 2), 2, scale = 2);
> dgamma( seq(0, 10, 2), 2, rate = 1/2);
[1] 0.00000000 0.18393972 0.13533528 0.07468060 0.03663128 0.01684487

#3.
> dgamma( seq(0, 10, 2), 5, scale = 1);
> dgamma( seq(0, 10, 2), 5, rate = 1);
[1] 0.00000000 0.09022352 0.19536681 0.13385262 0.05725229 0.01891664

#4.
> dgamma( seq(0, 10, 2), 7.5, scale = 1, log = TRUE)
> dgamma( seq(0, 10, 2), 7.5, rate = 1, log = TRUE)
[1]      -Inf -5.028908 -2.523451 -1.887928 -2.017994 -2.567561
```

#### `pgamma`

The probability function of the Gamma distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html).

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
const { Gamma } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dgamma, pgamma, qgamma, rgamma } = Gamma();

//1.
const p1 = pgamma(seq(0, 10, 2), 1, 0.5);
const p1Alt = pgamma(seq(0, 10, 2), 1, undefined, 2);
precision(p1);
/*
[ 0,
  0.632120559,
  0.864664717,
  0.950212932,
  0.981684361,
  0.993262053 ]
*/

//2.
const p2 = pgamma(seq(0, 10, 2), 2, 0.5);
const p2Alt = pgamma(seq(0, 10, 2), 2, undefined, 2);
precision(p2);
/*
[ 0,
  0.264241118,
  0.59399415,
  0.800851727,
  0.908421806,
  0.959572318 ]
*/

//3.
const p3 = pgamma(seq(0, 10, 2), 5, 1, undefined, false, true);
const p3Alt = pgamma(seq(0, 10, 2), 5, undefined, 1, false, true);
precision(p3);
/*[ 
  0,
  -0.0540898509,
  -0.4638833,
  -1.25506787,
  -2.30626786,
  -3.53178381 ]
*/

//4.
const p4 = pgamma(seq(0, 10, 2), 7.5, 1, undefined, false, true);
const p4Alt = pgamma(seq(0, 10, 2), 7.5, undefined, 1, false, true);
precision(p4);
/*
[ 0,
  -0.00226521952,
  -0.0792784046,
  -0.387091358,
  -0.96219944,
  -1.76065222 ]
*/
```

_in R Console_

```R
#1
> pgamma(seq(0,10,2), 1, rate = 0.5);
[1] 0.0000000 0.6321206 0.8646647 0.9502129 0.9816844 0.9932621

#2
> pgamma(seq(0, 10, 2), 2, rate = 0.5);
[1] 0.0000000 0.2642411 0.5939942 0.8008517 0.9084218 0.9595723

#3
> pgamma(seq(0, 10, 2), 5, rate=1, lower.tail = FALSE, log.p = TRUE);
[1]  0.00000000 -0.05408985 -0.46388330 -1.25506787 -2.30626786 -3.53178381

#4
pgamma(seq(0, 10, 2), 7.5, rate = 7.5, lower.tail = FALSE , log.p = TRUE );
[1]  0.00000000 -0.00226522 -0.07927840 -0.38709136 -0.96219944 -1.76065222
```

#### `qgamma`

The quantile function of the Gamma distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html).

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
const { Gamma } = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dgamma, pgamma, qgamma, rgamma } = Gamma();

//1.
const pp1 = pgamma(seq(0, 10, 2), 1, 0.5);
const q1 = qgamma(pp1, 1, 0.5);
const q1Alt = qgamma(pp1, 1, undefined, 2); //alternative using 'scale'
precision(q1);
//[ 0, 2, 4, 6, 8, 10 ]

//2.
const pp2 = pgamma(seq(0, 10, 2), 2, 0.5);
const q2 = qgamma(pp2, 2, 0.5);
const q2Alt = qgamma(pp2, 2, undefined, 2); //alternative using 'scale'
precision(q2);
//[ 0, 2, 4, 6, 8, 10 ]

//3.
const pp3 = pgamma(seq(0, 10, 2), 5, 1, undefined, false, true);
const q3 = qgamma(pp3, 5, undefined, 1, false, true);
const q3Alt = qgamma(pp3, 5, undefined, 1, false, true); //alternative using 'scale'
precision(q3);
//[ 0, 2, 4, 6, 8, 10 ]

//4.
const pp4 = pgamma(seq(0, 10, 2), 7.5, 1, undefined, false);
const q4 = qgamma(log(pp4), 7.5, 1, undefined, false, true);
const q4Alt = qgamma(log(pp4), 7.5, undefined, 1, false, true); //alternative using 'scale'
precision(q4);
//[ 0, 2, 4, 6, 8, 10 ]
```

_Equivalent in R_

```R
#1.
> pp1 = pgamma(seq(0, 10, 2), 1, 0.5)
> qgamma(pp1, 1, 0.5)
[1]  0  2  4  6  8 10

#2.
> pp2 = pgamma(seq(0, 10, 2), 2, 0.5);
> qgamma(pp2, 2, 0.5);
[1]  0  2  4  6  8 10

#3.
> pp3 = pgamma(seq(0, 10, 2), 5, 1, lower.tail= FALSE, log.p=TRUE);
>  qgamma(pp3, 5, scale= 1, lower.tail=FALSE, log.p=TRUE);
[1]  0  2  4  6  8 10

#4
>  pp4 = pgamma(seq(0, 10, 2), 7.5, 1, lower.tail=FALSE);
>  qgamma(log(pp4), 7.5, 1, lower.tail=FALSE , log.p=TRUE);
[1]  0  2  4  6  8 10
```

#### `rgamma`

Generates random deviates for the Gamma distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/GammaDist.html).

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
  Normal,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const mt = new MersenneTwister(1234);
const { dgamma, pgamma, qgamma, rgamma } = Gamma(Normal(new Inversion(mt)));

//1.
mt.init(1234); // optionally re-init PRNG
const r1 = rgamma(5, 1, 0.5);
mt.init(1234);
const r1Alt = rgamma(5, 1, undefined, 2); //alternative using 'scale'
precision(r1);
//[ 0.0214551082, 1.49399813, 1.57265591, 0.233750469, 1.84371739 ]

//2.
mt.init(0);
const r2 = rgamma(5, 2, 0.5);
mt.init(0);
const r2Alt = rgamma(5, 2, undefined, 2); // alternative using 'scale'
precision(r2);
//[ 6.89112033, 2.25410883, 1.30227387, 4.1016237, 7.77081806 ]

//3.
mt.init(9856);
const r3 = rgamma(5, 7.5, 1);
mt.init(9856);
const r3Alt = rgamma(5, 7.5, undefined, 1);
precision(r3);
//[ 7.13748561, 6.64198712, 13.9948926, 6.36703157, 6.7039321 ]
```

_in R Console_

```R
#1
> RNGkind("Mersenne-Twister", normal.kind = "Inversion");
> set.seed(1234);
> rgamma(5, 1, 0.5);
[1] 0.02145511 1.49399813 1.57265591 0.23375047 1.84371739

#2
> set.seed(0)
> rgamma(5, 2, 0.5);
[1] 6.891120 2.254109 1.302274 4.101624 7.770818

#3
> set.seed(9856);
> rgamma(5, 7.5, 1);
[1]  7.137486  6.641987 13.994893  6.367032  6.703932
```

### Geometric distribution.

`dgeom, qgeom, pgeom, rgeom`

See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html) and [wiki](https://en.wikipedia.org/wiki/Geometric_distribution).

These functions are properties of an object created by the `Geometric` factory method. The factory method needs as optional argument the result of the factory function [Normal](#normal-distribution).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Normal,
  Geometric,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
} = libR;

//1. initialize default
const defaultGeometric = Geometric();

//2. alternative: initialize with explicit uniform PRNG
const mt = new MersenneTwister(3456); //keep reference so we can do mt.init(...)
const customGeometric = Geometric(Normal(new Inversion(mt)));

//get functions
const { dgeom, pgeom, qgeom, rgeom } = customGeometric; // or use "defaultGamma"
```

#### `dgeom`

The density function of the [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html).

$$ \large p(x) = p (1-p)^{x} $$

_decl:_

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
const { Geometric } = libR;

//some tools
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

const { dgeom, pgeom, qgeom, rgeom } = Geometric();

//1
const d1 = dgeom(seq(0, 4), 0.5);
precision(d1);
//[ 0.5, 0.25, 0.125, 0.0625, 0.03125 ]

//2
const d2 = dgeom(seq(0, 4), 0.2, true);
precision(d2);
//[ -1.60943791, -1.83258146, -2.05572502, -2.27886857, -2.50201212 ]
```

_in R Console_

```R
#1
> dgeom(seq(0, 4), 0.5)
[1] 0.50000 0.25000 0.12500 0.06250 0.03125

#2
> dgeom(seq(0, 4), 0.2, TRUE)
[1] -1.609438 -1.832581 -2.055725 -2.278869 -2.502012
```

#### `pgeom`

The distribution function of the [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html).

_decl:_

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
const { Geometric } = libR;

//some tools
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits
const { dgeom, pgeom, qgeom, rgeom } = Geometric();

//1.
const p1 = pgeom(seq(5, 9), 0.1);
precision(p1);
//[ 0.468559, 0.5217031, 0.56953279, 0.612579511, 0.65132156 ]

//2.
const p2 = pgeom(seq(5, 9), 0.1, false);
precision(p2);
//[ 0.531441, 0.4782969, 0.43046721, 0.387420489, 0.34867844 ]

//3.
const p3 = pgeom(seq(5, 9), 0.2, false, true);
precision(p3);
//[ -1.33886131, -1.56200486, -1.78514841, -2.00829196, -2.23143551 ]
```

_in R Console_

```R
#1
> pgeom(seq(5, 9), 0.1);
[1] 0.4685590 0.5217031 0.5695328 0.6125795 0.6513216

#2
>  pgeom(seq(5, 9), 0.1, FALSE)
[1] 0.5314410 0.4782969 0.4304672 0.3874205 0.3486784

#3
> pgeom(seq(5, 9), 0.2, FALSE, TRUE)
[1] -1.338861 -1.562005 -1.785148 -2.008292 -2.231436
```

#### `qgeom`

The quantile function of the [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html).

_decl:_

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
const { Geometric } = libR;

//some tools
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits
const { dgeom, pgeom, qgeom, rgeom } = Geometric();

//1
const pp1 = pgeom(seq(5, 9), 0.2, false, true);
const q1 = qgeom(pp1, 0.2, false, true);
precision(q1);
//[ 5, 6, 7, 8, 9 ] returns seq(5,9)

//2
const pp2 = pgeom(seq(4, 8), 0.9, true, true);
const q2 = qgeom(pp2, 0.9, true, true);
precision(q2);
//[ 4, 5, 6, 7, 8 ] returns seq(4,9)

//3
const pp3 = pgeom([...seq(0, 6), Infinity], 0.5);
const q3 = qgeom(pp3, 0.5);
precision(q3);
//[ 0, 1, 2, 3, 4, 5, 6, Infinity ]
```

_in R Console_

```R
#1
> pp1 = pgeom(seq(5, 9), 0.2, FALSE, TRUE)
> qgeom(pp1, 0.2, FALSE, TRUE)
[1] 5 6 7 8 9

#2
> pp2 = pgeom(seq(4, 8), 0.9, TRUE, TRUE);
> qgeom(pp2, 0.9, TRUE, TRUE);
[1] 4 5 6 7 8

#3
> pp3 = pgeom(c(seq(0, 6), Inf), 0.5);
> qgeom(pp3, 0.5);
[1]   0   1   2   3   4   5   6 Inf
```

#### `rgeom`

Generates random deviates for the [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution). See [R doc](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/Geometric.html).

_decl_

```typescript
declare function rgeom(n: number, prob: number): number | number[];
```

* `n`: number of deviates to generate.
* `prob`: probability of success.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Geometric,
  Normal,
  rng: { MersenneTwister },
  rng: { normal: { Inversion } }
} = libR;

//some tools
const log = libR.R.arrayrify(Math.log);
const seq = libR.R.seq()();
const precision = libR.R.numberPrecision(9); //restrict to 9 significant digits

//init PRNG
const mt = new MersenneTwister(1234);
const { dgeom, pgeom, qgeom, rgeom } = Geometric(Normal(new Inversion(mt)));

//1
mt.init(3456);
rgeom(5, 0.001);
//[ 573, 1153, 75, 82, 392 ]

//2
mt.init(9876);
rgeom(5, 0.999);
//[ 0, 0, 0, 0, 0 ]  low failure rate!!

//3
mt.init(934);
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

_decl:_

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

The probablity function of the Hypergeometric distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html) and [wiki](https://en.wikipedia.org/wiki/Hypergeometric_distribution).

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

The probablity function of the Hypergeometric distribution. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Hypergeometric.html) and [wiki](https://en.wikipedia.org/wiki/Hypergeometric_distribution).

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
declare  function rlogis(
  N: number,
  location: number = 0,
  scale: number = 1
): number | number[]
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
