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
* [Uniform probability distribution](#uniform-probability-distribution)
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
  * [Studentized Range (_Tukey_) Distribution](#studentized-range-distribution)
  * [Weibull Distribution](#weibull-distribution)
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

The setup in `libRMath.js` will deviate slightly from this grouping. There
random generators will still be grouped according to their respective
distributions as in R, but also grouped separately into
`lib-r-math/rng/<distribution name>`.

## The 7 samurai of Uniform Random Number Generators.

#### Summary

These PRNG classes can be used by themselves but mostly intended to be consumed
to generate random numbers with a particular distribution (like `Normal`,
`Gamma`, `Weibull`, `Chi-square` etc). Type in your R-console the command
`?RNGkind` for an overview.

All 7 uniform random generators have been ported and tested to yield exactly the
same as their R counterpart.

#### Improvements.

In R it is impossible to use different types of uniform random generators at the
same time because of a global shared seed buffer. In our port every random
generator has its own buffer and can therefore be used at the same time.

#### General Usage.

All uniform random generator export the same functions:

1. `init`: set the random generator seed (it will be pre-scrambled)
2. `seed (read/write property)`: get/set the current seed values as an array.
3. `unif_random`: get a random value, same as `runif(1)` in R

#### "Mersenne Twister".

From Matsumoto and Nishimura (1998). A twisted GFSR with period `2^19937 - 1`
and equi-distribution in 623 consecutive dimensions (over the whole period). The
_`seed`_ is a 624-dimensional set of 32-bit integers plus a current position in
that set.

usage example:

```javascript
const libR = require('lib-r-math.js');
const { MersenneTwister } = libR.rng;

const mt = new MersenneTwister(0); // initialize with seed = 1
// R will show the exact same results,
// with the same seed values
mt.init(0); // change seeding to 0
// get internal seed buffer of 625 32 bit ints
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

mt.unif_rand(); // get a value between 0 and 1
//0.8966972001362592
mt.unif_rand();
//0.2655086631421
mt.unif_rand();
//0.37212389963679016
mt.unif_rand();
//0.5728533633518964
mt.unif_rand();
//0.9082077899947762
````

_in R console_:

```R
  > RNGkind("Mersenne-Twister")
  > set.seed(0)
  > runif(5)
[1] 0.8966972 0.2655087 0.3721239 0.5728534
[5] 0.9082078
```

#### "Wichmann-Hill".

The seed, is an integer vector of length 3, where each element is in `1:(p[i] - 1)`, where p is the length 3 vector of primes, `p = (30269, 30307, 30323)`. The
`Wichmann–Hill` generator has a cycle length of `6.9536e12 = ( 30269 * 30307 * 30323 )`, see Applied Statistics (1984) 33, 123 which corrects the original
article).

usage example:

```javascript
const libR = require('lib-r-math.js');
const { WichmannHill } = libR.rng;

const wh = new WichmannHill(0); // initialize with zero

wh.init(0); // re-initialize at any time (again to zero)
wh.seed;
//[ 2882, 21792, 10079 ]
wh.unif_rand();
//0.4625531507458778
wh.unif_rand();
//0.2658267503314409
wh.unif_rand();
//0.5772107804324318
wh.unif_rand();
//0.5107932055258312
wh.unif_rand();
//0.33756055865261403
```

_in R console_:

```R
> RNGkind("Wichmann-Hill")
> set.seed(0)
> runif(5)
[1] 0.4625532 0.2658268 0.5772108 0.5107932
[5] 0.3375606
```

#### "Marsaglia-Multicarry":

A multiply-with-carry RNG is used, as recommended by George Marsaglia in his
post to the mailing list ‘sci.stat.math’. It has a period of more than 2^60 and
has passed all tests (according to Marsaglia). The seed is two integers (all
values allowed).

usage example:

```javascript
const libR = require('lib-r-math.js');
const { MarsagliaMultiCarry } = libR.rng;
const mmc = new MarsagliaMultiCarry(0);

mmc.seed;
//[ -835792825, 1280795612 ]
mmc.unif_rand();
//0.16915375533726848
mmc.unif_rand();
//0.5315435299490446
mmc.unif_rand();
//0.5946052972214773
mmc.unif_rand();
//0.23331540595584438
mmc.unif_rand();
//0.45765617989414736
```

_in R console_:

```R
> RNGkind("Marsaglia-Multicarry")
> set.seed(0)
> runif(5)
[1] 0.1691538 0.5315435 0.5946053 0.2333154
[5] 0.4576562
```

#### "Super Duper":

Marsaglia's famous Super-Duper from the 70's. This is the original version which
does not pass the MTUPLE test of the Diehard battery. It has a period of about
4.6\*10^18 for most initial seeds. The seed is two integers (all values allowed
for the first seed: the second must be odd).

_We use the implementation by Reeds et al (1982–84)._

usage example:

```javascript
const libR = require('lib-r-math.js');
const { SuperDuper } = libR.rng;
const sd = new SuperDuper(0);

sd.init(0); // re-initialize with any seed value at any time

sd.seed;
//[ -835792825, 1280795613 ]
sd.unif_rand();
//0.6404035621416762
sd.unif_rand();
//0.5927312545461418
sd.unif_rand();
//0.41296871248934613
sd.unif_rand();
//0.18772939946216746
sd.unif_rand();
//0.26790581137591635
```

_in R console_:

```R
> RNGkind("Super-Duper")
> set.seed(0)
> runif(5)
[1] 0.6404036 0.5927313 0.4129687 0.1877294
[5] 0.2679058
```

#### "Knuth TAOCP":

An earlier version from Knuth (1997).

The 2002 version was not backwards compatible with the earlier version: the
initialization of the GFSR from the seed was altered. R did not allow you to
choose consecutive seeds, the reported ‘weakness’, and already scrambled the
seeds.

usage example:

```javascript
const libR = require('lib-r-math.js');
const { KnuthTAOCP } = libR.rng;
const kt = new KnuthTAOCP(0);

kt.init(0); // at any time you can re-initialize with 0 (or any other value)
kt.seed;
// 101 unsigned integer array
//[ 673666444,
//  380305043,
//  1062889978,
//  926003693,
//  711138356,
// .
// .
kt.unif_rand();
//0.6274007670581344
kt.unif_rand();
//0.35418667178601043
kt.unif_rand();
//0.9898934308439498
kt.unif_rand();
//0.8624081434682015
kt.unif_rand();
//0.6622992046177391
kt.unif_rand();
//0.07780042290687564
```

_in R console_:

```R
> RNGkind("Knuth-TAOCP")
> set.seed(0)
> runif(5)
[1] 0.6404036 0.5927313 0.4129687 0.1877294
[5] 0.2679058
```

#### "Knuth TAOCP 2002":

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
const { KnuthTAOCP2002 } = libR.rng;
const kt2002 = new KnuthTAOCP2002(0);

kt2002.init(0); //re-initialize with seed 0

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
// .
kt2002.unif_rand();
//0.19581903796643027
kt2002.unif_rand();
//0.7538668839260939
kt2002.unif_rand();
//0.47241124697029613
kt2002.unif_rand();
//0.19316043704748162
kt2002.unif_rand();
//0.19501840975135573
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
const { LecuyerCMRG } = libR.rng;
const lc = new LecuyerCMRG(0);

lc.init(0); // at any time re-initialize with any value (in this case 0)
lc.seed;
// 6 unsigned integer array
//[ -835792825,
// 1280795612,
// -169270483,
// -442010614,
// -603558397,
// -222347416 ]
lc.unif_rand();
//0.33292749227232266
lc.unif_rand();
//0.890352617994264
lc.unif_rand();
//0.1639634410628108
lc.unif_rand();
//0.29905082406536015
lc.unif_rand();
//0.3952390917599507
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
> runif(6)
[1] 0.3329275 0.8903526 0.1639634 0.2990508
[5] 0.3952391 0.3601516
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

All normal random generator export the same functions:

1. A constructor that takes an instance of a uniform PRNG as an argument
2. `unif_random`: get a random value, same as `rnorm(1)` in R

#### "Ahrens Dieter"

Ahrens, J. H. and Dieter, U. (1973) Extensions of Forsythe's method for random
sampling from the normal distribution. Mathematics of Computation 27, 927-937.

example usage:

```javascript
const libR = require('lib-r-math.js');
// use "super duper" as a source
const superDuper = new libR.rng.SuperDuper(0);
// choose Normal Distribution generator
const ad = new libR.rng.normal.AhrensDieter(superDuper);

ad.norm_rand();
//-0.3180518208764651
ad.norm_rand();
//-0.19448648895668033
ad.norm_rand();
//1.2614076261183398
ad.norm_rand();
//0.4567985990503189
ad.norm_rand();
//1.877565756757425
ad.norm_rand();
//1.7514257448434023
ad.norm_rand();
//-2.102682776900587
ad.norm_rand();
//-0.523434193313018
ad.norm_rand();
//-0.5367775836529348
ad.norm_rand();
//0.3683898635363076
```

_in R console_

```R
> RNGkind("Super",normal.kind="Ahrens-Dieter")
> set.seed(0)
> rnorm(10)
 [1] -0.3180518 -0.1944865  1.2614076  0.4567986
 [5]  1.8775658  1.7514257 -2.1026828 -0.5234342
 [9] -0.5367776  0.3683899
```

#### Box Muller

Box, G. E. P. and Muller, M. E. (1958) A note on the generation of normal random
deviates. Annals of Mathematical Statistics 29, 610–611.

The Box Muller has an internal state that is reset if the underlying uniform RNG
is reseted with `init`.

example usage:

```javascript
const libR = require('lib-r-math.js');
// use "super duper" as a source
const superDuper = new libR.rng.SuperDuper(0);
// choose Normal Distribution generator
const bm = new libR.rng.normal.BoxMuller(superDuper);

// call the random generator 10 times
const samples10 = new Array(10).fill(0).map(() => bm.norm_rand());
/*[
   -0.6499284414442905,
  -0.7896970173309513,
  -1.5623487035106534,
  0.9510909335228415,
  -0.1333623579729381,
  1.180379344033075,
  -1.3236923306851587,
  0.24483127562009374,
  0.8185152645202417,
  -0.0058679868130992385
   ]
  */
```

_in R console_

```R
> RNGkind("Super",normal.kind="Box-Muller")
> set.seed(0)
> rnorm(10)
 [1] -0.649928441 -0.789697017 -1.562348704  0.951090934
 [5] -0.133362358  1.180379344 -1.323692331  0.244831276
 [9]  0.818515265 -0.005867987
>
```

#### Buggy Kinderman Ramage

Kinderman, A. J. and Ramage, J. G. (1976) Computer generation of normal random variables. Journal of the American Statistical Association 71, 893-896.

The Kinderman-Ramage generator used in versions prior to 1.7.0 (now called "Buggy") had several approximation errors and should only be used for reproduction of old results.

example usage:

```javascript
const libR = require('lib-r-math.js');
// use "super duper" as a source
const superDuper = new libR.rng.SuperDuper(0);
const bkr = new libR.rng.normal.BuggyKindermanRamage(superDuper);

bkr.norm_rand();
//0.7027315285336992

superDuper.init(0); // re-initialize seeds
// fetch 10 samples
const samples10 = new Array(10).fill(0).map(() => bkr.norm_rand());
/*[ 0.7027315285336992,
  -0.7648617333751202,
  -0.4501248829623014,
  -0.14014900565240082,
  -2.3594651610476998,
  -0.18517165554837695,
  1.052709316960406,
  -0.22197194214929436,
  0.20978854257135465,
  -0.6538655205044008 ]
  */
```

```R
> RNGkind("Super",normal.kind="Buggy")
> set.seed(0)
> rnorm(10)
 [1]  0.7027315 -0.7648617 -0.4501249 -0.1401490
 [5] -2.3594652 -0.1851717  1.0527093 -0.2219719
 [9]  0.2097885 -0.6538655
>
```

#### Inversion

Inverse transform sampling
https://en.wikipedia.org/wiki/Inverse_transform_sampling

example usage:

```javascript
const libR = require('lib-r-math.js');
// use "super duper" as a source
const superDuper = new libR.rng.SuperDuper(0);
const bkr = new libR.rng.normal.Inversion(superDuper);

const samples10 = new Array(10).fill(0).map(() => bkr.norm_rand());
/*
[ 0.35953771535957096,
  -0.21991491144870018,
  -0.6191589898929112,
  -0.07302897332147915,
  3.050850946157098,
  0.5836409707816284,
  0.6310826502008731,
  0.16729394060231315,
  0.7794915901865656,
  0.6287100957429498 ]
*/
```

_in R console_

```R
> RNGkind("Super",normal.kind="Inversion")
> set.seed(0)
> rnorm(10)
 [1]  0.35953772 -0.21991491 -0.61915899 -0.07302897
 [5]  3.05085095  0.58364097  0.63108265  0.16729394
 [9]  0.77949159  0.62871010
```

#### Kinderman Ramage

Kinderman, A. J. and Ramage, J. G. (1976) Computer generation of normal random variables. Journal of the American Statistical Association 71, 893-896.

_Non "buggy" version_

example usage:

```javascript
const libR = require('lib-r-math.js');
// use "super duper" as a source
const superDuper = new libR.rng.SuperDuper(0);
const bkr = new libR.rng.normal.KindermanRamage(superDuper);

bkr.norm_rand();
//0.7027315285336992

superDuper.init(0); // re-initialize seeds
// fetch 10 samples
const samples10 = new Array(10).fill(0).map(() => bkr.norm_rand());
/*[ 0.7027315285370768,
  -0.764861733372942,
  -0.45012488296088843,
  -0.14014900564991717,
  -2.3594651610476998,
  -0.18517165554753579,
  1.0527093169646426,
  -0.22197194214874572,
  0.2097885425730306,
  -0.6538655205035446 ]*/
```

_in R console_

```R
> RNGkind("Super",normal.kind="Kinder")
> set.seed(0)
> rnorm(10)
 [1]  0.7027315 -0.7648617 -0.4501249 -0.1401490
 [5] -2.3594652 -0.1851717  1.0527093 -0.2219719
 [9]  0.2097885 -0.6538655
>
```

## Probability Distributions.

#### Summary

In the Section [1](#1-probability-functions-random-number-generators) the RNG
classes can be used by themselves but mostly intended to be consumed to generate
random numbers with a particular distribution (like `Normal`, `Gamma`,
`Weibull`, `Chi-square` etc).

_It is also possible to provide your own uniform random source (example: real
random numbers fetched from services over the internet). How to create your own
PRNG to be consumed by probability distribution simulators is discussed in the
[Appendix](#appendix)._

#### Uniform distribution

`dunif, qunif, punif, runif`

[_Naming follows exactly their R counter part_](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Uniform.html)

Usage:

```javascript
const libR = require('lib-r-math.js');

// get the suite of functions working with uniform distributions
const { uniform } = libR;

// prepare PRNG
const { SuperDuper } = libR.rng;

// initialize PRNG with seed (`0` and `1234`) and create R instance of uniform functions working with this PRNG
const Runif = uniform(new SuperDuper(0));
const Runif2 = uniform(new SuperDuper(1234));

// for documentation purpose we strip R uniform equivalents
const { runif, dunif, punif, qunif } = Runif;

// Get 15 uniformly distributed numbers between 0 and 1
runif(15);

// Get 5 uniformly distributed numbers between 4 and 9
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
