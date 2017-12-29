# libRmath.js

Javascript ( TypeScript ) Pure Implementation of Statistical R "core" numerical
`libRmath.so` library found here https://svn.r-project.org/R/trunk/src/nmath/

### Summary

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
* [Probability distributions](#probability-distributions)
  * [Uniform distribution](#uniform-distributions)
  * [Normal distribution](#normal-distribution)
  * [Other Probability Distributions](#probability-distributions)
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

mt.init( timeseed() ); // Use seed derived from system clock

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

new Array(5).fill('').map( () => mt.unif_rand() );
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

mmc.init( timeseed() )

mmc.init( 0 ); // also, defaults to '0' if seed is not specified

mmc.seed;
//[ -835792825, 1280795612 ]
new Array(5).fill('').map( () => mm.unif_rand() )
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
sd.init( timeseed() ) // re-initialize with random seed based on timestamp
sd.init(0); // re-initialize with any seed = 0.
//
sd.seed;
//[ -835792825, 1280795613 ]
new Array(5).fill('').map( () => sd.unif_rand() )
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
const kn97 = new KnuthTAOCP(1234);  // use seed = 1234 on creation
kn97.init( timeseed() ) // re-initialize with random seed based on timestamp
kn97.init(0); // re-initialize with any seed = 0.

kn97.seed;
// 101 unsigned integer array, only shown the first few values
/*[ 673666444,
  380305043,
  1062889978,
  926003693,
 .
 .]*/
new Array(5).fill('').map( () => kn97.unif_rand() );
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
2^129.

usage example:

```javascript
const libR = require('lib-r-math.js');
const { KnuthTAOCP2002, timeseed } = libR.rng;

// Seeding possibilities shown below
const kt2002 = new KnuthTAOCP2002( 1234 ); // use seed = 1234 on creation

kt2002.init( timeseed() ); //re-initialize with random seed based on timestamp

kt2002.init( 0 ); //re-initialize with seed = 0
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
new Array(5).fill('').map(() => kt2002.unif_rand())
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
const lc = new LecuyerCMRG( 1234 );

lc.init( timeseed() ); //re-initialize with random seed based on timestamp

lc.init( 0 ); //re-initialize with seed = 0
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

Inverse transform sampling
https://en.wikipedia.org/wiki/Inverse_transform_sampling

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

## Probability distributions

#### Summary

In the Section [1](#uniform-pseudo-random-number-generators)
and [2](#normal-distributed-random-number-generators)
we discussed uniform and normal PRNG classes. These classes can be used by themselves but mostly intended to be consumed to generate
random numbers with a particular distribution (like `Uniform`, `Normal`, `Gamma`,
`Weibull`, `Chi-square` etc).

_It is also possible to provide your own uniform random source (example: real
random numbers fetched from services over the net). It is straightforward to create new PNRG (either uniform or normal). Review existing PRNG codes for examples.

### Uniform distribution

`dunif, qunif, punif, runif`

[_Naming follows exactly their R counter part_](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Uniform.html)

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

_decl:_

```typescript
function dunif(
  x: number | number[],
  a: number = 0,
  b: number = 1,
  giveLog: boolean = false
): number|number[]
```

Example:

```javascript
const libR = require('lib-r-math.js');

const uni = libR.Uniform();// use default Mersenne-Twister PRNG

runif(5, 4, 9);

// get the envelope of the uniform distributions
// dunif(x, min = 0, max = 1, log = FALSE)
// x could be an Array of numbers of a scalar
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
// cummumative distribution R
// punif(q, min = 0, max = 1, lower.tail = TRUE, log.p = FALSE)
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

// inverse of the cummumative propbabilty
// qunif(p, min = 0, max = 1, lower.tail = TRUE, log.p = FALSE)
qunif([0, 0.25, 0.75, 0.9, 1], 0, 4, true);
//qunif( [  0, 0.25, 0.75, 0.9 , 1 ], 0, 4, true)
```

#### Normal distribution

`dnorm, qnorm, pnorm, rnorm`
[_Naming follows exactly their R counter part_](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html)

Usage:

`dnorm ( x: number|number[], mean: number = 0, sigma: number = 1, logP: boolean=false )`
_gives values of the value of the probability density function at position(s) x_

```javascript
const libR = require('lib-r-math.js');

// create generator with normal distribution
const marsM = new libR.rng.MarsagliaMultiCarry(0);
const bm = new libR.rng.normal.BoxMuller(marsM);

// create an instance of normal functions using selected PRNG.
const n = libR.normal(bm);
//
//  dnorm ( x= x values, mean, sigma, log )
//
// dnorm(0) == 1/sqrt(2*pi)
// dnorm(1) == exp(-1/2)/sqrt(2*pi)

n.dnorm(0); // probability distribution, peek value at null
//0.3989422804014327
n.dnorm(3, 4, 2); // value at x = 3, with mean=4 and sigma=2
//
n.dnorm(-10, 0, 1); // of course the gaussian is almost zero 10 sigmas from the mean
//7.69459862670642e-23

n.dnorm([
  Number.NEGATIVE_INFINITY,
  -4,
  -3,
  -2,
  -1,
  0,
  Number.NaN,
  1,
  2,
  3,
  4,
  Number.POSITIVE_INFINITY
]);
/*[ 0,
  0.00013383022576488537,
  0.0044318484119380075,
  0.05399096651318806,
  0.24197072451914337,
  0.3989422804014327,
  NaN,
  0.24197072451914337,
  0.05399096651318806,
  0.0044318484119380075,
  0.00013383022576488537,
  0 ]
*/
```

_Equivalence in R console_

```R
> dnorm(c(-Inf, -4,-3,-2,-1,0,NaN,1,2,3,4, Inf));
 [1] 0.0000000000 0.0001338302 0.0044318484 0.0539909665 0.2419707245 0.3989422804          NaN 0.2419707245
 [9] 0.0539909665 0.0044318484 0.0001338302 0.0000000000
```

`Another Javascript Example:`

```javascript
n.dnorm(
  [
    Number.NEGATIVE_INFINITY,
    -4,
    -3,
    -2,
    -1,
    0,
    Number.NaN,
    1,
    2,
    3,
    4,
    Number.POSITIVE_INFINITY
  ],
  0,
  1,
  true
)[
  (-Infinity,
  -8.918938533204672,
  -5.418938533204673,
  -2.9189385332046727,
  -1.4189385332046727,
  -0.9189385332046728,
  NaN,
  -1.4189385332046727,
  -2.9189385332046727,
  -5.418938533204673,
  -8.918938533204672,
  -Infinity)
];
```

_Equivalence in R console_

```R
 >dnorm(c(-Inf, -4,-3,-2,-1,0,NaN,1,2,3,4, Inf), 0,1, TRUE);
 [1]       -Inf -8.9189385 -5.4189385 -2.9189385 -1.4189385 -0.9189385        NaN -1.4189385 -2.9189385 -5.4189385
[11] -8.9189385       -Inf
```

`qnorm(p: number|number[], mean: number = 0, sigma: number =1, lowerTail: boolean = true, logP: boolean= false)`

```javascript
//
// 10% probability is at quantile position -1.281552
n.qnorm(0.1);
//  -1.281552
//
n.qnorm([0, 0.05, 0.25, 0.5, 0.75, 0.95, 1]);
/*[
  -Infinity,
  -1.6448536269514726,
  -0.6744897501960817,
  0,
  0.6744897501960817,
  1.6448536269514715,
  Infinity
  ]
  */
```

_R equivalent_

```R
#R console
> qnorm( c( 0, 0.05, 0.25 ,0.5 , 0.75, 0.95, 1));
[1] -Inf -1.6448536 -0.6744898  0.0000000  0.6744898  1.6448536 Inf
```

`pnorm(q: number|number[], mean = 0, sigma = 1, lowerTail = TRUE, logP = FALSE)`
_(cumulative distribution function)_

```javascript
n.pnorm([Number.NEGATIVE_INFINITY, -4, -3, -2, -1, 0, 1, 2, 3, 4]);
/*[ 0,
  0.000031671241833119924,
  0.0013498980316300946,
  0.022750131948179212,
  0.15865525393145705,
  0.5,
  0.8413447460685429,
  0.9772498680518208,
  0.9986501019683699,
  0.9999683287581669 ]
*/
```

_R equivalent_

```R
#R console
> qnorm( c( 0, 0.05, 0.25 ,0.5 , 0.75, 0.95, 1));
[1] -Inf -1.6448536 -0.6744898  0.0000000  0.6744898  1.6448536 Inf
```

pnorm with `logp = true`

```javascript
n.pnorm([Number.NEGATIVE_INFINITY, -4, -3, -2, -1, 0], 0, 1, true, true);
/*[ -Infinity,
  -10.360101486527292,
  -6.607726221510349,
  -3.7831843336820317,
  -1.8410216450092636,
  -0.6931471805599453 ]*/
```

_R equivalent_

```R
> pnorm(c(-Inf,-4,-3,-2,-1,0), 0, 1, log.p=TRUE)
[1]        -Inf -10.3601015  -6.6077262  -3.7831843  -1.8410216  -0.6931472
```

`rnorm(n, mean = 0, sigma = 1)`

```javascript
n.rnorm(5);
/*[ -0.6499284414442905,
  -0.7896970173309513,
  -1.5623487035106534,
  0.9510909335228415,
  -0.1333623579729381 ]
 */
```

_R equivalent_

```R
> rnorm(5)
[1] -0.6499284 -0.7896970 -1.5623487  0.9510909 -0.1333624
```

`Another Javascript Example:`

```javascript
sd.init(0); // make sure to reset SuperDuper to get the same answers below in R
n.rnorm(5, 2, 3);
/*[ 0.05021467566712845,
  -0.3690910519928541,
  -2.68704611053196,
  4.853272800568524,
  1.5999129260811857 ]*/
```

_R equivalent_

```R
> rnorm(5,2,3)
[1]  0.05021468 -0.36909105 -2.68704611  4.85327280  1.59991293
```
