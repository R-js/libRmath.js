# libRmath.js

This is a 100% Pure Javascript ( TypeScript ) re-write of Statistical R `nmath` "core" numerical
 library found [here](https://svn.r-project.org/R/trunk/src/nmath/).
This is a manual re-write, ["emscripten"](https://kripken.github.io/emscripten-site) was not used.


#### Summary

libRmath.js port contains all functions implemented in R `nmath` counterpart:

* probability and quantile functions related to 21 distributions.
* functions to work with `Special functions  in mathematics` (`Bessel`,`Gamma`,`Beta`).
* 7 uniform PRNG's. (same output pseudo-random sequence in R for the same initial seeding).
* 6 normally distributed PRNG's. (same output sequence in R for te same initial seeding).
* Function vector (array) arguments follow the [R recycling rule](https://cran.r-project.org/doc/manuals/r-release/R-intro.html#The-recycling-rule).

With this library it becomes trivial to implement hypothesis testing in javascript, calculating p-values and (1 - α) confidence intervals. (`ANOVA` uses the F-distribution. Tukey HSD uses `ptukey` function, etc, etc).

All functions in `libRmath.so` has been re-written to `Javascript` (`Typescript`).
Use the library with either vanilla `Javascript` or `Typescript`.
Type definition files are included in the npm package.

#### Node and Web

The library is an UMD library, it can be used in a web client
as in server side node environment.

## Installation

#### serverside

```bash
npm install --save lib-r-math.js
```

#### web

The module directory contains a minimized bundle for use in html `<script>` tag. The library is attached to the `window.libR` object after loading.

```html
<!-- script src="your_server_url/libR.min.js"></script -->
<!-- this example uses unpkg as CDN -->
<script src="https://unpkg.com/lib-r-math.js@1.0.74/dist/lib/libR.min.js">
<script>
  const libR = window.libR;
  //fetch some distribution namespaces
  const { Tukey, Normal, Beta, StudentT, Wilcoxon } = libR;
</script>
```

# Table of Contents

* [Differences with R](#differences-with-r)
* [*Read this first*: Helper functions](#helper-functions-for-porting-r-programs)
* [Uniform Pseudo Random Number Generators](#uniform-pseudo-random-number-generators)
* [Normal Random Number Generators](#normal-distributed-random-number-generators)
* [Normal and Uniform distributions](#normal-and-uniform-distributions)
  * [Uniform distribution](#uniform-distribution)
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
  * [Studentized Range distribution, (_Tukey_)](#studentized-range-distribution-tukey-hsd)
  * [Weibull distribution](#weibull-distribution)
  * [Wilcoxon rank sum statistic distribution](#wilcoxon-rank-sum-statistic-distribution)
* [Special Functions of Mathematics](#special-functions-of-mathematics)
  * [Bessel functions](#bessel-functions)
  * [Beta functions](#beta-functions)
  * [Gamma functions](#gamma-functions)
  * [Binomial coefficient functions](#binomial-coefficient-functions)

# Differences with R

Some implementation differences exist with R `nmath`

* PRNG's are not global singletons, but separate object instances and you can have as many as you want. The programmer has the choice of having different deviate generators sharing a common source PRNG.
* Wilcoxon Sum Rank functions `dwilcox, pwilcox, qwilcox` use a fraction of the memory, (R will give memory allocation errors for samples ~1000). The JS solution allocates memory sparsely.

# Helper functions for porting `R` programs

#### Summary

R language operators and function arguments can work with `vectorized input`.
These helper functions are used to mimic this functionality and assist porting of scripts from the R ecosystem using `libRmath.js`.

### `div`

Divides scalar or an array of values with element of the second array or scalar.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { div } = libR.R;

//1
div(3, 5); //= 3/5
//0.6

div([0, 1, 2, 3], 5);
//[0, 0.2, 0.4, 0.6]

div([10,2,3],[2,4]);// Uses R recycling rules
//[ 5, 0.5, 1.5 ]
```

### `mult`

Multiplies scalar or an array of values with another scalar or array of values.
Applies [R recycling rules](https://cran.r-project.org/doc/manuals/r-release/R-intro.html#The-recycling-rule) in case of arguments of unequal array length.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { mult } = libR.R;

//1
mult(3, 5); //= 3*5
//15

mult([0, 1, 2, 3], [5,2]); // R recycling rules apply
//[ 0, 2, 10, 6 ]
```

### `asArray`

Creates a new function from an existing one for it to always return its result as an array.

Usage:

```typescript

const libR = require('lib-r-math.js');
const { asArray } = libR.R;

const r = asArray(Math.random);

//always returns the result wrapped in an array
r()
//[ 0.39783583929513 ]
r()
//[ 0.04431401890179831 ]
r()
//[ 0.7629304997301447 ]
```

### `sum`

Analog to `R`'s `sum` function. Calculates the sum of all elements of an array.

```javascript
const libR = require('lib-r-math.js');
const { sum } = libR.R;

//1
sum(5); //trivial
//5

//2
sum([1, 2, 3, 4]);
//10
```

### `summary`

Gives summary information of numeric data in an array.

_typescript decl_

```typescript
declare function summary(data: number[]): ISummary;

//output
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
Takes single numeric value as argument or an array of numbers.

Usage:

```javascript
const libR = require('lib-r-math.js');

const digits4 = libR.R.numberPrecision(4);

//1 single value
const pr4a = digits4(1.12345678);
//1.123

//2 works with arrays
const pr4b = digits4([0.4553, -2.1243]);
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

### `arrayrify` **(DEPRICATED use [`multiplex`](#multiplex))**

Mimics R vectorized function arguments. Wraps an existing function changing the first first argument to accept both scalar (number) or an array( number[] ).

_Note: Only the first argument is vectorized_

_typescript decl_

```typescript
declare function arrayrify<T, R>(fn: (x: T, ...rest: any[]) => R);
```

#### R example

```R
# raise each element by power of 2
c(1,2,3,4)^2
#[1]  1  4  9 16
```

#### Javascript equivalent

```javascript
 const libR = require('lib-r-math.js');
 const { arrayrify } = libR.R;

 // create vectorize "/" operator
 const pow = arrayrify(Math.pow);

 pow(3, 4); // 81

 pow([3, 4, 5], 4); //81 256 625
```


### `each`

Functional analog to `Array.prototype.forEach`, but can also loop over object properties.
The return type can be either an new array or a scalar (see `Example`).

Example:

```javascript
const libR = require('lib-r-math.js');
const { each } = libR.R;

each(11)(v => console.log(v * 2)) ;

// single element array result are forced to return scalar
each([3])(v => console.log(v * 2));

each([11, 12])( (v, idx) => console.log({ v, idx}));

//looping over object properties
each({ p:1, name:'myname' })( (value, key) => console.log(`${key}=${value}`))
```

### `flatten` or `c` (alias)

Analog to R's `c` function. Constructs a final array by (recursively) flattening and merging all of its arguments which can be a combination of scalars and arrays.

Example:

```javascript
const libR = require('lib-r-math.js');

// optionally rename as `c` to make it look like `R`
const { c } = libR.R;

c(-1, 0, [1], 'r', 'b', [2, 3, [4, 5]]);
// [ -1, 0, 1, 'r', 'b', 2, 3, 4, 5 ]
```

### `map`

Functional analog to `Array.prototype.map`, but can also loop over object properties.
The return type can be either an new array or a scalar (see `Example`).

Example:

```javascript
const libR = require('lib-r-math.js');
const { map } = libR.R;

map(11)(v => v * 2);
//22

// single element array result are forced to return scalar
map([3])(v => v * 2);
//6

map([11, 12])( (v, idx) => idx);
// [0, 1]

//looping over object properties
map({ p:1, name:'myname' })( (value, key) => `${key}=${value}`)
//["p=1", "name=myname"]
```

### `selector`

Filter function generator, to be used with `Array.prototype.filter` to pick elements based on their order (zero based index) in the array.
Usually used together with `seq` to pick items from an array.

**NOTE:** Always returns an instance of Array.

Example:

```javascript
const libR = require('lib-r-math.js');
const { selector } = libR.R;

['an', 'array', 'with', 'some', 'elements'].filter(
  selector([0, 2, 3]) // select values at these indexes
);
//[ 'an', 'with', 'some']

['an', 'array', 'with', 'some', 'elements'].filter(
  selector(3) // just one value at position 3
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

_typescript decl_

```typescript
const seq = (adjustUp = 0) => (adjustDown = adjust) => (
  start: number,
  end: number = 1,
  step: number = 1
) => number[];
```

R analog to the `seq` function in R. Generates an array between `start` and `end` (inclusive) using `step` (defaults to `1`). The JS implementation ignores the **sign** of the
`step` argument and only looks at its absolute value.

Like in R, If `(end-start)/step` is not an exact integer, `seq` will not overstep the bounds while counting up (or down).

Arguments:

* `adjustUp`: (default 0). If `end` >= `start` then `adjust` value is added to every element in the array.
* `adjustDown`: (default 0). If `start` >= `end` then `adjustMin` value is added to every element in the array.
* `start`: (inclusive) the sequence start value
* `stop`: defaults to `1`. (inclusive) the sequence stop value if possible with `step`
* `step`: defaults to `1`, sign is ignored. Sign is inferred from the values of `start` and `stop`.

First we look how `seq` works in R.

_R_

```R
seq(1,3,0.5);
#[1] 1.0 1.5 2.0 2.5 3.0

seq(7,-2, -1.3);
#[1]  7.0  5.7  4.4  3.1  1.8  0.5 -0.8
```

_Equivalent in Javascript_

```javascript
const libR = require('lib-r-math.js');

// seqA is a sequence generator
let seqA = libR.R.seq()();

seqA(1, 5);
//[ 1, 2, 3, 4, 5 ]

seqA(5, -3);
//[ 5, 4, 3, 2, 1, 0, -1, -2, -3 ]

seqA(3)
//[3, 2, 1]

//add 1 if stepping upwards, add -2 if stepping downwards
let seqB = libR.R.seq(1)(-2);

seqB(0, 4); //range will be adjusted with '1'
//[ 1, 2, 3, 4]
seqB(6, 5, 0.3); //range will be adjusted with '-2', step
//[4, 3.7, 3.4, 3.1]

```

### `multiplex`

Turns an existing javascript function into one that follows the [R argument recycling rule](https://cran.r-project.org/doc/manuals/r-release/R-intro.html#The-recycling-rule).

Multiplexes the value of several array arguments into one array with the
use of a mapping function.

The length of the result is the maximum of the lengths of the parameters.
All parameters are recycled to that length.

```javascript
const libR = require('lib-r-math.js');

const { multiplex, c } = libR.R;

//make the build in Math function follow R-recycling rule
const pow = multiplex(Math.pow);
//
pow([1, 2, 3, 4], 2); //squared
//[ 1, 4, 9, 16 ]

//powers of 2
pow(2, [2, 3, 4])
    //[ 4, 8, 16 ]

//R recycling rule
pow([2, 3], [2, 3, 4, 5]);
//[4, 27, 16, 243]
//4 = 2 ^ 2
//27 = 3 ^ 3
//16 = 2 ^ 4
//243 = 3 ^ 5
```

### `timeseed`

Generates a number based by on your system time clock. Intended use is with
PRNG (re)initialization. Its a synchronized function that will wait for some milliseconds before sampling the system clock and returning a result.

Usage:

```javascript
const libR = require('lib-r-math.js');

const { rng: { timeseed } } = libR;

timeseed();
//2632999169 , based on timestamp
```

# Uniform Pseudo Random Number Generators

#### Summary

In 'R', the functions that generate random deviates of distributions (Example: Poisson (`rpois`), Student-t (`rt`), Normal (`rnorm`), etc) use uniform PRNG's directly or indirectly (as wrapped in a normal distributed PRNG). This section discusses the uniform distributed PRNG's that have been ported from R to JS.

## The 7 Uniform Random Number Generators

All 7 uniform random generators have been ported and tested to yield exactly the
same as their R counterpart.

#### Improvements compared to R

In R it is impossible to use different types of uniform random generators at the
same time because of a global shared seed buffer. In our port every random
generator has its own buffer and can therefore be used concurrently.

#### General Usage

All uniform random generator classes have these public methods:

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
    R: { numberPrecision },
    rng: { MersenneTwister, timeseed }
} = libR;

//helpers
const precision = numberPrecision(9); //9 digits accuracy

//example
const mt = new MersenneTwister(12345); // initialize with seed = 12345

//example
mt.init(timeseed()); // Use seed derived from system clock

//example
mt.init(0); // re-initialize with seed = 0

// show first 8 values of the seed buffer of the mt instance.
mt.seed.slice(0, 8);
/*[ 624,   1280795612,  -169270483,  -442010614,  -603558397,  -222347416,
  1489374793, 865871222 ]
*/

const rmt1 = mt.unif_rand(5);
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
const {
  rng: { WichmannHill, timeseed },
  R: { numberPrecision }
} = libR;

// some helpers

const precision = numberPrecision(9);

// Some options on seeding given below
const wh = new WichmannHill(1234); // initialize seed with 1234 on creation (default 0)
//
wh.init(timeseed()); // re-init seed with a random seed based on timestamp

wh.init(0); // re-init seed to zero
wh.seed; // show seed
//[ 2882, 21792, 10079 ]
const rwh1 = wh.unif_rand(5);
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
    R: { numberPrecision }
} = libR;

//usefull helpers
const precision = numberPrecision(9); //9 significant digits

// Some options on seeding given below
const mmc = new MarsagliaMultiCarry(1234); // use seed = 1234 on creation

mmc.init(timeseed());
mmc.init(0); // also, defaults to '0' if seed is not specified
mmc.seed;
//[ -835792825, 1280795612 ]

const rmmc = mmc.unif_rand(5);
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
const {
    rng: { SuperDuper, timeseed },
    R: { seq, numberPrecision }
} = libR;

//usefull helpers
const precision = numberPrecision(9); //9 significant digits

// Seeding possibilities shown below
const sd = new SuperDuper(1234); // use seed = 1234 on creation
sd.init(timeseed()); // re-initialize with random seed based on timestamp
sd.init(0); // re-initialize with seed = 0.
//
sd.seed;
//[ -835792825, 1280795613 ]

const rsd1 = sd.unif_rand(5);
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
const {
    rng: { KnuthTAOCP, timeseed },
    R: { seq, numberPrecision }
} = libR;

//usefull helpers
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

const rkn97 = kn97.unif_rand(5);
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
const {
    rng: { KnuthTAOCP2002, timeseed },
    R: { numberPrecision }
} = libR;

//some helpers
const precision = numberPrecision(9);

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
const kt02 = kt2002.unif_rand(5);
precision(kt02);
//[ 0.195819038, 0.753866884, 0.472411247, 0.193160437, 0.19501841 ]
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
const {
    rng: { LecuyerCMRG, timeseed },
    R: { numberPrecision }
} = libR;

//some helpers
const precision = numberPrecision(9);

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
const lc1 = lc.unif_rand(5);
precision(lc1);
//[ 0.332927492, 0.890352618, 0.163963441, 0.299050824, 0.395239092 ]
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

## Normal distributed Random Number Generators

#### Summary

This section discusses the `normal distributed PRNG's` that have been ported from R to JS.

All 6 `normal random generators` have been ported and tested to yield exactly the same as their R counterpart.

#### General Use

All normal random generator adhere to the same principles:

1. A constructor that takes an instance of a uniform PRNG as an argument
2. A function `norm_random`: get a random value, same as `rnorm(1)` in R.
3. A function `unif_random`: the underlying _uniform_ PRNG.
4. The default argument for the constructor for _normal_ PRNG is : `Mersenne-Twister`.
5. The class instance property `rng` contains the wrapped _uniform_ PRNG instance. 
5. All PRNG producing normal variates are packaged under the JS library name space `rng.normal`.

#### "Ahrens Dieter"

Ahrens, J. H. and Dieter, U. (1973) Extensions of Forsythe's method for random
sampling from the normal distribution. Mathematics of Computation 27, 927-937.

example usage:

```javascript
const libR = require('lib-r-math.js');
const {
    rng: {
        SuperDuper,
        normal: { AhrensDieter }
    },
    R: { numberPrecision }
} = libR;

//helper
const precision = numberPrecision(9);

// explicit use of uniform PRNG
const sd = new SuperDuper(0);
const ad1 = new AhrensDieter(sd);

// At any time reset normal PRNG seed via wrapped uniform.
sd.init(9987);
ad1.rng.init(9987); //same as above

// uses default uniform PRNG "MersenneTwister" with seed 0
const ad2 = new AhrensDieter();

// reference to uniform PRNG under rng property
ad2.rng.init(0);

// bleed the normal PRNG
const rngAd = ad2.norm_rand(5);
precision(rngAd);
//[ -1.17616753, 0.674117732, 1.06414352, -0.143897298, -1.2311498 ]

// its still possible to bleed the uniform PRNG from the normal PRNG
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

Example usage:

```javascript
const libR = require('lib-r-math.js');

const {
    rng: {
        SuperDuper,
        normal: { BoxMuller }
    },
    R: { numberPrecision }
} = libR;

// helper
const precision = numberPrecision(9);

const sd = new SuperDuper(0);
const bm1 = new BoxMuller(sd);

// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses default uniform PRNG: MersenneTwister with seed 0
const bm2 = new BoxMuller();

// reference to uniform PRNG under rng property
bm2.rng.init(0);
// bleed the normal PRNG
const bm = bm2.norm_rand(5);
precision(bm);
//[ 1.29738758, -0.984378527, -0.732798867, 0.759774198, 1.49998876 ]

// its possible to bleed the uniform PRNG from the normal PRNG
bm2.unif_rand();
//0.8983896849676967

bm2.rng.unif_rand();
//0.944675268605351
```

_R equivalent_

```R
> RNGkind("Mersenne-Twister",normal.kind="Box-Muller")
> set.seed(0)
> rnorm(5)
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
const {
    R: { numberPrecision },
    rng: { SuperDuper, normal: { BuggyKindermanRamage } }
} = libR;
//helper
const precision = numberPrecision(9);

// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const sd = new SuperDuper(0);
const bkm1 = new BuggyKindermanRamage(sd);

// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);
bkm1.rng.init(0); //same as above

// uses default uniform PRNG new MersenneTwister with seed 0
const bkm2 = new BuggyKindermanRamage();

// reference to uniform PRNG under rng property
bkm2.rng.init(0);

// bleed the normal PRNG
const bk = bkm2.norm_rand(5);
precision(bk);
//[ 0.3216151, 1.23251561, 0.280369528, -1.17519641, -1.60471361 ]

// its possible to bleed the uniform PRNG from the normal PRNG
bkm2.unif_rand();
//0.17655675252899528

bkm2.rng.unif_rand();
//0.6870228466577828
```

_in R Console_

```R
RNGkind("Mersenne-Twister",normal.kind="Buggy Kinderman-Ramage");
set.seed(0);
rnorm(5);
#[1]  0.3216151  1.2325156  0.2803695 -1.1751964
#[5] -1.6047136

runif(2);
#[1] 0.1765568 0.6870228
```

#### Inversion

Inverse transform sampling [wiki](https://en.wikipedia.org/wiki/Inverse_transform_sampling)

example usage:

```javascript
const libR = require('lib-r-math.js');
// Possible to arbitraty uniform PRNG source (example: SuperDuper)
const {
    rng: { SuperDuper, normal: { Inversion } },
    R: { numberPrecision }
} = libR;
//helper
const precision = numberPrecision(9);

const sd = new SuperDuper(0);
const inv1 = new Inversion(sd);
// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(0);

// uses as default uniform PRNG "MersenneTwister" with seed 0;
const inv2 = new Inversion();

// reference to uniform PRNG under rng property
inv2.rng.init(0);

// bleed the normal PRNG
const in2 = inv2.norm_rand(5);
precision(in2);
//[ 1.26295428, -0.326233361, 1.32979926, 1.27242932, 0.414641434 ]

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

Example usage:

```javascript
const libR = require('lib-r-math.js');
const {
    rng: {
        SuperDuper,
        normal: { KindermanRamage }
    },
    R: { numberPrecision }
} = libR;

//helper
const precision = numberPrecision(9);

const sd = new SuperDuper(0);
const km1 = new KindermanRamage(sd);

// At any time reset normal PRNG seed, with the reference to uniform PRNG
sd.init(1234);
km1.rng.init(1234); // same as above

// uses default uniform PRNG MersenneTwister with seed "0"
const km2 = new KindermanRamage();

km2.rng.init(0); // at any time reset PRNG with a new seed.

// bleed the normal PRNG
const k2 = km2.norm_rand(5);
precision(k2);
//[ 0.3216151, 1.23251561, 0.280369528, -1.17519641, -1.60471361 ]

// it's possible to bleed the uniform PRNG from the normal PRNG
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

## Normal and Uniform distributions

#### Summary

In the Section [1](#uniform-pseudo-random-number-generators)
and [2](#normal-distributed-random-number-generators)
we discussed uniform and normal PRNG classes. These classes can be used by themselves but mostly intended to be consumed to generate
random numbers with a particular distribution (like `Uniform`, `Normal`, `Gamma`,
`Weibull`, `Chi-square` etc).

### Uniform distribution

`dunif, qunif, punif, runif`

See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Uniform.html)

These functions are created with the factory method `Uniform` taking as argument a uniform PRNG. Defaults to [Mersenne-Twister](#mersenne-twister).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Uniform,
    rng: { SuperDuper }
} = libR;

//Create Uniform family of functions using "SuperDuper"
const uni1 = Uniform(new SuperDuper(0));

// Create Uniform family of functions using default "Mersenne-Twister"
const uni2 = Uniform();

// functions exactly named as in `R`
const { runif, dunif, punif, qunif } = uni2;
```

#### `dunif`

The density function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/uniform.html)

_typescript decl_

```typescript
declare function dunif(
  x: number | number[],
  min = 0,
  max = 1,
  asLog = false
): number | number[];
```

* `x`: scalar or vector of quantiles
* `min, max` lower and upper limits of the distribution. Must be finite.
* `asLog` if `true`, results are given as ln.

Example:

```javascript
const libR = require('lib-r-math.js');
const {
    Uniform,
    R: { numberPrecision, c }
} = libR;

//helper
const precision = numberPrecision(9);

const { runif, dunif, punif, qunif } = Uniform();

const x = [-1, 0, 0.4, 1, 2];

const d0 = dunif(0.5);
//1

const d1 = dunif(x);
// [ 0, 1, 1, 1, 0 ]  Everythin is 1 for inputs between 0 and 1

const d2 = dunif(x, 0, 2);
// [ 0, 0.5, 0.5, 0.5, 0.5 ]

const d3 = dunif(x, 0, 2, true);
precision(d3);
//[ -Infinity,  -0.693147181, -0.693147181, -0.693147181, -0.693147181 ]
```

#### `punif`

The probability function. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/uniform.html)

_typescript decl_

```typescript
declare function punif(
  q: number | number[],
  min = 0,
  max = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `x`: scalar or vector of quantiles
* `min, max`: lower and upper limits of the distribution. Must be finite.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if `true`, probabilities p are given as ln(p).

Example:

```javascript
const libR = require('lib-r-math.js');
const {
    Uniform,
    R: { numberPrecision }
} = libR; // use default Mersenne-Twister PRNG

//helper
const precision = numberPrecision(9);

const { runif, dunif, punif, qunif } = Uniform();

const q = [-2, 0.25, 0.75, 2];

const p1 = punif(0.25);
// 0.25

const p2 = punif(q);
//[ 0, 0.25, 0.75, 1 ]

const p3 = punif(q, 0, 1, false);
precision(p3);
//[ 1, 0.75, 0.25, 0 ]

const p4 = punif(q, 0, 2, false, true);
precision(p4);
//[ 0, -0.133531393, -0.470003629, -Infinity ]

const p5 = punif(q, 0, 2, true, true);
precision(p5);
//[ 0, -0.133531393, -0.470003629, -Infinity ]
```

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

* `p`: scalar or vector of quantiles
* `min, max` lower and upper limits of the distribution. Must be finite.
* `lowerTail` if `true` (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP` if `true`, probabilities p are given as ln(p).

Example:

```javascript
const libR = require('lib-r-math.js');
const {
    Uniform,
    R: { numberPrecision, multiplex }
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

* `n`: number of deviates. Defaults to 1.
* `min, max` lower and upper limits of the distribution. Must be finite.

Example:

```javascript
const libR = require('lib-r-math.js');

const {
    Uniform,
    rng: { LecuyerCMRG },
    R: { numberPrecision }
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
const libR = require('lib-r-math.js');
const {
    Normal,
    rng: {
        SuperDuper,
        normal: { AhrensDieter }
    }
} = libR;

//specify explicit PRNG's
const norm1 = Normal(new AhrensDieter(new SuperDuper(1234)));

//OR just go with defaults: "Inversion" and "Mersenne-Twister".
const norm2 = Normal(); //

//strip and use
const { rnorm, dnorm, pnorm, qnorm } = norm2;
```

#### `dnorm`

The density function of the [Normal distribution](https://en.wikipedia.org/wiki/Normal_distribution). See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html)

_typescript decl_

```typescript
declare function dnorm(
  x: number | number[],
  mu = 0,
  sigma = 1,
  asLog = false
): number | number[];
```

* `x`:scalar or array of quantiles
* `mu`: mean, default `0`.
* `sigma`: standard deviation, default `1`.
* `asLog`: give result as ln(..) value

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Normal,
    R: {
        numberPrecision,
        seq: _seq,
        c
    }
} = libR;

//helpers
const seq = _seq()();
const _9 = numberPrecision(9); //9 digits significance

const { rnorm, dnorm, pnorm, qnorm } = Normal();

const d1 = _9(dnorm(0));
//0.39894228

//x=3, µ=4, sd=2
const d2 = _9(dnorm(3, 4, 2));
//0.176032663

const d3 = _9(dnorm(-10));
//7.69459863e-23

//feed it also some *non-numeric*
const x = c(-Infinity, Infinity, NaN, seq(-4, 4));
const d4 = _9(dnorm(x));
/*[
  0,
  0,
  NaN,
  0.000133830226,
  0.00443184841,
  0.0539909665,
  0.241970725,
  0.39894228,
  0.241970725,
  0.0539909665,
  0.00443184841,
  0.000133830226 ]*/

const d5 = _9(dnorm(x, 0, 1, true));
/*[ -Infinity,
    -Infinity,
    NaN,
    -8.91893853,
    -5.41893853,
    -2.91893853,
    -1.41893853,
    -0.918938533,
    -1.41893853,
    -2.91893853,
    -5.41893853,
    -8.91893853 ]*/
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

#### `pnorm`

The distribution function of the [Normal distribution](https://en.wikipedia.org/wiki/Normal_distribution). See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html)

_typescript decl_

```typescript
declare function pnorm(
  q: number | number[],
  mu = 0,
  sigma = 1,
  lowerTail = true,
  logP = false
): number | number[];
```

* `q`:scalar or array of quantiles
* `mu`: mean (default 0)
* `sigma`: standard deviation (default 1)
* `lowerTail`: if `true` (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: give result as log value

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Normal,
    R: { numberPrecision, multiplex, seq: _seq }
} = libR;

const { rnorm, dnorm, pnorm, qnorm } = Normal();

// some helpers
const seq = _seq()();
const _9 = numberPrecision(9); //9 digit significance

//data
const q = seq(-1, 1);

const p1 = _9(pnorm(q));
//[ 0.158655254, 0.5, 0.841344746 ]

const p2 = _9(pnorm(q, 0, 1, false));
//[ 0.841344746, 0.5, 0.158655254 ]

const p3 = _9(pnorm(q, 0, 1, false, true));
//[ -0.172753779, -0.693147181, -1.84102165 ]
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

#### `qnorm`

The quantile function of the [Normal distribution](https://en.wikipedia.org/wiki/Normal_distribution). See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html])

_typescript decl_

```typescript
declare function qnorm(
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
* `logP`: probabilities are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Normal,
    R: { multiplex, seq: _seq, numberPrecision }
} = libR;

//some helpers
const log = multiplex(Math.log);
const _9 = numberPrecision(9);
const seq = _seq()();

const { rnorm, dnorm, pnorm, qnorm } = Normal();

//some data
const p = seq(0, 1, 0.25);
//[0, 0.25, 0.5, 0.75, 1]

const q1 = _9(qnorm(0));
//-Infinity

const q2 = _9(qnorm(p, 0, 2));
//[ -Infinity, -1.3489795, 0, 1.3489795, Infinity ]

const q3 = _9(qnorm(p, 0, 2, false));
//[ Infinity, 1.3489795, 0, -1.3489795, -Infinity ]

//same as q3
const q4 = _9(qnorm(log(p), 0, 2, false, true));
//[ Infinity, 1.3489795, 0, -1.3489795, -Infinity ]
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

#### `rnorm`

Generates random normal deviates. See [R doc](http://stat.ethz.ch/r-manual/r-patched/library/stats/html/normal.html])

_typescript decl_

```typescript
declare function rnorm(n = 1, mu = 0, sigma = 1): number | number[];
```

* `n`: number of deviates
* `mu`: mean of the distribution. Defaults to 0.
* `sigma`: standard deviation. Defaults to 1.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Normal,
    R: { numberPrecision }
} = libR;

//helper
const _9 = numberPrecision(9); // 9 digits

//default Mersenne-Twister/Inversion
const { rnorm, dnorm, pnorm, qnorm } = Normal();

const r1 = _9(rnorm(5));
//[ 1.26295428, -0.326233361, 1.32979926, 1.27242932, 0.414641434 ]

const r2 = _9(rnorm(5, 2, 3));
//[ -2.61985013, -0.785701104, 1.11583866, 1.98269848, 9.21396017 ]
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

## Other Probability Distributions

#### summary

`libRmath.so` contains 19 probability distributions (other then `Normal` and `Uniform`) with their specific density, quantile and random generators, all are ported and have been verified to yield the same output.

### Beta distribution

`dbeta, qbeta, pbeta, rbeta`

See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).
See [wiki](https://en.wikipedia.org/wiki/Beta_distribution).

These functions are members of an object created by the `Beta` factory method. The factory method needs an instance of an optional [normal PRNG](#normal-distributed-random-number-generators). Various instantiation methods are given below.

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Beta, rng: { SuperDuper, normal: { BoxMuller } } } = libR;

// explicit use of PRNG's
const explicitB = Beta(new BoxMuller(new SuperDuper(0))); //

// go with defaults 'MersenneTwister" and "Inversion"
const defaultB = Beta();

// Or just go with Default.. defaults to PRNG "Inversion" and "Mersenne-Twister"
const { dbeta, pbeta, qbeta, rbeta } = defaultB;
```

#### `dbeta`

The density function of the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution).
See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).

$$ \frac{\Gamma(a+b)}{Γ(a) Γ(b)} x^{(a-1)}(1-x)^{(b-1)} $$

_typescript decl_

```typescript
declare function dbeta(
  x: number | number[],
  shape1: number,
  shape2: number,
  ncp = undefined,
  asLog = false
): number | number[];
```

* `x`: scalar or array of quantiles. 0 <= x <= 1
* `shape1`: non-negative `a` parameter of the Beta distribution.
* `shape2`: non-negative `b` parameter of the Beta distribution.
* `ncp`: non centrality parameter. _Note: `undefined` is different then `0`_
* `asLog`: return result as ln(p)

```javascript
const libR = require('lib-r-math.js');
const { Beta, R: { numberPrecision } } = libR;

//helpers, 9 digits precision
const _9 = numberPrecision(9);

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const { dbeta, pbeta, qbeta, rbeta } = Beta();

//1. ncp argument = 1
const d1 = _9(dbeta(0.4, 2, 2, 1));
//1.28724574

//2., No named arguments in JS, so use undefined to skip
const d2 = _9(dbeta(0.4, 2, 2, undefined, true));
//0.364643114

//3
const d3 = _9(dbeta(0.4, 2, 2, 1, true));
//0.252504851

//4
const d4 = _9(
    dbeta(
        [0, 0.2, 0.4, 0.8, 1, 1.2],
        2,
        2)
);
//[ 0, 0.96, 1.44, 0.96, 0, 0 ]
```

_Equivalent in R_

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
dbeta( c(0, 0.2, 0.4, 0.8, 1, 1.2), 2, 2)
#[1] 0.00 0.96 1.44 0.96 0.00 0.00
```

#### `pbeta`

The cumulative probability function of the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).

```typescript
declare function pbeta(
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
* `logP`: return probabilities as ln(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Beta,
    R: { multiplex, numberPrecision, seq: _seq }
} = libR;

//helpers
// 9 digit precision
const _9 = numberPrecision(9);
const log = multiplex(Math.log);
const seq = _seq()();

//just go with Default.. uses Normal(), defaults to PRNG "Inversion" and "Mersenne-Twister"
const { dbeta, pbeta, qbeta, rbeta } = Beta();
const q = seq(0, 1, 0.2);

//1.
const p1 = _9(pbeta(0.5, 2, 5));
//0.890625

//2.
const p2 = _9(pbeta(0.5, 2, 5, 4));
//0.63923843

//3.
const p3 = _9(pbeta(q, 2, 5, 4));
//[ 0, 0.106517718, 0.438150345, 0.813539396, 0.986024517, 1 ]

//4.
const p4 = _9(pbeta(q, 2, 5, undefined));
//[ 0, 0.345027474, 0.76672, 0.95904, 0.9984, 1 ]

//5. result as as ln(p)
const p5 = _9(pbeta(q, 2, 5, undefined, true, true));
/*[
  -Infinity,     -1.06413123,    -0.265633603,
  -0.0418224949, -0.00160128137,  0
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
pbeta(q, 2, 5, log.p=TRUE)
#[1]         -Inf -1.065254885 -0.265633603
#[4] -0.041822495 -0.001601281  0.000000000
```

#### `qbeta`

The quantile function of the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).

_typescript decl_

```typescript
declare function qbeta(
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
* `logP`: return _probabilities_ as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Beta, R: { multiplex, numberPrecision } } = libR;

//helpers
const ln = multiplex(Math.log);
const _9 = numberPrecision(9); // 9 digits precision

const { dbeta, pbeta, qbeta, rbeta } = Beta();

//take probabilities in steps of 25%
const p = [0, 0.25, 0.5, 0.75, 1];

//1. always zero, regardless of shape params, because 0 ≤ x ≤ 1.
const q1 = _9(qbeta(0, 99, 66));
//0

//2. 
const q2 = _9(qbeta(p, 4, 5));
//[ 0, 0.329083427, 0.440155205, 0.555486315, 1 ]

//3 ncp = 3
const q3 = _9(qbeta(p, 4, 5, 3));
//[ 0, 0.406861514, 0.521344641, 0.631881288, 1 ]

//4. ncp = undefined, lowerTail = false, logP=false(default)
const q4 = _9(qbeta(p, 4, 5, undefined, false)); //
//[ 1, 0.555486315, 0.440155205, 0.329083427, 0 ]

//5. same as [5] but, logP=true,
const q5 = _9(qbeta(
    ln(p),
    4,
    5,
    undefined,
    false,
    true //p as ln(p)
));
//[ 1, 0.555486315, 0.440155205, 0.329083427, 0 ]
```

_Equivalent in R_

```R
p = c(0,.25,.5,.75,1);
#1
qbeta(0,99,66);
#[1] 0

#2
qbeta(p, 4,5);
#[1] 0.0000000 0.3290834 0.4401552 0.5554863 1.0000000

#3
qbeta(p, 4,5,3);
#[1] 0.0000000 0.4068615 0.5213446 0.6318813 1.0000000

#4
qbeta(p, 4,5, lower.tail = FALSE);
#[1] 1.0000000 0.5554863 0.4401552 0.3290834
#[5] 0.0000000

#5
qbeta(  log(p)  ,4,5, lower.tail = FALSE, log.p=TRUE);
#[1] 1.0000000 0.5554863 0.4401552 0.3290834 0.0000000
```

#### `rbeta`

Generates random deviates for the [Beta distribution](https://en.wikipedia.org/wiki/Beta_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Beta.html).

_typescript decl_

```typescript
declare function rbeta(
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
    rng: {
        LecuyerCMRG,
        normal: { Inversion }
    },
    R: { multiplex, numberPrecision }
} = libR;

//helpers
const ln = multiplex(Math.log); //
const _9 = numberPrecision(9);

const lc = new LecuyerCMRG(0);
const { dbeta, pbeta, qbeta, rbeta } = Beta(new Inversion(lc));

//1.
const r1 = _9(rbeta(5, 0.5, 0.5));
//[ 0.800583949,  0.962961579, 0.700710737,  0.169742664, 0.0169845581 ]

//2.
const r2 = _9(rbeta(5, 2, 2, 4));
//[ 0.940977213, 0.803938008, 0.762066155, 0.775315234, 0.0395894783 ]

//3. // re-initialize seed
lc.init(0);

//3
const r3 = _9(rbeta(5, 2, 2));
//[ 0.37955891, 0.240142694, 0.425371111, 0.935280271, 0.636741506 ]

//4.
const r4 = _9(rbeta(5, 2, 2, 5));
//[ 0.532034853, 0.985042931, 0.724819159, 0.67645358, 0.837372377 ]
```

Same values as in R

_Equivalent in R_

```R
RNGkind("L'Ecuyer-CMRG", normal.kind ="Inversion")
set.seed(0)

#1
rbeta(5, 0.5, 0.5)
#[1] 0.80058395 0.96296158 0.70071074 0.16974266 0.01698456

#2
rbeta(5, 2, 2, 4)
#[1] 0.94097721 0.80393801 0.76206615 0.77531523 0.03958948

set.seed(0)
#3
rbeta(5, 2, 2);
#[1] 0.3795589 0.2401427 0.4253711 0.9352803 0.6367415

#4
rbeta(5, 2, 2, 5);
#[1] 0.5320349 0.9850429 0.7248192 0.6764536 0.8373724
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

_typescript decl_

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
* `asLog`: return result as ln(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Binomial,
    R: { numberPrecision, seq: _seq }
} = libR;

//helper, 9 digits precision
const _9 = numberPrecision(9);
const seq = _seq()();

//some data
const x = seq(1, 4);

//Binomial()  uses Normal() as default argument,
const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//1. 2 successes out of 4 trials, with success probility 0.3
const d1 = _9(dbinom(2, 4, 0.3));
//0.2646

//2. same as [1], but results as log
const d2 = _9(dbinom(2, 4, 0.3, true));
//-1.32953603

//3. all possibilities out of 4 trials
const d3 = _9(dbinom(x, 4, 0.3));
//[ 0.4116, 0.2646, 0.0756, 0.0081 ]

//4
const d4 = _9(dbinom(x, 4, 0.3, true));
//[ -0.887703275, -1.32953603, -2.582299, -4.81589122 ]
```

_Equivalent in R_

```R
#1
dbinom(2,4,0.3)
#[1] 0.2646

#2
dbinom(2,4,0.3, TRUE)
#[1] -1.329536

#3
dbinom(c(1,2,3,4),4,0.3)
#[1] 0.4116 0.2646 0.0756 0.0081

#4
dbinom(c(1,2,3,4),4,0.3, TRUE)
#[1] -0.8877033 -1.3295360 -2.5822990  -4.8158912
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
* `logP`: return result as ln(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Binomial,
    R: { numberPrecision, seq: _seq }
} = libR;

//helper, 9 digits precision
const _9 = numberPrecision(9);
const seq = _seq()();

const { dbinom, pbinom, qbinom, rbinom } = Binomial();
//some data

const q = seq(0, 4);
//1.
const p1 = pbinom(4, 4, 0.5);
//1

//2.
const p2 = _9(pbinom(q, 4, 0.5));
//[ 0.0625, 0.3125, 0.6875, 0.9375, 1 ]

//4.
const p3 = _9(pbinom(q, 4, 0.5, false, true));
/*[ -0.0645385211,  -0.374693449,  -1.16315081,  -2.77258872,  -Infinity
]*/
```

_Equivalent in R_

```R
q = c(0, 1, 2, 3, 4);
#1
pbinom(4, 4, 0.5)
#[1] 1

#2
pbinom(q, 4, 0.5)
#[1] 0.0625 0.3125 0.6875 0.9375 1.0000

#3
pbinom(q, 4, 0.5, FALSE, TRUE)
#[1] -0.06453852 -0.37469345 -1.16315081
#[4] -2.77258872        -Inf
```

#### `qbinom`

The quantile function of the [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Binomial.html)

_typescript decl_

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
* `LogP`: return result as ln(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Binomial,
    R: { multiplex, numberPrecision, seq: _seq }
} = libR;

//helpers
const _9 = numberPrecision(9);
const log = multiplex(Math.log);
const seq = _seq()();

const { dbinom, pbinom, qbinom, rbinom } = Binomial();

//data
const p = seq(0, 1, 0.25); //[0, 0.25, 0.5, 0.75, 1];

//1
const q1 = _9(qbinom(0.25, 4, 0.3));
//1

//2.
const q2 = _9(qbinom(p, 40, 0.3));
//[0 10 12 14 40]

//3.
const q3 = _9(qbinom(p, 40, 0.3, false));
//[ 40, 14, 12, 10, 0 ]

//4.  same as 3.
const q4 = _9(qbinom(log(p), 40, 0.3, false, true));
//[ 40, 14, 12, 10, 0 ]
```

_Equivalent in R_

```R
p = seq(0,1,0.25); #c(0, 0.25, 0.5, 0.75, 1);

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

_typescript decl_

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

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Binomial,
    rng: { KnuthTAOCP2002 }
} = libR;

const kn = new KnuthTAOCP2002(1234);
const { dbinom, pbinom, qbinom, rbinom } = Binomial(kn);

//1.
const r1 = rbinom(2, 40, 0.5);
//[ 24, 19 ]

//2.
const r2 = rbinom(3, 20, 0.5);
//[ 11, 13, 13 ]

//3.
const r3 = rbinom(2, 10, 0.25);
//[ 2, 2 ]
```

_Equivalent in R_

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
See [wiki](https://en.wikipedia.org/wiki/Negative_binomial_distribution)

These functions are members of an object created by the `NegativeBinomial` factory method. This factory method needs an instance of a [normal PRNG](#normal-distributed-random-number-generators). Various instantiation methods are given below.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    NegativeBinomial,
    rng: {
        SuperDuper,
        normal: { BoxMuller }
    }
} = libR;

//explicit use PRNG's
const bm = new BoxMuller(new SuperDuper(0));
const explicitNB = NegativeBinomial(bm);

//default uses PRNG "Inverion" and "MersenneTwister"
const defaultNB = NegativeBinomial();

const { dnbinom, pnbinom, qnbinom, rnbinom } = defaultNB;
```

#### `dnbinom`

The density function of the [Negative Binomial distribution](https://en.wikipedia.org/wiki/Negative_binomial_distribution).

$$ \frac{Γ(x+n)}{Γ(n) x!} p^{n} (1-p)^{x} $$

See [R doc]
(https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).

_typescript decl_

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
* `asLog`: if `true`, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    NegativeBinomial,
    R: { seq: _seq, numberPrecision }
} = libR;

//some helpers
const seq = _seq()();
const _9 = numberPrecision(9);

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

//some data
const x = seq(0, 10, 2);

//1.
const d1 = _9(dnbinom(x, 3, 0.5));
//[ 0.125, 0.1875, 0.1171875, 0.0546875, 0.0219726562, 0.00805664062 ]

//2. alternative presentation with `mu` = n*(1-p)/p
const d2 = _9(dnbinom(x, 3, undefined, 3 * (1 - 0.5) / 0.5));
//[ 0.125, 0.1875, 0.1171875, 0.0546875, 0.0219726562, 0.00805664062 ]

//3
const d3 = _9(dnbinom(x, 3, undefined, 3 * (1 - 0.5) / 0.5, true));
/*[ -2.07944154, -1.67397643,  -2.14398006, -2.90612011,
    -3.8179565,  -4.82125861
]*/
```

_Equivalent in R_

```R
#1
dnbinom(0:10, size = 3, prob = 0.5);
# [1] 0.125000000 0.187500000 0.187500000 0.156250000 0.117187500 0.082031250
# [7] 0.054687500 0.035156250 0.021972656 0.013427734 0.008056641

#2
dnbinom(0:10, size = 3, mu = 3*(1-0.5)/0.5);
# [1] 0.125000000 0.187500000 0.187500000 0.156250000 0.117187500 0.082031250
# [7] 0.054687500 0.035156250 0.021972656 0.013427734 0.008056641

dnbinom(0:10, size = 3, mu = 3*(1-0.5)/0.5, log=T);
# [1] -2.079442 -1.673976 -1.673976 -1.856298 -2.143980 -2.500655 -2.906120
# [8] -3.347953 -3.817956 -4.310433 -4.821259
```

#### `pnbinom`

The gives the cumulative probability function of the [Negative Binomial distribution](https://en.wikipedia.org/wiki/Negative_binomial_distribution).
See [R doc](https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).

_typescript decl_

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
* `logP`: if `true`, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    NegativeBinomial,
    R: { numberPrecision, seq: _seq, c }
} = libR;

//some helpers
const seq = _seq()();
const _9 = numberPrecision(9);

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

//some data
const x = c(seq(0, 6), Infinity);
//[ 0, 1, 2, 3, 4, 5, 6, Infinity ]

//1.
const p1 = _9(pnbinom(x, 3, 0.5));
//[ 0.125, 0.3125, 0.5, 0.65625, 0.7734375, 0.85546875, 0.91015625, 1 ]

//2. alternative presentation of 1 with mu = n(1-p)/p
const p2 = _9(pnbinom(x, 3, undefined, 3 * (1 - 0.5) / 0.5));
//[ 0.125, 0.3125, 0.5, 0.65625, 0.7734375, 0.85546875, 0.91015625, 1 ]

//3
const p3 = _9(pnbinom(x, 3, 0.5, undefined, false));
//[ 0.875, 0.6875, 0.5, 0.34375, 0.2265625, 0.14453125, 0.08984375, 0 ]

//4
const p4 = _9(pnbinom(x, 3, 0.5, undefined, false, true));
/*[ 
  -0.133531393,  -0.374693449,  -0.693147181,  -1.06784063,  -1.48473443,  -1.93425953,
  -2.40968323,   -Infinity ]
*/
```

_Equivalent in R_

```R
x = c(seq(0, 6), Inf);

#1
pnbinom(x, 3, 0.5)
#[1] 0.1250000 0.3125000 0.5000000 0.6562500 0.7734375 0.8554688 0.9101562
#[8] 1.0000000

#2
pnbinom(x, size=3, mu=3*(1-0.5)/0.5)
#[1] 0.87500000 0.68750000 0.50000000 0.34375000 0.22656250 0.14453125 0.08984375
#[8] 0.00000000

#3
pnbinom(x, size=3, prob=0.5, lower.tail=FALSE);
#[1] 0.87500000 0.68750000 0.50000000 0.34375000 0.22656250 0.14453125 0.08984375
#[8] 0.00000000

#4
pnbinom(x, size=3, prob=0.5, lower.tail=FALSE, log.p=TRUE);
#[1] -0.1335314 -0.3746934 -0.6931472 -1.0678406 -1.4847344 -1.9342595 -2.4096832
#[8]       -Inf
```

#### `qnbinom`

The quantile function of the
[Negative Binomial distribution]
(https://en.wikipedia.org/wiki/Negative_binomial_distribution).
See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).

_typescript decl_

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
* `logP`: if `true`, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    NegativeBinomial,
    R: { numberPrecision, seq: _seq, multiplex }
} = libR;

//some helpers
const _9 = numberPrecision(9);
const log = multiplex(Math.log);
const seq = _seq()();

const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial();

//some data
const p = seq(0, 1, 0.2);
//[ 0, 0.2, 0.4, 0.6, 0.8, 1 ]

//1. inversion
const q1 = _9(qnbinom(p, 3, 0.5));
//[ 0, 1, 2, 3, 5, Infinity ]

//2. lowerTail=false
const q2 = _9(qnbinom(p, 3, 0.5, undefined, false));
//[ Infinity, 5, 3, 2, 1, 0 ]

//3. with logP=true, get your input sequence back
const q3 = _9(qnbinom(log(p), 3, 0.5, undefined, false, true));
//[ Infinity, 5, 3, 2, 1, 0 ]
```

_Equivalent in R_

```R
p = seq(0, 1, 0.2);

#1
qnbinom(p, 3, 0.5);
#[1] 0 1 2 3 5  Inf

#2
qnbinom(p, 3, 0.5, lower.tail = FALSE);
#[1] Inf  5  3  2  1  0

#3
qnbinom(log(p),3,0.5, lower.tail = FALSE, log.p = TRUE);
#[1] Inf 5 3 2 1 0
```

#### `rnbinom`

Generates random deviates for the
[Negative binomial distribution]
(https://en.wikipedia.org/wiki/Negative_binomial_distribution).
See [R doc](https: //stat.ethz.ch/R-manual/R-devel/library/stats/html/NegBinomial.html).

_typescript decl_

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
const libR = require('lib-r-math.js');
const {
    NegativeBinomial,
    rng: { SuperDuper, normal: { BoxMuller } }
} = libR;

//explicit use of RNG
const bm = new BoxMuller(new SuperDuper(12345));
const { dnbinom, pnbinom, qnbinom, rnbinom } = NegativeBinomial(bm);

//1
const r1 = rnbinom(7, 100, 0.5);
//[ 94, 81, 116, 101, 71, 112, 85 ]

//2. 
const r2 = rnbinom(7, 100, 0.1);
//[ 889, 747, 1215, 912, 1105, 993, 862 ]

//3.
const r3 = rnbinom(7, 100, 0.9);
//[ 9, 14, 12, 18, 15, 14, 7 ]

//4
bm.rng.init(98765); //set new seed
const r4 = rnbinom(7, 100, undefined, 100 * (1 - 0.5) / 0.5);
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

_typescript decl_

```typescript
declare function dcauchy(
  x: number | number[],
  location = 0,
  scale = 1,
  asLog = false
): number | number[];
```

* `x`: scalar or array of quantile(s).
* `location`: the location parameter, default 0.
* `scale`: the scale parameter, default 1.
* `asLog`: return values as ln(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Cauchy,
    R: { numberPrecision, seq: _seq }
} = libR;

// some usefull tools
const seq = _seq()();
const _9 = numberPrecision(9);

// initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();

//data
const x = seq(-4, 4, 2);

//1.
const d1 = _9(dcauchy(x, -2, 0.5));
/*[
  0.0374482219,  0.636619772,  0.0374482219,
  0.00979415034,  0.00439048119 ]*/

//2.
const d2 = _9(dcauchy(x, -2, 0.5, true));
/*[
  -3.28479605,  -0.451582705,  -3.28479605,
  -4.62596998,  -5.42831645 ]*/

//3.
const d3 = _9(dcauchy(x, 0, 2));
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

_typescript decl_

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
* `location`: The location parameter, default 0.
* `scale`: The scale parameter, default 1.
* `lowerTail`: If TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: If TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Cauchy, R: { numberPrecision } } = libR;

// some usefull tools
const seq = libR.R.seq()();
const _9 = numberPrecision(9);

// initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();

//data
const x = seq(-4, 4, 2);

//1
const p1 = _9(pcauchy(x, -2, 0.5));
//[ 0.0779791304, 0.5, 0.92202087, 0.960416576, 0.973535324 ]

//2.
const p2 = _9(pcauchy(x, -2, 0.5, true, true));
/*[ -2.55131405,  -0.693147181,  -0.0811874205, -0.0403881555,-0.0268211693 ]*/

//3.
const p3 = _9(pcauchy(x, 0, 2));
//[ 0.147583618, 0.25, 0.5, 0.75, 0.852416382 ]
```

_Equivalent in R_

```R
x=seq(-4,4,2)

#1
pcauchy(x, location=-2, scale=0.5);
#[1] 0.07797913 0.50000000 0.92202087 0.96041658 0.97353532

#2
pcauchy(x, location=-2, scale=0.5, log=TRUE);
#[1] -2.55131405 -0.69314718 -0.08118742 -0.04038816 -0.02682117

#3
pcauchy(x, location=0, scale=2);
#[1] 0.1475836 0.2500000 0.5000000 0.7500000 0.8524164
```

#### `qcauchy`

The quantile function of the [Cauchy distribution](https://en.wikipedia.org/wiki/Cauchy_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html).

_typescript decl_

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
* `location`: The location parameter, default 0.
* `scale`: The scale parameter, default 1.
* `lowerTail`: If TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: If TRUE, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Cauchy, R: { numberPrecision, seq: _seq } } = libR;

//some usefull tools
const seq = _seq()();
const _9 = numberPrecision(9);

//initialize
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy();

//data
const x = seq(0, 1, 0.2);

//1
const q1 = _9(qcauchy(x, -2, 0.5));
//[ -Infinity, -2.68819096, -2.16245985, -1.83754015, -1.31180904, Infinity ]

//2.
const q2 = _9(qcauchy(x, -2, 0.5, false));
//[ Infinity, -1.31180904, -1.83754015, -2.16245985, -2.68819096, -Infinity ]

//3.
const q3 = _9(qcauchy(x, 0, 2));
//[ -Infinity, -2.75276384, -0.649839392, 0.649839392, 2.75276384, Infinity ]
```

_Equivalent in R_

```R
x = seq(0, 1, 0.2);
#[1] 0.0 0.2 0.4 0.6 0.8 1.0

#1
qcauchy(x, -2, 0.5);
#[1]      -Inf -2.688191 -2.162460 -1.837540 -1.311809       Inf

#2
qcauchy(x, -2,  0.5, lower.tail=FALSE)
#[1]       Inf -1.311809 -1.837540 -2.162460 -2.688191      -Inf

#3
qcauchy(x, 0, 2);
#[1]       -Inf -2.7527638 -0.6498394  0.6498394  2.7527638        Inf
```

#### `rcauchy`

Generates random deviates from the [Cauchy distribution](https://en.wikipedia.org/wiki/Cauchy_distribution). See [R doc](http://stat.ethz.ch/R-manual/R-devel/library/stats/html/Cauchy.html).

_typescript decl_

```typescript
declare function rcauchy(
  n: number,
  location = 0,
  scale = 1
): number | number[];
```

* `n`: number of deviates to generate.
* `location`: The location parameter, default 0.
* `scale`: The scale parameter, default 1.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Cauchy,
    rng: { SuperDuper },
    R: { numberPrecision }
} = libR;

// helpers
const _9 = numberPrecision(9);

//initialize Cauchy
const sd = new SuperDuper();
const { dcauchy, pcauchy, qcauchy, rcauchy } = Cauchy(sd);

//1.
sd.init(43210);
const r1 = _9(rcauchy(5, 0, 0.5));
//[ 0.0472614703, 0.577704013, 6.76536712, -0.0360997453, 0.719042522 ]

//2.
const r2 = _9(rcauchy(5, 2, 2));
//[ 3.19844084, 3.28147192, 1.24543133, 2.04599347, 3.5392328 ]

//3.
sd.init(9876);
const r3 = _9(rcauchy(5, -2, 0.25));
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

_typescript decl_

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
* `ncp`: non centrality parameter, default undefined.
* `asLog`: return probabilities as ln(p), default false.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    ChiSquared,
    R: {
        numberPrecision,
        seq: _seq
    }
} = libR;

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

//helpers
const seq = _seq()();
const _9 = numberPrecision(9);

//data
const x = seq(0, 10, 2);
//[ 0, 2, 4, 6, 8, 10 ]

//1. df=5
const d1 = _9(dchisq(x, 5));
/*[
  0,            0.138369166,  0.143975911,  0.0973043467,  0.0551119609, 
  0.0283345553 ]*/

//2. df=3, ncp=4
const d2 = _9(dchisq(x, 3, 4));
/*[
  0,            0.0837176564,  0.0997021125,  0.0901474176,
  0.070764993,  0.0507582667 ]*/

//3. df=3, ncp=4, log=true
const d3 = _9(dchisq(x, 3, 4, true));
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

_typescript decl_

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
* `logP`: return probabilities as ln(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    ChiSquared,
    R: { numberPrecision, seq: _seq, c }
} = libR;

//helpers
const _9 = numberPrecision(9);
const seq = _seq()();

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

const q = c(seq(0, 10, 2), Infinity);
//[ 0, 2, 4, 6, 8, 10, Infinity ]

//1.
const p1 = _9(pchisq(q, 3));
/*[
  0,            0.427593296,  0.73853587,  0.888389775,
  0.953988294,  0.981433865,  1 ]*/

//2. df=8, ncp=4, lowerTail=false
const p2 = _9(pchisq(q, 8, 4, false));
/*[ 1,            0.996262804,   0.96100264,  0.872268946,
    0.739243049,  0.587302859    0 ]*/

//3. df=8, ncp=4, lowerTail=true, logP=true
const p3 = _9(pchisq(q, 8, 4, true, true));
/*[
  -Infinity,  -5.58941966,  -3.24426132,
  -2.05782837,-1.34416653,  -0.885041269 ]*/
```

_Equivalent in R_

```R
q = c(seq(0, 10, 2), Inf);

#1
pchisq(q, 3);
#[1] 0.0000000 0.4275933 0.7385359 0.8883898 0.9814339 1.0000000

#2
pchisq(q, 8, 4, lower.tail=FALSE);
#[1] 1.0000000 0.9962628 0.9610026 0.8722689 0.5873029 0.0000000

#3
pchisq(q, 8, 4, lower.tail=TRUE, log.p=TRUE);
#[1]  -Inf -5.5894197 -3.2442613 -2.0578284 -1.3441665 -0.8850413  0.0000000
```

#### `qchisq`

The [X<sup>2</sup>](https://en.wikipedia.org/wiki/Chi-squared_distribution) quantile function, see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

_typescript decl_

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
* `logP`: probabilities are as ln(p)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    ChiSquared,
    R: { multiplex, numberPrecision, seq: _seq }
} = libR;

//helpers
const seq = _seq()();
const log = multiplex(Math.log);
const _9 = numberPrecision(9);

const { dchisq, pchisq, qchisq, rchisq } = ChiSquared();

// data
const p = seq(0, 1, 0.2);

//1. df=3,
const q1 = _9(qchisq(p, 3));
//[ 0, 1.00517401, 1.8691684, 2.94616607, 4.64162768, Infinity ]

//2. df=3, ncp=undefined, lowerTail=false
const q2 = _9(qchisq(p, 50, undefined, false));
//[ Infinity, 58.1637966, 51.8915839, 46.8637762, 41.4492107, 0 ]

//3. df=50, ncp=0, lowerTail=false, logP=true
const q3 = _9(qchisq(log(p), 50, 0, false, true));
//[ Infinity, 58.1637966, 51.8915839, 46.8637762, 41.4492107, 0 ]
```

_Equivalence in R_

```R
#R-script
#data
p=seq(0, 1, 0.2);

#1
qchisq(p, 3);
#[1] 0.000000 1.005174 1.869168 2.946166 4.641628      Inf

#2
qchisq(p, 50, lower.tail=FALSE);
#[1]      Inf 58.16380 51.89158 46.86378 41.44921  0.00000

#3
qchisq(log(p), 50, 0, lower.tail=FALSE, log.p=TRUE);
#[1]      Inf 58.16380 51.89158 46.86378 41.44921  0.00000
```

#### `rchisq`

Creates random deviates for the [X<sup>2</sup> distribution](https://en.wikipedia.org/wiki/Chi-squared_distribution), see [R doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Chisquare.html).

_typescript decl_

```typescript
declare function rchisq(
  n: number,
  df: number,
  ncp?: number
): number | number[];
```

* `p`: probabilities (array or scalar).
* `df`: degrees of freedom.
* `ncp`: non centrality parameter.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    ChiSquared,
    rng: {
        LecuyerCMRG,
        normal: { AhrensDieter }
    },
    R: { numberPrecision }
} = libR;

//helpers
const _9 = numberPrecision(9);

//explicit use of PRNG
const lc = new LecuyerCMRG(1234);
const { dchisq, pchisq, qchisq, rchisq } = ChiSquared(new AhrensDieter(lc));

//1
const r1 = _9(rchisq(5, 6));
//[ 12.4101973, 6.79954177, 9.80911877, 4.64604085, 0.351985504 ]


//2. df=40, ncp=3
const r2 = _9(rchisq(5, 40, 3));
//[ 22.2010553, 44.033609, 36.3201158, 44.6212447, 40.1142555 ]

//3. df=20
const r3 = _9(rchisq(5, 20));
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

_typescript decl_

```typescript
declare function dexp(
  x: number | number[],
  rate: number = 1,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles (array or scalar).
* `rate`: the λ parameter.
* `asLog`: return probabilities as ln(p)

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

_typescript decl_

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
* `logP`: return probabilities as ln(p)

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

_typescript decl_

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
* `logP`: return probabilities as ln(p)

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

_typescript decl_

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

_typescript decl_

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
* `asLog`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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
* `asLog`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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
* `asLog`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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

_typescript decl_

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
* `asLog`: if _true_, probabilities/densities p are returned as ln(p).

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

_typescript decl_

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
* `logP`: if _true_, probabilities/densities p are as ln(p).

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

_typescript decl_

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
* `logP`: if _true_, probabilities/densities p are as ln(p).

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

### Geometric distribution

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

_typescript decl_

```typescript
declare function dgeom(
  x: number | number[],
  prob: number,
  asLog: boolean = false
): number | number[];
```

* `x`: quantiles (array or scalar).
* `prob`: probability of success in each trial. 0 < prob <= 1.
* `asLog`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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
* `logP`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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
* `logP`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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

* `q`: is the number of observed successes.
* `m`: is the number of success states in the population
* `n`: is the number of failure states in the population
* `k`: is the number of draws from the population (n+m) sample.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

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

* `p`: is probability of observed successes.
* `m`: is the number of success states in the population
* `n`: is the number of failure states in the population
* `k`: is the number of draws from the population (n+m) sample.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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

_typescript decl_

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
* `asLog`: if TRUE, probabilities p are given as ln(p).

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

* `q`: quantiles (scalar or array).
* `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
* `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

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

* `p`: probabilities (scalar or array). 0 ≤ p ≤ 1.
* `location`: location parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution)
* `scale`: the scale parameter of the [Logistic distribution](https://en.wikipedia.org/wiki/Logistic_distribution). Strictly positive.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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

_typescript decl_

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
* `asLog`: return the densities as ln(p).

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

* `q`: quantiles, with distribution $x ~ N(\mu, \sigma)$
* `meanLog`: the mean of the normally distributed `x`
* `sdLog`: the standard deviation ($\sigma$) of the normal distributed `x`.
* `lowerTail`: if TRUE (default), probabilities are P[X <= x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

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

* `p`: probabilities.
* `meanLog`: the mean of the normally distributed `x`
* `sdLog`: the standard deviation ($\sigma$) of the normal distributed `x`.
* `lowerTail`: if TRUE (default), probabilities are P[X <= x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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

_typescript decl_

```typescript
declare function dpois(
  x: number | number[],
  lambda: number,
  asLog: boolean = false
): number | number[];
```

* `x`: quantile(s). Scalar or array.
* `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
* `asLog`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

```typescript
declare function ppois(
  q: number | number[],
  lambda: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number | number[];
```

* `q`: quantile(s). A Scalar or array.
* `lambda`: the lambda `λ` parameter from the [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as ln(p).

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

_typescript decl_

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
* `logP`: if TRUE, probabilities p are given as ln(p).

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

### Wilcoxon signed rank statistic distribution

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

_typescript decl_

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

_typescript decl_

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

_typescript decl_

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

_typescript decl_

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

_typescript decl_

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

_typescript decl_

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

$$ N = \sum_{i=1}^{i=k} n_{i} $$

$$ T_{i} = \frac{1}{n_{i}} \cdot \sum_{j=1}^{j=k} y_{ij} $$

$$ S^{2} = \frac{1}{(N-k)} \cdot \sum_{i=1}^{i=k} \sum_{j=1}^{j=n_{i}} \left( y_{ij} - T_{i} \right)^{2} $$

$$  v = \frac{N}{k} $$

Then the (1 - α) confidence interval for each $u_{j} \neq u_{i}$ comparison will be:

$$  \left(T_{i} - T_{j} \right)  - q_{\alpha,k,v} \cdot \sqrt{ S^2/k } \lt u_{i} - u_{j} \lt  \left(T_{i} - T_{j} \right)  + q_{\alpha,k,v} \cdot \sqrt{ S^2/k } $$

With `q(α,k,v)` equal to:

```javascript
qtukey(1-α, k, N-k);
```

#### `ptukey`

The probability function of the [Tukey Studentized Range](https://en.wikipedia.org/wiki/Studentized_range) aka Tukey HSD. Usefull it to find the p-value of the difference of 2 specific treatment means $T_{i}-T_{j}$. See [R-doc](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/Tukey.html).

_typescript decl_

```typescript
declare function ptukey(
    q: number|number[],
    nmeans: number,
    df: number,
    nranges: number = 1,
    lowerTail: boolean = true,
    logP: boolean = false
): number|number[]
```

* `q`: number of random deviates to generate.
* `nmeans`: sample size for range (same for each group).
* `df`: degrees of freedom of S². 
* `nranges`: number of groups whose maximum range is considered.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const { Tukey } = libR;

const { abs } = Math;

const { qtukey, ptukey } = Tukey();

const differenceOf2Means = -67.46;  //Ti - Tj
const std = 16.69658048823; // = S/sqrt(n) see formula for S²
const df = 20;  //degrees of freedom for std
const k = 5; // number of treatments in 1-way anova

const pValue = 1 - ptukey(abs(differenceOf2Means) / std, k, df)

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
    p: number|number[],
    nmeans: number,
    df: number,
    nranges: number = 1,
    lowerTail: boolean = true,
    logP: boolean = false
): number|number[]
```

* `q`: probabilities.
* `nmeans`: sample size for range (same for each group).
* `df`: degrees of freedom of S². 
* `nranges`: number of groups whose maximum range is considered.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if TRUE, probabilities p are given as log(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Tukey,
  R: { seq:_seq, numberPrecision }
} = libR;

//some helpers
const prec3 = numberPrecision(3);
const seq = _seq()();

const { ptukey, qtukey } = Tukey();

// Generates partial table for Tukey HSD table table 1-α = 0.95
//df=5
const row1 = seq(2,10).map(v => qtukey(0.95,v, 5));
prec3(row1);

//[ 3.64, 4.6, 5.22, 5.67, 6.03, 6.33, 6.58, 6.8, 6.99 ]

//df=6
prec3(seq(2,10).map(v => qtukey(0.95,v, 6)))
//[ 3.46, 4.34, 4.9, 5.3, 5.63, 5.9, 6.12, 6.32, 6.49 ]

//df=7
prec3(seq(2,10).map(v => qtukey(0.95,v, 7)));
//[ 3.34, 4.16, 4.68, 5.06, 5.36, 5.61, 5.82, 6, 6.16 ]

//df=8
prec3(seq(2,10).map(v => qtukey(0.95,v, 8)));
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
const libR = require('lib-r-math.js');
const {
    Weibull,
    rng: { WichmannHill }
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
  x: number|number[],
  shape: number,
  scale: number = 1,
  aslog: boolean = false
): number|number[];
```

* `x`: quantiles (scalar or Array)
* `shape`: shape parameter
* `scale`: scale parameter
* `asLog`: return result p as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Weibull,
  R: { seq: _seq, numberPrecision }
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
): number|number[];
```

* `q`: quantiles (scalar or Array)
* `shape`: shape parameter
* `scale`: scale parameter
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if `true`, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Weibull,
  R: { seq:_seq, numberPrecision }
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
  p: number|number[],
  shape: number,
  scale: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number|number[];
```

* `p`: probabilities (scalar or Array)
* `shape`: shape parameter
* `scale`: scale parameter
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if `true`, probabilities p are given as ln(p).

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Weibull,
  R: { seq:_seq, numberPrecision }
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

const q3 =  qweibull(pp, 1.5, 9);
precision(q3)
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

* `n`: Number of deviates to generate.
* `shape`: shape parameter
* `scale`: scale parameter

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    Weibull,
    rng: { WichmannHill },
    R: {  numberPrecision }
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

The Wilcoxon rank sum test  is also known as the [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)

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
  x: number|number[],
  m: number,
  n: number,
  asLog: boolean = false
): number|number[]
```

* `x`: quantile(s), scalar or array of values.
* `m`: size of first sample, the convention is to have m ≤ n.
* `n`: size of the second sample, the convention is n ≥ m.
* `asLog`: return value as ln(p)

Note: if `m` ≥ `n` the values are swapped internally.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Wilcoxon,
  R: { seq:_seq , numberPrecision, arrayrify }
} = libR;

//helper functions
const seq = _seq()();
const precision = numberPrecision(9);
const pow = arrayrify(Math.pow); //allow it to accept "R" like vectorized input

//init
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon();

const x = pow( seq(0,10,2), 2);
//[ 0, 4, 16, 36, 64, 100 ]

//
const d1 = dwilcox(x, 8, 9);
precision(d1)
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
  q: number|number[],
  m: number,
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number|number[]
```

* `q`: quantile(s), scalar or array of values.
* `m`: size of first sample, the convention is to have m ≤ n.
* `n`: size of the second sample, the convention is n ≥ m.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if `true`, probabilities p are given as ln(p).

Note: if `m` ≥ `n` the values are swapped internally.

Usage:

```javascript

const libR = require('lib-r-math.js');
const {
  Wilcoxon,
  R: { seq:_seq , numberPrecision, arrayrify }
} = libR;

//helper functions
const seq = _seq()();
const precision = numberPrecision(9);
const pow = arrayrify(Math.pow); //allow it to accept "R" like vectorized input

//init
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon();

const q = pow( seq(0,10,2), 2);

//1
const p1 = pwilcox(q, 8, 9);
precision(p1)
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
  p: number|number[],
  m: number,
  n: number,
  lowerTail: boolean = true,
  logP: boolean = false
): number|number[]
```

* `p`: probabilities, scalar or array of values.
* `m`: size of first sample, the convention is to have m ≤ n.
* `n`: size of the second sample, the convention is n ≥ m.
* `lowerTail`: if TRUE (default), probabilities are P[X ≤ x], otherwise, P[X > x].
* `logP`: if `true`, probabilities p are given as ln(p).

Note: if `m` ≥ `n` the values are swapped internally.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Wilcoxon,
  R: { seq:_seq }
} = libR;

//helper functions
const seq = _seq()();

//init
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon();

//probabilities (0, 1)
const p = seq(0,1,0.2);
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
declare function rwilcox(
  nn: number,
  m: number,
  n: number
  ): number|number[];
```

* `nn`: number of deviates to generate.
* `m`: size of first sample, the convention is to have m ≤ n.
* `n`: size of the second sample, the convention is n ≥ m.

Note: if `m` ≥ `n` the values are swapped internally.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
  Wilcoxon,
  rng: { SuperDuper }
} = libR;

const sd = new SuperDuper(1234);
const { dwilcox, pwilcox, qwilcox, rwilcox } = Wilcoxon(sd);

sd.init(1234);// you may do this at any time

//1
rwilcox(5, 8, 9);
//[ 48, 27, 60, 20, 43 ]

//2
rwilcox(5, 100, 50);
//[ 2521, 2373, 2266, 2136, 2397 ]

//3
rwilcox(5, 5, 34)
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
const libR = require('lib-r-math.js');
const {
    special: { besselJ, besselK, besselI, besselY }
} = libR;
```

#### `besselJ`

[Bessel function](https://en.wikipedia.org/wiki/Bessel_function) of first kind. See [R doc](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Bessel.html).

_typescript decl_

```typescript
declare function besselJ(
  x: number|number[],
  nu: number|number[]
): number|number[];
```

* `x`: input value x ≥ 0.
* `nu`: order, (may be fractional!)

_**Note:** if `x` and `nu` are arrays or (scalar/array combinations)
of unequal length then R argument cycling rules apply._

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { besselJ, besselK, besselI, besselY },
    R: { map, numberPrecision, c }
} = libR;

const _9 = numberPrecision(9);

let xJ = c(1, 7.389, 20.09, 7.389, 403.4, 1097,
    0.3679, 8103, 22030, 0.04979, 7.389, 1097);

let nuJ = c(11.02, 0.1353, 0.4066, 54.6, 63.43, 73.7,
 -3.669, -0.4066, -1.221, -63.43, -54.6, -73.7);

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
  x: number|number[],
  nu: number|number[]
): number|number[];
```

* `x`: input value x ≥ 0.
* `nu`: order, (may be fractional!)

_**Note:** if `x`, `nu`, or `expo` are arrays or (scalar/array combinations)
of unequal length then R argument cycling rules apply._

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { besselJ, besselK, besselI, besselY },
    R: { map, numberPrecision, c }
} = libR;

const _9 = numberPrecision(9);

let xY = c(0.1353, 148.4, 22030, 20.09, 403.4, 1097, 0.1353, 2.718, 2981, 1, 8103, 22030);
let nuY = c(1.221, 3.669, 1.221, 63.43, 63.43,
    73.7, -1.221, -33.12, -0.1353, -63.43, -63.43, -73.7);

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
  x: number|number[],
  nu: number|number[],
  expo: boolean|boolean[] = false
): number;
```

* `x`: input value x ≥ 0.
* `nu`: order, (may be fractional!)
* `expo`: if TRUE, the results are scaled in order to avoid overflow `exp(-x)*BesselI(x;nu)`.

_**Note:** if `x`, `nu`, or `expo` are arrays or (scalar/array combinations)
of unequal length then R argument cycling rules apply._

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { besselJ, besselK, besselI, besselY },
    R: { map, numberPrecision, c }
} = libR;

const _9 = numberPrecision(9);

//just to show parameter combinations
let xI = c(0.3679, 1, 22030,  0.04979,  54.6,  403.4,
  0.04979,  2981,  8103, 0.1353, 0.3679, 2.718);
let nuI = c(3.669, 11.02, 1.221, 63.43, 73.7, 63.43,
  -0.4066, -0.1353, -0.4066, -73.7, -54.6, -73.7);

// besselI doesnt take vactorized input like R counterpart. So we use a map
const bI = _9(  besselI(xI, nuI, true)  );
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
  x: number|number[],
  nu: number|number[],
  expo: boolean|boolean[] = false
): number;
```

* `x`: input value x ≥ 0.
* `nu`: order, (may be fractional!)
* `expo`: if TRUE, the results are scaled in order to avoid underflow `exp(x)*BesselK(x;nu)`.

_**Note:** if `x`, `nu`, or `expo` are arrays or (scalar/array combinations)
of unequal length then R argument cycling rules apply._

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { besselJ, besselK, besselI, besselY },
    R: { map, numberPrecision, flatten:c }
} = libR;

const _9 = numberPrecision(9);

let xK=c(0.3679,  2.718,  403.4,  1,  54.6,  2981,  0.3679,  148.4,
  22030,  0.1353,  2.718,  148.4 );

let nuK= c(3.669, 33.12, 11.02, 63.43, 73.7, 54.6, -3.669, -3.669,
 -1.221, -73.7, -73.7, -54.6);

const bK = _9(  besselK(xK, nuK, true)  );
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

* `a`: non-negative (scalar or array). See [wiki](https://en.wikipedia.org/wiki/Beta_function)
* `b`: non-negative (scalar or array). See [wiki](https://en.wikipedia.org/wiki/Beta_function)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { beta, lbeta },
    R: { flatten: c }
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

* `a`: non-negative (scalar or array). See [wiki](https://en.wikipedia.org/wiki/Beta_function)
* `b`: non-negative (scalar or array). See [wiki](https://en.wikipedia.org/wiki/Beta_function)

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { beta, lbeta },
    R: { flatten: c }
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

$$ ψ(x) = \frac{d}{dx}  (ln Γ(x) )= \frac{Γ'(x)}{ Γ(x)} $$

_typescript decl_

```typescript
declare function digamma(
  x: number|number[]
): number|number[];
```

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { digamma },
    R: { numberPrecision, seq: _seq, flatten: c }
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

The 2nd derivative of  `ln Γ(x)`. See [R doc]()

$$ ψ(x)' = \frac{d²}{dx²}  (ln Γ(x) )$$

_typescript decl_

```typescript
declare function trigamma(
  x:number|number[]
):number|number[];
```

* `x`: 0 ≤ x ≤ Infinity.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { trigamma },
    R: { numberPrecision, seq: _seq, flatten: c }
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

The 3rd derivative of  `ln Γ(x)`. This function is deprecated in `R`. 
`tetragamma(x)` is an alias for `psigamma(x,2)`.

$$ ψ(x)³ = \frac{d²}{dx²}  (ln Γ(x) )$$

_typescript decl_

```typescript
declare function tetragamma(
  x:number|number[]
):number|number[];
```

* `x`: 0 ≤ x ≤ Infinity.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { tetragamma },
    R: { numberPrecision, seq: _seq, flatten: c }
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

The 4th derivative of  `ln Γ(x)`. This function is deprecated in `R`.
`pentagamma(x)` is an alias for `psigamma(x,3)`.

$$ ψ³(x) = \frac{d⁴}{dx⁴}  (ln Γ(x) )$$

_typescript decl_

```typescript
declare function pentagamma(
  x:number|number[]
):number|number[];
```

* `x`: 0 ≤ x ≤ Infinity.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { pentagamma },
    R: { numberPrecision, seq: _seq, flatten: c }
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

The nth derivative of  `ln Γ(x)`.

$$ ψ(x)^{n} = \frac{d^{n}}{dx^{n}}  (ln Γ(x) )$$

_typescript decl_

```typescript
declare function psigamma(
  x:number|number[],
  deriv: number|number[]
):number|number[];
```

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { psigamma },
    R: { numberPrecision, seq: _seq, flatten: c }
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
declare function gamma(
  x: number|number[]
): number|number[]
```

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { gamma },
    R: { numberPrecision, seq: _seq, flatten: c }
} = libR;

//some helpers
const seq = _seq()();
const precision9 = numberPrecision(9); //truncate past 9 digits

//generate data
const gx = seq(2,5,.5).map(x=> x*x-9);
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
declare function lgamma(
  x: number|number[]
): number|number[] 
```

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { lgamma },
    R: { numberPrecision, seq: _seq, flatten: c }
} = libR;

//some helpers
const seq = _seq()();
const precision9 = numberPrecision(9); //truncate past 9 digits

//generate data
const gx = seq(2,5,.5).map(x=> x*x-9);
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
  n: number|number[],
  k: number|number[]
): number|number[]
```

* `n`: scalar or array of numbers
* `k`: scalar or array of numbers

**Note:** if `n` and `k` are unequal sized arrays then R argument cycling rules apply.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { choose },
    R: { seq: _seq, flatten: c }
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
  n: number|number[],
  k: number|number[]
): number|number[]
```

* `n`: scalar or array of numbers
* `k`: scalar or array of numbers

**Note:** if `n` and `k` are unequal sized arrays then R argument cycling rules apply.

Usage:

```javascript
const libR = require('lib-r-math.js');
const {
    special: { choose },
    R: { seq: _seq, flatten: c }
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
