# libRmath.js

Javascript ( TypeScript ) Pure Implementation of Statistical R "core" numerical `libRmath.so` library found here
https://svn.r-project.org/R/trunk/src/nmath/

### Summary

Porting `R` core is a daunting task, we want to *VERIFY* fidelity with `R` on all functions that are ported from `R` to ```javascript``` by using static fixtures (generated in R language) to guarantee exact output replication of the ported functions.

All functions in lib-R-core has been re-written to `Javascript` (`Typescript`).
We are now in process of testing against fixture files generated from R and to prove
fidelity with `R`.

#### Node and Web

No node specific features are used, you can either deploy for client web or server.

## Installation

```bash
npm install --save lib-r-math.js
```

# Table of Contents
1. [Probability Random Number Generators](#1-probability-functions-random-number-generators)
2. [Probability Distributions](#2-probability-distributions)
3. [Special Functions](#special-functions)
4. [Work Done](#work-done)
5. [Road Map](#road-map)

# 1. Probability functions Random Number Generators.

#### Summary
In 'R' numerous random number generators are documented with their particular distributions.
For example `rt` (_random generator having a distribution of Student-T_) is documented with all functions related to the student-T distribution, like `qt` (quantile function), `pt` (cumulative probability function), `dt` (probability density function).

The setup in `libRMath.js` will deviate slightly from this grouping. There random generators will still be grouped according to their respective distributions as in R, but also grouped separately into `lib-r-math/rng/<distribution name>`.

## 1.1 The 7 samurai of Uniform Random Number Generators.

#### Summary
Uniform random generators are `the source off other random generator distributions`. So `R` has made 7 of them with their respective strength and weaknesses. Type in your R-console the command `?RNGkind` for an overview.

All 7 random generators have been ported and tested to yield exactly the same as their R counterpart.

#### Improvements.
In R it is impossible to use different types of uniform random generators at the same time because of a global shared seed buffer. In our port every random generator has its own buffer and can therefore be used at the same time.

#### General Usage.
All uniform random generator export the same functions:
1. `init`: set the random generator seed (it will be pre-scrambled)
2. `seed (read/write property)`: get/set the current seed values as an array.
3. `unif_random`: get a random value, same as `runif(1)` in R

#### 1. "Mersenne Twister".

From Matsumoto and Nishimura (1998). A twisted GFSR with period `2^19937 - 1` and equi-distribution in 623 consecutive dimensions (over the whole period). The _`seed`_ is a 624-dimensional set of 32-bit integers plus a current position in that set.

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
  mt.unif_rand()
  //0.2655086631421
  mt.unif_rand()
  //0.37212389963679016
  mt.unif_rand()
  //0.5728533633518964
  mt.unif_rand()
  //0.9082077899947762
```

_in R console_:

```R
  > RNGkind("Mersenne-Twister")
  > set.seed(0)
  > runif(5)
[1] 0.8966972 0.2655087 0.3721239 0.5728534
[5] 0.9082078
```

#### 2. "Wichmann-Hill".

The seed, is an integer vector of length 3,
where each element is in `1:(p[i] - 1)`, where p is the length 3 vector of primes, `p = (30269, 30307, 30323)`. The `Wichmann–Hill` generator has a cycle length of `6.9536e12 = ( 30269 * 30307 * 30323 )`, see Applied Statistics (1984) 33, 123 which corrects the original article).

usage example:
```javascript
  const libR = require('lib-r-math.js');
  const { WichmannHill } = libR.rng;
 
  const wh = new WichmannHill(0);// initialize with zero
 
 wh.init(0); // re-initialize at any time (again to zero)
 wh.seed;
//[ 2882, 21792, 10079 ]
 wh.unif_rand()
//0.4625531507458778
 wh.unif_rand()
//0.2658267503314409
wh.unif_rand()
//0.5772107804324318
 wh.unif_rand()
//0.5107932055258312
 wh.unif_rand()
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

#### 3. "Marsaglia-Multicarry":
A multiply-with-carry RNG is used, as recommended by George Marsaglia in his post to the mailing list ‘sci.stat.math’. It has a period of more than 2^60 and has passed all tests (according to Marsaglia). The seed is two integers (all values allowed).

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

#### 4. "Super Duper":
Marsaglia's famous Super-Duper from the 70's. This is the original version which does not pass the MTUPLE test of the Diehard battery. It has a period of about 4.6*10^18 for most initial seeds. The seed is two integers (all values allowed for the first seed: the second must be odd).

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

#### 5. "Knuth TAOCP":
An earlier version from Knuth (1997).

The 2002 version was not backwards compatible with the earlier version: the initialization of the GFSR from the seed was altered. R did not allow you to choose consecutive seeds, the reported ‘weakness’, and already scrambled the seeds.

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
kt.unif_rand()
//0.6274007670581344
kt.unif_rand()
//0.35418667178601043
kt.unif_rand()
//0.9898934308439498
kt.unif_rand()
//0.8624081434682015
kt.unif_rand()
//0.6622992046177391
kt.unif_rand()
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

#### 6. "Knuth TAOCP 2002":
A 32-bit integer GFSR using lagged Fibonacci sequences with subtraction. That is, the recurrence used is
```R
X[j] = (X[j-100] - X[j-37]) mod 2^30
```
and the ‘seed’ is the set of the 100 last numbers (actually recorded as 101 numbers, the last being a cyclic shift of the buffer). The period is around 2^129.

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
 kt2002.unif_rand()
//0.19581903796643027
 kt2002.unif_rand()
//0.7538668839260939
  kt2002.unif_rand()
//0.47241124697029613 
  kt2002.unif_rand()
//0.19316043704748162
  kt2002.unif_rand()
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

#### 7. "L'Ecuyer-CMRG":

A ‘combined multiple-recursive generator’ from L'Ecuyer (1999), each element of which is a feedback multiplicative generator with three integer elements: thus the seed is a (signed) integer vector of length 6. The period is around 2^191.

The 6 elements of the seed are internally regarded as 32-bit unsigned integers. Neither the first three nor the last three should be all zero, and they are limited to less than 4294967087 and 4294944443 respectively.

This is not particularly interesting of itself, but provides the basis for the multiple streams used in package parallel.

usage example:

```javascript
  const libR = require('lib-r-math.js');
  const { LecuyerCMRG } = libR.rng;
  const lc = new LecuyerCMRG(0);

  lc.init(0);// at any time re-initialize with any value (in this case 0)
  lc.seed;
// 6 unsigned integer array
//[ -835792825,
 // 1280795612,
 // -169270483,
 // -442010614,
 // -603558397,
 // -222347416 ]
 lc.unif_rand()
//0.33292749227232266
 lc.unif_rand()
//0.890352617994264
 lc.unif_rand()
//0.1639634410628108
 lc.unif_rand()
//0.29905082406536015
 lc.unif_rand()
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

## 2. Probability Distributions

#### Summary

In the Section [1](#1-probability-functions-random-number-generators)
the RNG classes can be used by themselves but mostly intended to be consumed to generate random numbers with a particular distribution (like `Gamma`, `Weibull`, `Chi-square` etc).

_It is also possible to provide your own uniform random source (example: real random numbers fetched from services over the internet). How to create your own PRNG to be consumed by probability distribution simulators is discussed in the [Appendix](#appendix)._

#### Uniform distribution 

`dunif, qunif, punif, runif`

_Naming follows close to R counter part_ 

Usage:

```javascript
   const libR = require('lib-r-math.js');

   // get the suite of functions working with uniform distributions
   const { uniform } = libR;

   // prepare PRNG 
   const { SuperDuper } = libR.rng;

   // initialize PRNG with seed (`0` and `1234`) and create R instance of uniform functions working with this PRNG
   const Runif = uniform( new SuperDuper(0) );
   const Runif2 = uniform( new SuperDuper(1234) );

   // for documentation purpose we strip R uniform equivalents
   const { runif, dunif, punif, quninf } = Runif;

   // Get 15 uniformly distributed numbers between 0 and 1
   runif(15);

   // Get 5 uniformly distributed numbers between 4 and 9
   runif(5, 4, 9)

   // get the envelope of the uniform distributions
   // dunif(x, min = 0, max = 1, log = FALSE)
   // x could be an Array of numbers of a scalar
   dunif([-1, 0, 0.4 ,1, 2])
   // [ 0, 1, 1, 1, 0 ]  Everythin is 1 for inputs between 0 and 1
   dunif([-1, 0, 0.4 ,1, 2], 0, 2)
   // [ 0, 0.5, 0.5, 0.5, 0.5 ]
   dunif([-1, 0, 0.4 ,1, 2], 0, 2, true)
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
  punif(0.25)
  // 0.25

  punif([-2, 0.25, 0.75, 2])
  // 0, 0.25, 0.75, 1

  punif([-2, 0.25, 0.75, 2], 0, 1, false)
  // 1, 0.75, 0.25, 0 

  punif([-2, 0.25, 0.75, 2], 0, 2, false, true)
  //[ 0, -0.13353139262452263, -0.4700036292457356, -Infinity ]

  punif([-2, 0.25, 0.75, 2], 0, 2, false, true)
  //[ 0, -0.13353139262452263, -0.4700036292457356, -Infinity ]

  // inverse of the cummumative propbabilty
  // qunif(p, min = 0, max = 1, lower.tail = TRUE, log.p = FALSE)
  qunif( [  0, 0.25, 0.75, 0.9 , 1 ], 0, 4, true)
  //qunif( [  0, 0.25, 0.75, 0.9 , 1 ], 0, 4, true)
```

# Current State
As of 26 March initial port has been done, now to implement tests ( CHAI, MOCHA) 

| original c module | js/ts module name | port date | date added to test-suite | R -base functions |
|-------------|--------------------|-------------|--|--------------------|
|cospi.c | ./lib/cospi.ts | 23-jan-2017 | 16 Apr 2017 |cospi, sinpi, tanpi , tan, cos, sin, atan2  |
snorm.c           | ./lib/snorm.ts| 26 March 2017 |  |  Random variates from the STANDARD normal distribution  N(0,1).|
sign.c           | ./lib/sign.ts| 25 March 2017 ||  This function computes the  'signum(.)' function: |
rweibull.c           | ./lib/rweibull.ts| 25 March 2017 ||  Random variates from the Weibull distribution. |
wilcox.c           | ./lib/wilcox.ts| 25March 2017 || dwilcox: The density of the Wilcoxon distribution,   pwilcox: The distribution function of the Wilcoxon distribution, qwilcox:	The quantile function of the Wilcoxon distribution,  rwilcox:	Random variates from the Wilcoxon distribution.  |
rt.c           | ./lib/rt.ts| 25March 2017 || Pseudo-random variates from a t distribution. |
signrank.c           | ./lib/signrank.ts| 25 March 2017 || dsignrank: The density of the Wilcoxon Signed Rank distribution, psignrank: The distribution function of the Wilcoxon Signed Rank distribution, qsignrank: The quantile function of the Wilcoxon Signed Rank distribution, rsignrank: Random variates from the Wilcoxon Signed Rank distribution. |
rpois.c           | ./lib/rpois.ts| 25 March 2017 || Random variates from the Poisson distribution. |
rnorm.c           |./lib/rnorm.ts |23 March 2017 || Random variates from the normal distribution. |
rnchisq.c           | ./lib/rnchisq.ts | 23 March 2017  ||  Random variates from the NON CENTRAL chi-squared distribution.|
rnbinom.c           |./lib/rnbinom.ts | 23 March 2017 ||   Random variates from the negative binomial distribution. |
rmultinom.c           | ./lib/rmultinom.ts| 23 March 2017 || 	Random Vector from the multinomial distribution.|
rlogis.c           | ./lib/rlogis.ts| 23 March 2017 ||  random variates of the logistic distribution |
rlnorm.c           |./lib.rlnorm | 23 March 2017 ||  Random variates from the lognormal distribution. |
rhyper.c           | ./lib/rhyper.ts| 21 March 2017 || Random variates from the hypergeometric distribution. |
rgeom.c           |./lib/rgeom.ts | 21 March 2017 ||  Random variates from the geometric distribution. |
rgamma.c           |./lib/rgamma.ts | 21 march 2017 ||   Random variates from the gamma distribution. |
rf.c           | ./lib/rf.ts| 21 march 2017 ||  Pseudo-random variates from an F distribution. |
rexp.c           |./lib/rexp.ts | 21 march 2017 ||  Random variates from the exponential distribution. |
rchisq.c           | ./lib/rchisq.ts |21 march 2017 ||  Random variates from the chi-squared distribution. |
rcauchy.c           |./lib/rcauchy.ts | 21 march 2017 || Random variates from the Cauchy distribution. |
rbeta.c           | ./lib/rbeta.ts | 21 march 2017 || Generating beta variates with nonintegral shape parameters. |
rbinom.c           |./lib/rbindom.ts | 21 March 2017  ||	Random variates from the binomial distribution. |
qweibull.c           | ./lib/qweibull.ts | 20 March 2017 || The quantile function of the Weibull distribution. |
qtukey.c           |./lib/qtukey.ts | 20 March 2017 || Computes the quantiles of the maximum of rr studentized ranges |
qt.c           |./lib/qt.ts | 20 March 2017 || The "Student" t distribution quantile function.  |
qpois.c    | ./lib/qpois.ts | 19 March 2017 || The quantile function of the Poisson distribution.|
qnt.c           | ./lib/qnt.ts| 19 March 2017 ||  quantily function of the commulative  probability of the non-central t-distribution |
qnchisq.c           | ./lib/qnchisq.ts | 19 March ||the quantile function of the  noncentral chi-squared distribution  |
qnf.c           | ./lib/qnf.ts  | 19 March  || The quantile function of the non-central F distribution.  |
qnbinom.c           |./lib/qnbinom.ts  | 19 March 2017 | |The quantile function of the negative binomial distribution. |
qnbeta.c           | ./lib/qnbeta.ts| 19 March 2017 | |the quantile function of the noncentral beta distribution |
qlnorm.c           | ./lib/qlnorm.ts | 19 March 2017  ||  This the lognormal quantile function. |
qhyper.c           | ./lib/qhyper.ts | 19 March 2017| |    The quantile function of the hypergeometric distribution. |
qgeom.c           | ./lib/qgeom.ts | 19 March 2017 | |  The quantile function of the geometric distribution. |
qgamma.c           |./lib/qgamma.ts | 18 March 2017 | |Compute the quantile function of the gamma distribution. |
qf.c           |./lib/qf.ts |  18 March 2017  |  |The quantile function of the F distribution. |
qexp.c           |./lib/qexp.ts| 18 March 2017  |  |  The quantile function of the exponential distribution.  |
qcauchy.c           | ./lib/qcauchy.ts |  18 March 2017 ||The quantile function of the Cauchy distribution. |
qchisq.c           | ./lib/qchisq.ts | 18 Match 2017 || The quantile function of the chi-squared distribution. |
qbinom.c           | ./lib/qbinom.ts|18 March 2017 | |The quantile function of the binomial distribution. |
qbeta.c           | ./lib/qbeta.ts| 18 March 2017 | |The quantile function of the beta distribution.   |
pweibull.c           |./lib/pweibull.ts |18 Match 2017  | |The distribution function of the Weibull distribution. |
punif.c           | ./lib/punif.ts | 18 Match 2017 | | The distribution function of the uniform distribution. |
ptukey.c           |./lib/ptukey.ts| 18 March 2017 ||Computes the probability that the maximum of rr studentized ranges, each based on cc means and with df degrees of freedom  for the standard error, is less than q. |
pnorm.c           | ./lib/pnorm.ts| 17 March 2017  ||  normal distribution function |
ppois.c           | ./lib/pois.ts | 17 March 2017 | | The distribution function of the Poisson distribution.  |
pt.c           | ./lib/pt.ts | 16 March | |t distrib. with n degrees of freedom).  |
polygamma.c           | ./lib/polygamma.c| 16 March | | Compute the derivatives of the psi function   and polygamma functions. |
pnt.c           | ./lib/pnt.ts|  16 March | |Cumulative probability at t of the non-central t-distribution,  with df degrees of freedom (may be fractional) and non-centrality,  parameter delta.|
pnf.c           |./lib/pnf.ts| 15 March |	|The distribution function of the non-central F distribution.|
|pnchisq.c    | ./lib/pnchisq.tc | 14 March  | | Algorithm AS275: Computing the non-central chi-squared distribution function. |
pnbinom.c           | ./lib/pnbinom.ts | 14 March | |The distribution function of the negative binomial distribution. |
pnbeta.c           |./lib/pnbeta.ts |14 March | | pbeta  - incomplete-beta function {nowadays: pbeta_raw() -> bratio()} |
plogis.c           | ./lib/plogis.ts| 14 March | | Compute  log(1 + exp(x))  without overflow (and fast for x > 18)  |
plnorm.c     | ./lib/plnorm.ts | 14 March || n The lognormal distribution function. |
|phyper.c    | ./lib/phyper.ts | 14 March || The distribution function of the geometric distribution. |
|pgamma.c    | ./lib/pgamma.ts |  14 March | |This function computes the distribution function for the gamma distribution  |
|pgeom.c     | ./lib/pgeom.ts|  14 March | | The distribution function of the geometric distribution. |
|pf.c   | ./lib/pf.ts | 14 March 2017 | | The distribution function of the F distribution. |
|pexp.c           |./lib/pexp.ts| 14 March 2017 | |The distribution function of the exponential distribution. |
|pcauchy.c    | ./lib/pauchy.ts | 14 March 2017| |The distribution function of the Cauchy distribution. |
|pchisq.c     | ./lib/pschisq.ts | 14 March 2017| |The distribution function of the chi-squared distribution. |
| pbinom.c | ./lib/pbinom.ts | 14 March 2017 |  | The distribution function of the binomial distribution. |
| Toms708.java | ./lib/Toms708.ts | 14 March 2017 | |from Java Version  James Curran (j.curran@auckland.ac.nz) (Java version)  |
| pbeta.c | ./lib/pbeta.ts | 14 March 2017 | |beta distribution function  |
| pnorm.c| ./lib/pnorm.ts | 9 March 2017 |  |Normal distribution function |
| gammalims.c | ./lib/gammalims.ts | 5 march 2017 | |calculates legal bounds of gamme_fn|
| fround.c | ./lib/fround.ts | 5 march 2017 | |rounds off to a set number of digites |
| fprec.c | ./lib/fprec.ts | 4 march 2017 |  |Returns the value of x rounded to "digits" significant |
| expm1.c | ./lib/expm1.ts | 4 march 2017  | |Compute the Exponential minus 1 |
| dweibull.c | ./lib/dweibull.ts | 4 march 2017  | |The density function of the Weibull distribution.|
| dt.c | ./lib/dt.ts| 4 March 2017 | | The t density |
| dpois.c | ./lib/dpois.ts | 4 March 2017 |  |dpois() computes the Poisson probability  lb^x exp(-lb) / x! |
| dnchisq.c | ./lib/dnchisq.ts | 4 March 2017| | The density of the noncentral chi-squared distribution with "df" |
| dnt.c | ./lib/dnt.ts| 4 March 2017 | | Computes the density of the noncentral beta distribution with |
| dnorm.c | ./lib/dnorm.ts | 25 feb 2017 | |Compute the density of the normal distribution. |
| dnf.c | ./lib/dnt.ts | 25 feb 2017  | |The density function of the non-central F distribution |
| dnbinom.c | ./lib/dnbinom.ts | 25 feb 2017 | |Computes the negative binomial distribution. |
| dlogis.c | ./lib/dlogis.ts | 4 March 2017 | |The density of the Logistic Distribution  |
| dlnorm.c | ./lib/dlnorm.ts |4 March 2017| |The density of the lognormal distribution.|
| dhyper.c | ./lib/dhyper.ts | 4 March 2017 |  |The hypergeometric probability |
| dgeom.c | ./lib/dgeom.ts | 4 March 2017 |  | Computes the geometric probabilities, Pr(X=x) = p(1-p)^x. |
| dnbeta.c | ./lib/dnbeta.ts | 4 March 2017 |  |Computes the density of the noncentral beta distribution with |
| pgamma.c | ./lib/pgamme.ts | 9 March 2017 | |This function computes the distribution function for the gamma distribution |
| dcauchy.c| ./lib/dcauchy.ts| 27 feb 2017  | |The density of the Cauchy distribution. |
| dexp.c | ./lib/dexp.ts | 27 feb 2017 | |The density of the exponential distribution. |
| df.c | ./lib/df.ts | 27 feb 2017  |  |The density function of the F distribution.|
| dchisq.c  | ./lib/dchisq.ts|  feb 27, 2017| |The density of the chi-squared distribution. |
| dgamma.c | ./lib/dgamma.ts | 27 feb 2017 |  |Computes the density of the gamma distribution |
| fmax2.c | part of ./lib/_general.ts |  25 jan 2017 | |this function is moved to module ./lib/_general.ts |
| fmin2.c  | part of ./lib/_general.ts| 25 jan 2017 |  |this function is moved to module ./lib/_general.ts |
| fsign.c |  ./lib/fsign.ts |    MArch 5, 2017 |  |This function performs transfer of sign.  |
| ftrunc.c | part of ./lib/_general.ts | March 5 2017|  | floating point truncation |
| lbeta.c | ./lib/lbeta.ts | March 2 2017 |  |This function returns the value of the log beta function.|
| C99 gamma function | ./lib/c99_gamma.ts | |25 feb 2017 | added C99 gamma and lgamma, |
|dnbinom.c | ./lib/dnbinom.ts | 25 feb 2017 | |negative binomial distribution.
|dbeta.c           |  ./lib/dbeta.ts | 25 feb 2017  | |R "dbeta" beta distribution function  |
|dbinom.c           | ./lib/dbinom.ts  | 25 feb 2017 | |probability mass function of binomial distribution |
|log1p.c | ./lib/log1p.ts | 25 feb 2017| |calculate log(1+x) for small value of x|
|choose.c           | choose.ts | 21 feb 2017 | |R "choose" function, C(n,k) binomial coefficients |
|gamma_cody.c      | gamme_cody.ts| 19 feb 2017| |GAMMA function using algo of  W. J. Cody, |
|bessel_i.c           | bessel_i.ts  | 19 feb 2017 | |besseli |
|bessel_j.c           | bessel_j.ts | 19 feb 2017 | |besselj  |
|bessel_k.c           | bessel_k.ts | 19 feb 2017 | |besselK |
|bessel_y.c           | bessel_y.ts |  19 feb 2017 | |bessely  |
|sexp.c           | ./sexp.ts| 8-feb-2017 | |(Random variates from the standard exponential distribution) exp_rand (internally used) function  |
|dunif.c           | ./dunif.ts| 8-feb-2017 | |R "dunif" function  |
|bessel_k.c           | ./bessel_k.ts| 8-feb-2017 | |R "besselK" function http://www.netlib.org/specfun/rkbesl |
|runif.c           | ./runif.ts| 4-feb-2017 | |implemented 3 RNG and native browser/node agnostic 64 RNG map to floating number |
|bd0.c           | ./lib/bd0.ts |23-jan-2017 | |hidden, used by modules dbinom.c ,dpois.c dt.c |
|beta.c           |./lib/beta.ts  | 23-jan-2017 | | [beta](https://en.wikipedia.org/wiki/Beta_function) |
|chebyshev.c           | ./lib/chebyshev.ts | 23-jan-2017 | |chebyshev\_init , chebyshev\_eval |
|gamma.c           |./lib/gamma_fn.ts | 23-jan-2017 | |[gammafn] gamme function(https://en.wikipedia.org/wiki/Gamma_function) |
|lgamma.c           | ./lib/lgamma_fn.ts | 23-jan-2017 | |logarithmic gamma [lgammafn](https://en.wikipedia.org/wiki/Gamma_function) |
|lgammacor.c           |./lib/lgammecor.ts  | 23-jan-2017 | |lgammacor |
|stirlerr.c           | ./lib/stirlerr | 23-jan-2017 | |Computes the log of the error term in Stirling's formula ( _stirlerr_ ) |


### TODO

## All modules re-written in Typescript (JS), now testing must commence

| original c module | ported to javascript? | tested | R - base functions |
|------------------|--------------------|-------------|--------------------|
bd0.c           | done  | no | hidden, used by modules dbinom.c ,dpois.c dt.c |
bessel_i.c           | done  | no | R "besseli" Modified Bessel function of first kind. |
bessel_j.c           | done | no | R "besselj" gives the Bessel function of the first kind.  |
bessel_k.c           | done | no | R "besselK" function http://www.netlib.org/specfun/rkbesl |
bessel_y.c           | done | no | R "bessely" gives the Bessel function of the second kind . |
beta.c           |done   | no | [beta](https://en.wikipedia.org/wiki/Beta_function) |
chebyshev.c           | done ./lib/chebyshev.ts | no | chebyshev\_init , chebyshev\_eval |
choose.c           |done  | no | R "choose" function, C(n,k) binomial coefficients |
cospi.c           | done ./lib/cospi.ts | yes | cospi, sinpi, tanpi |
d1mach.c           |done | no | included in ./_general.ts |
dbeta.c           |  done | no  | distribution function of beta |
dbinom.c           | done  | no | probability mass function of binomial distribution |
dcauchy.c           | done| no | The density of the Cauchy distribution. |
dchisq.c           | done| no | The density of the chi-squared distribution. |
dexp.c           |done | no  | The density of the exponential distribution. |
df.c           | done | no  |  The density function of the F distribution.|
dgamma.c           | done| no  |  Computes the density of the gamma distribution, |
dgeom.c           |done |no  | Computes the geometric probabilities, Pr(X=x) = p(1-p)^x |
dhyper.c           |done | no  |  The hyper-geometric probability |
dlnorm.c           |done | no |   The density of the log-normal distribution. |
dlogis.c           | done| no |  The density of the Logistic Distribution |
dnbeta.c           |done | no |  Computes the density of the non-central beta distribution with |
dnbinom.c           |done | no  | negative binomial probability prob mass function |
dnchisq.c           |done | no |   The density of the non-central chi-squared distribution with "df" |
dnf.c           |done | no | The density function of the non-central F distribution |
dnorm.c           |done  | no  |  Compute the density of the normal distribution. |
dnt.c           |done | no | the non-central t density |
dpois.c           | done| no  |  dpois() computes the Poisson probability  lb^x exp(-lb) / x! |
dt.c           |done | no |  The t density  |
dunif.c           | done| no | R "dunif" function  |
dweibull.c           | done| no  |  The density function of the Weibull distribution. |
expm1.c           |done | no  | Compute the Exponential minus 1 |
fmax2.c           |done | no | this function is moved to module ./lib/_general.ts |
fmin2.c           | done| no |  this function is moved to module ./lib/_general.ts |
fprec.c           |done  | no |  Returns the value of x rounded to "digits" significant  |
fround.c           |done | no | fround function |
fsign.c           |done | no |  This function performs transfer of sign.  |
ftrunc.c           | done| no | floating point truncation |
gamma.c           |done  ./lib/gamma_fn.ts | no | [gammafn](https://en.wikipedia.org/wiki/Gamma_function) |
gamma_cody.c           | done| no | GAMMA function using algo of  W. J. Cody, |
gammalims.c           |done | no | calculates legal bounds of gamma_fn |
i1mach.c           |done | no | transferred to _general.ts |
imax2.c           |done | no | transferred to _general.ts |
imin2.c           | done| no |  transferred to _general.ts |
lbeta.c           | done| no  |  This function returns the value of the log beta function. |
lgamma.c           | done ./lib/lgamma_fn.ts | no | logarithmic gamma [lgammafn](https://en.wikipedia.org/wiki/Gamma_function) |
lgammacor.c           |done ./lib/lgammecor.ts  | no | lgammacor |
log1p.c           | done | no  | calculate log(1+x) with high accuracy for small x |
mlutils.c           |done  | no  | moved to _general.ts |
pbeta.c           |done | no  | pBeta distribution function |
pbinom.c           |done | no |   The distribution function of the binomial distribution. |
pcauchy.c           | done |no |The distribution function of the Cauchy distribution. |
pchisq.c           | done | no |  The distribution function of the chi-squared distribution. |
pexp.c           | done|no |The distribution function of the exponential distribution. |
pf.c           |done |no |  The distribution function of the F distribution. |
pgamma.c           |done | no  | This function computes the distribution function for the gamma distribution  |
pgeom.c           | done| no |  The distribution function of the geometric distribution. |
phyper.c           |done |no | The distribution function of the geometric distribution. |
plnorm.c           | done|no  |  The lognormal distribution function. |
plogis.c           | done| no |  Compute  log(1 + exp(x))  without overflow (and fast for x > 18)  |
pnbeta.c           |done |no |  pbeta  - incomplete-beta function {nowadays: pbeta_raw() -> bratio()} |
pnbinom.c           | done| no | The distribution function of the negative binomial distribution. |
pnchisq.c           | done| no |  Algorithm AS275: Computing the non-central chi-squared distribution function. |
pnf.c   |done | no | The distribution function of the non-central F distribution. |
pnorm.c  | done| no  |  normal distribution function |
pnt.c    | done| no | Cumulative probability at t of the non-central t-distribution,  with df degrees of freedom (may be fractional) and non-centrality,  parameter delta.
polygamma.c   | done| no |  Compute the derivatives of the psi function   and polygamma functions. |
ppois.c     | done | no |  The distribution function of the Poisson distribution.  |
pt.c       |done | no | t distribution. with n degrees of freedom).  |
ptukey.c    | done| no |Computes the probability that the maximum of rr studentized ranges, each based on cc means and with df degrees of freedom  for the standard error, is less than q. |
punif.c           | done| no |  The distribution function of the uniform distribution. |
pweibull.c           |done |no | The distribution function of the Weibull distribution. |
qbeta.c           | done| no | The quantile function of the beta distribution. |
qbinom.c           | done| no | The quantile function of the binomial distribution. |
qcauchy.c           | done | no |The quantile function of the Cauchy distribution. |
qchisq.c           | done | no | The quantile function of the chi-squared distribution. |
qexp.c           |done|no |    The quantile function of the exponential distribution.  |
qf.c           |done | no |  The quantile function of the F distribution. |
qgamma.c           |done | no | Compute the quantile function of the gamma distribution. |
qgeom.c           |done | no |   The quantile function of the geometric distribution. |
qhyper.c           | done| no |     The quantile function of the hyper-geometric distribution. |
qlnorm.c           | done| no  |  This the log-normal quantile function. |
qlogis.c           | done | no |  The Logistic Distribution  quantile function. |
qnbeta.c           | done| no  | the quantile function of the non-central beta distribution |
qnbinom.c           |done  | no | The quantile function of the negative binomial distribution. |
qnchisq.c           |done | no |the quantile function of the  noncentral chi-squared distribution    |
qnf.c           |done |no  | The quantile function of the non-central F distribution.  |
qnorm.c           | done| no | Compute the quantile function for the normal distribution. |
qnt.c           | done| no |  quantile function of the cumulative  probability of the non-central t-distribution |
qpois.c    |done | no | The quantile function of the Poisson distribution.|
qt.c           |done | no | The "Student" t distribution quantile function.  |
qtukey.c           |done | no | Computes the quantiles of the maximum of rr studentized ranges |
qunif.c           | done| no |   The quantile function of the uniform distribution. |
qweibull.c           | done| no | The quantile function of the Weibull distribution. |
rbeta.c           | done|no | Generating beta variates with nonintegral shape parameters. |
rbinom.c           |done |no  |	Random variates from the binomial distribution. |
rcauchy.c           |done | no | Random variates from the Cauchy distribution. |
rchisq.c           |done |no |  Random variates from the chi-squared distribution. |
rexp.c           |done | no |  Random variates from the exponential distribution. |
rf.c           | done| no |  Pseudo-random variates from an F distribution. |
rgamma.c           |done | no |   Random variates from the gamma distribution. |
rgeom.c           |done | no |  Random variates from the geometric distribution. |
rhyper.c           | done| no | Random variates from the hyper-geometric distribution. |
rlnorm.c           |done | no |  Random variates from the log-normal distribution. |
rlogis.c           | done| no |  random variates of the logistic distribution |
rmultinom.c           | done| no | Random Vector from the multinomial distribution.|
rnbinom.c           |done | no |   Random variates from the negative binomial distribution. |
rnchisq.c           | done|no  |  Random variates from the NON CENTRAL chi-squared distribution.|
rnorm.c           |done |no | Random variates from the normal distribution. |
rpois.c           | done| no | Random variates from the Poisson distribution. |
rt.c           | done| no | Pseudo-random variates from a t distribution. |
runif.c           | done| no | implemented 3 RNG and native browser/node agnostic 64 RNG map to floating number |
rweibull.c           | done| no |  Random variates from the Weibull distribution. |
sexp.c           | done | no | (Random variates from the standard exponential distribution) exp_rand (internally used) function  |
sign.c           | done| no | This function computes the  'signum(.)' function: |
signrank.c           | done | no | dsignrank: The density of the Wilcoxon Signed Rank distribution, psignrank: The distribution function of the Wilcoxon Signed Rank distribution, qsignrank: The quantile function of the Wilcoxon Signed Rank distribution, rsignrank: Random variates from the Wilcoxon Signed Rank distribution. |
snorm.c           | done| no |  Random variates from the STANDARD normal distribution  N(0,1).|
stirlerr.c           | done  | no | Computes the log of the error term in Stirling's formula ( _stirlerr_ ) |
toms708.c           |NAP | no | ported instead Java Version  from James Curran (j.curran@auckland.ac.nz) (Java version) |
wilcox.c           | node| no | dwilcox: The density of the Wilcoxon distribution, pwilcox: The distribution function of the Wilcoxon distribution, qwilcox: The quantile function of the Wilcoxon distribution,  rwilcox: Random variates from the Wilcoxon distribution. |

Also:
Examine the usage of  *R_DT_Log* and * R_DT_log* (note the one capital letter difference) functions in all codes

[some info random generation:](https://stat.ethz.ch/R-manual/R-devel/library/base/html/Random-user.html)

![equation](http://latex.codecogs.com/gif.latex?Concentration%3D%5Cfrac%7BTotalTemplate%7D%7BTotalVolume%7D)
