# libRmath.js
Javascript ( TypeScript ) Pure Implementation of Statistical R "core" numerical libRmath.so library found here
https://svn.r-project.org/R/trunk/src/nmath/

## Progress (DONE and TODO)

Work in progress (see list below of all c modules that need to be ported), please considering helping out and bring R core functionality
to Javascript.

I first list the modules __DONE__ so far, lets start at a positive note)

### DONE

| original c module | js/ts module name | port date | R - base functions |
|------------------|--------------------|-------------|--------------------|
sign.c           | ./lib/sign.ts| 25 March 2017 |  This function computes the  'signum(.)' function: |
rweibull.c           | ./lib/rweibull.ts| 25 March 2017 |  Random variates from the Weibull distribution. |
wilcox.c           | ./lib/wilcox.ts| 25March 2017 | dwilcox: The density of the Wilcoxon distribution,   pwilcox: The distribution function of the Wilcoxon distribution, qwilcox:	The quantile function of the Wilcoxon distribution,  rwilcox:	Random variates from the Wilcoxon distribution.  |
rt.c           | ./lib/rt.ts| 25March 2017 | Pseudo-random variates from a t distribution. |
signrank.c           | ./lib/signrank.ts| 25 March 2017 | dsignrank: The density of the Wilcoxon Signed Rank distribution, psignrank: The distribution function of the Wilcoxon Signed Rank distribution, qsignrank: The quantile function of the Wilcoxon Signed Rank distribution, rsignrank: Random variates from the Wilcoxon Signed Rank distribution. |
rpois.c           | ./lib/rpois.ts| 25 March 2017 | Random variates from the Poisson distribution. |
rnorm.c           |./lib/rnorm.ts |23 March 2017 | Random variates from the normal distribution. |
rnchisq.c           | ./lib/rnchisq.ts | 23 March 2017  |  Random variates from the NON CENTRAL chi-squared distribution.|
rnbinom.c           |./lib/rnbinom.ts | 23 March 2017 |   Random variates from the negative binomial distribution. |
rmultinom.c           | ./lib/rmultinom.ts| 23 March 2017 | 	Random Vector from the multinomial distribution.|
rlogis.c           | ./lib/rlogis.ts| 23 March 2017 |  random variates of the logistic distribution |
rlnorm.c           |./lib.rlnorm | 23 March 2017 |  Random variates from the lognormal distribution. |
rhyper.c           | ./lib/rhyper.ts| 21 March 2017 | Random variates from the hypergeometric distribution. |
rgeom.c           |./lib/rgeom.ts | 21 March 2017 |  Random variates from the geometric distribution. |
rgamma.c           |./lib/rgamma.ts | 21 march 2017 |   Random variates from the gamma distribution. |
rf.c           | ./lib/rf.ts| 21 march 2017 |  Pseudo-random variates from an F distribution. |
rexp.c           |./lib/rexp.ts | 21 march 2017 |  Random variates from the exponential distribution. |
rchisq.c           | ./lib/rchisq.ts |21 march 2017 |  Random variates from the chi-squared distribution. |
rcauchy.c           |./lib/rcauchy.ts | 21 march 2017 | Random variates from the Cauchy distribution. |
rbeta.c           | ./lib/rbeta.ts | 21 march 2017 | Generating beta variates with nonintegral shape parameters. |
rbinom.c           |./lib/rbindom.ts | 21 March 2017  |	Random variates from the binomial distribution. |
qweibull.c           | ./lib/qweibull.ts | 20 March 2017 | The quantile function of the Weibull distribution. |
qtukey.c           |./lib/qtukey.ts | 20 March 2017 | Computes the quantiles of the maximum of rr studentized ranges |
qt.c           |./lib/qt.ts | 20 March 2017 | The "Student" t distribution quantile function.  |
qpois.c    | ./lib/qpois.ts | 19 March 2017 | The quantile function of the Poisson distribution.|
qnt.c           | ./lib/qnt.ts| 19 March 2017 |  quantily function of the commulative  probability of the non-central t-distribution |
qnchisq.c           | ./lib/qnchisq.ts | 19 March |the quantile function of the  noncentral chi-squared distribution  |
qnf.c           | ./lib/qnf.ts  | 19 March  | The quantile function of the non-central F distribution.  |
qnbinom.c           |./lib/qnbinom.ts  | 19 March 2017 | The quantile function of the negative binomial distribution. |
qnbeta.c           | ./lib/qnbeta.ts| 19 March 2017 | the quantile function of the noncentral beta distribution |
qlnorm.c           | ./lib/qlnorm.ts | 19 March 2017  |  This the lognormal quantile function. |
qhyper.c           | ./lib/qhyper.ts | 19 March 2017|     The quantile function of the hypergeometric distribution. |
qgeom.c           | ./lib/qgeom.ts | 19 March 2017 |   The quantile function of the geometric distribution. |
qgamma.c           |./lib/qgamma.ts | 18 March 2017 | Compute the quantile function of the gamma distribution. |
qf.c           |./lib/qf.ts |  18 March 2017  |  The quantile function of the F distribution. |
qexp.c           |./lib/qexp.ts| 18 March 2017  |    The quantile function of the exponential distribution.  |
qcauchy.c           | ./lib/qcauchy.ts |  18 March 2017 |The quantile function of the Cauchy distribution. |
qchisq.c           | ./lib/qchisq.ts | 18 Match 2017 | The quantile function of the chi-squared distribution. |
qbinom.c           | ./lib/qbinom.ts|18 March 2017 | The quantile function of the binomial distribution. |
qbeta.c           | ./lib/qbeta.ts| 18 March 2017 | The quantile function of the beta distribution.   |
pweibull.c           |./lib/pweibull.ts |18 Match 2017  | The distribution function of the Weibull distribution. |
punif.c           | ./lib/punif.ts | 18 Match 2017 |  The distribution function of the uniform distribution. |
ptukey.c           |./lib/ptukey.ts| 18 March 2017 |Computes the probability that the maximum of rr studentized ranges, each based on cc means and with df degrees of freedom  for the standard error, is less than q. |
pnorm.c           | ./lib/pnorm.ts| 17 March 2017  |  normal distribution function |
ppois.c           | ./lib/pois.ts | 17 March 2017 |  The distribution function of the Poisson distribution.  |
pt.c           | ./lib/pt.ts | 16 March | t distrib. with n degrees of freedom).  |
polygamma.c           | ./lib/polygamma.c| 16 March |  Compute the derivatives of the psi function   and polygamma functions. |
pnt.c           | ./lib/pnt.ts|  16 March | Cumulative probability at t of the non-central t-distribution,  with df degrees of freedom (may be fractional) and non-centrality,  parameter delta.|
pnf.c           |./lib/pnf.ts| 15 March |	The distribution function of the non-central F distribution.|
|pnchisq.c    | ./lib/pnchisq.tc | 14 March  |  Algorithm AS275: Computing the non-central chi-squared distribution function. |
pnbinom.c           | ./lib/pnbinom.ts | 14 March | The distribution function of the negative binomial distribution. |
pnbeta.c           |./lib/pnbeta.ts |14 March |  pbeta  - incomplete-beta function {nowadays: pbeta_raw() -> bratio()} |
plogis.c           | ./lib/plogis.ts| 14 March |  Compute  log(1 + exp(x))  without overflow (and fast for x > 18)  |
plnorm.c     | ./lib/plnorm.ts | 14 March |n The lognormal distribution function. |
|phyper.c    | ./lib/phyper.ts | 14 March | The distribution function of the geometric distribution. |
|pgamma.c    | ./lib/pgamma.ts |  14 March | This function computes the distribution function for the gamma distribution  |
|pgeom.c     | ./lib/pgeom.ts|  14 March |  The distribution function of the geometric distribution. |
|pf.c   | ./lib/pf.ts | 14 March 2017 |  The distribution function of the F distribution. |
|pexp.c           |./lib/pexp.ts| 14 March 2017 |The distribution function of the exponential distribution. |
|pcauchy.c    | ./lib/pauchy.ts | 14 March 2017| The distribution function of the Cauchy distribution. |
|pchisq.c     | ./lib/pschisq.ts | 14 March 2017| The distribution function of the chi-squared distribution. |
| pbinom.c | ./lib/pbinom.ts | 14 March 2017 |   The distribution function of the binomial distribution. |
| Toms708.java | ./lib/Toms708.ts | 14 March 2017 | from Java Version  James Curran (j.curran@auckland.ac.nz) (Java version)  |
| pbeta.c | ./lib/pbeta.ts | 14 March 2017 | beta distribution function  |
| pnorm.c| ./lib/pnorm.ts | 9 March 2017 |  Normal distribution function |
| gammalims.c | ./lib/gammalims.ts | 5 march 2017 | calculates legal bounds of gamme_fn|
| fround.c | ./lib/fround.ts | 5 march 2017 | rounds off to a set number of digites |
| fprec.c | ./lib/fprec.ts | 4 march 2017 |  Returns the value of x rounded to "digits" significant |
| expm1.c | ./lib/expm1.ts | 4 march 2017  | Compute the Exponential minus 1 |
| dweibull.c | ./lib/dweibull.ts | 4 march 2017  | The density function of the Weibull distribution.|
| dt.c | ./lib/dt.ts| 4 March 2017 |  The t density |
| dpois.c | ./lib/dpois.ts | 4 March 2017 |  dpois() computes the Poisson probability  lb^x exp(-lb) / x! |
| dnchisq.c | ./lib/dnchisq.ts | 4 March 2017|  The density of the noncentral chi-squared distribution with "df" |
| dnt.c | ./lib/dnt.ts| 4 March 2017 |  Computes the density of the noncentral beta distribution with |
| dnorm.c | ./lib/dnorm.ts | 25 feb 2017 | Compute the density of the normal distribution. |
| dnf.c | ./lib/dnt.ts | 25 feb 2017  | The density function of the non-central F distribution |
| dnbinom.c | ./lib/dnbinom.ts | 25 feb 2017 | Computes the negative binomial distribution. |
| dlogis.c | ./lib/dlogis.ts | 4 March 2017 | The density of the Logistic Distribution  |
| dlnorm.c | ./lib/dlnorm.ts |4 March 2017|The density of the lognormal distribution.|
| dhyper.c | ./lib/dhyper.ts | 4 March 2017 |  The hypergeometric probability |
| dgeom.c | ./lib/dgeom.ts | 4 March 2017 |   Computes the geometric probabilities, Pr(X=x) = p(1-p)^x. |
| dnbeta.c | ./lib/dnbeta.ts | 4 March 2017 |  Computes the density of the noncentral beta distribution with |
| pgamma.c | ./lib/pgamme.ts | 9 March 2017 | This function computes the distribution function for the gamma distribution |
| dcauchy.c| ./lib/dcauchy.ts| 27 feb 2017  | The density of the Cauchy distribution. |
| dexp.c | ./lib/dexp.ts | 27 feb 2017 | The density of the exponential distribution. |
| df.c | ./lib/df.ts | 27 feb 2017  |  The density function of the F distribution.|
| dchisq.c  | ./lib/dchisq.ts|  feb 27, 2017| The density of the chi-squared distribution. |
| dgamma.c | ./lib/dgamma.ts | 27 feb 2017 |  Computes the density of the gamma distribution |
| fmax2.c | part of ./lib/_general.ts |  25 jan 2017 | this function is moved to module ./lib/_general.ts |
| fmin2.c  | part of ./lib/_general.ts| 25 jan 2017 |  this function is moved to module ./lib/_general.ts |
| fsign.c |  ./lib/fsign.ts |    MArch 5, 2017 |  This function performs transfer of sign.  |
| ftrunc.c | part of ./lib/_general.ts | March 5 2017  | floating point truncation |
| lbeta.c | ./lib/lbeta.ts | March 2 2017 |  This function returns the value of the log beta function.|
| C99 gamma function | ./lib/c99_gamma.ts | 25 feb 2017 | added C99 gamma and lgamma, |
|dnbinom.c | ./lib/dnbinom.ts | 25 feb 2017 | negative binomial distribution.
|dbeta.c           |  ./lib/dbeta.ts | 25 feb 2017  | R "dbeta" beta distribution function  |
|dbinom.c           | ./lib/dbinom.ts  | 25 feb 2017 | probability mass function of binomial distribution |
|log1p.c | ./lib/log1p.ts | 25 feb 2017| calculate log(1+x) for small value of x|
|choose.c           | choose.ts | 21 feb 2017 | R "choose" function, C(n,k) binomial coefficients |
|gamma_cody.c      | gamme_cody.ts| 19 feb 2017| GAMMA function using algo of  W. J. Cody, |
|bessel_i.c           | bessel_i.ts  | 19 feb 2017 | besseli |
|bessel_j.c           | bessel_j.ts | 19 feb 2017 | besselj  |
|bessel_k.c           | bessel_k.ts | 19 feb 2017 | besselK |
|bessel_y.c           | bessel_y.ts |  19 feb 2017 | bessely  |
|sexp.c           | ./sexp.ts| 8-feb-2017 | (Random variates from the standard exponential distribution) exp_rand (internally used) function  |
|dunif.c           | ./dunif.ts| 8-feb-2017 | R "dunif" function  |
|bessel_k.c           | ./bessel_k.ts| 8-feb-2017 | R "besselK" function http://www.netlib.org/specfun/rkbesl |
|runif.c           | ./runif.ts| 4-feb-2017 | implemented 3 RNG and native browser/node agnostic 64 RNG map to floating number |
|bd0.c           | ./lib/bd0.ts |23-jan-2017 | hidden, used by modules dbinom.c ,dpois.c dt.c |
|beta.c           |./lib/beta.ts  | 23-jan-2017 | [beta](https://en.wikipedia.org/wiki/Beta_function) |
|chebyshev.c           | ./lib/chebyshev.ts | 23-jan-2017 | chebyshev\_init , chebyshev\_eval |
|cospi.c           | ./lib/cospi.ts | 23-jan-2017 | cospi, sinpi, tanpi |
|gamma.c           |./lib/gamma_fn.ts | 23-jan-2017 | [gammafn] gamme function(https://en.wikipedia.org/wiki/Gamma_function) |
|lgamma.c           | ./lib/lgamma_fn.ts | 23-jan-2017 | logarithmic gamma [lgammafn](https://en.wikipedia.org/wiki/Gamma_function) |
|lgammacor.c           |./lib/lgammecor.ts  | 23-jan-2017 | lgammacor |
|stirlerr.c           | ./lib/stirlerr | 23-jan-2017 | Computes the log of the error term in Stirling's formula ( _stirlerr_ ) |


### TODO



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
cospi.c           | done ./lib/cospi.ts | no| cospi, sinpi, tanpi |
d1mach.c           |done | no | included in ./_general.ts |
dbeta.c           |  done | no  | distribution function of beta |
dbinom.c           | done  | no | probability mass function of binomial distribution |
dcauchy.c           | done| no | The density of the Cauchy distribution. |
dchisq.c           | done| no | The density of the chi-squared distribution. |
dexp.c           |done | no  | The density of the exponential distribution. |
df.c           | done | no  |  The density function of the F distribution.|
dgamma.c           | done| no  |  Computes the density of the gamma distribution, |
dgeom.c           |done |no  | Computes the geometric probabilities, Pr(X=x) = p(1-p)^x |
dhyper.c           |done | no  |  The hypergeometric probability |
dlnorm.c           |done | no |   The density of the lognormal distribution. |
dlogis.c           | done| no |  The density of the Logistic Distribution |
dnbeta.c           |done | no |  Computes the density of the noncentral beta distribution with |
dnbinom.c           |done | no  | negative binomial probability prob mass function |
dnchisq.c           |done | no |   The density of the noncentral chi-squared distribution with "df" |
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
pt.c       |done | no | t distrib. with n degrees of freedom).  |
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
qhyper.c           | done| no |     The quantile function of the hypergeometric distribution. |
qlnorm.c           | done| no  |  This the lognormal quantile function. |
qlogis.c           | done | no |  The Logistic Distribution  quantile function. |
qnbeta.c           | done| no  | the quantile function of the noncentral beta distribution |
qnbinom.c           |done  | no | The quantile function of the negative binomial distribution. |
qnchisq.c           |done | no |the quantile function of the  noncentral chi-squared distribution    |
qnf.c           |done |no  | The quantile function of the non-central F distribution.  |
qnorm.c           | done| no | Compute the quantile function for the normal distribution. |
qnt.c           | done| no |  quantily function of the commulative  probability of the non-central t-distribution |
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
rhyper.c           | done| no | Random variates from the hypergeometric distribution. |
rlnorm.c           |done | no |  Random variates from the lognormal distribution. |
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
snorm.c           | TODO| | |
stirlerr.c           | done  | no | Computes the log of the error term in Stirling's formula ( _stirlerr_ ) |
toms708.c           |NAP | no | ported instead Java Version  from James Curran (j.curran@auckland.ac.nz) (Java version) |
wilcox.c           | node| no | dwilcox: The density of the Wilcoxon distribution, pwilcox: The distribution function of the Wilcoxon distribution, qwilcox: The quantile function of the Wilcoxon distribution,  rwilcox: Random variates from the Wilcoxon distribution. |

Also:
Examine the usage of  *R_DT_Log* and * R_DT_log* (note the one captial letter difference) functions in all codes