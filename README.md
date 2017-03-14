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
| dnchisq.c | ./lib/dnchisq.ts |  The density of the noncentral chi-squared distribution with "df" |
| dnt.c | ./lib/dnt.ts| 4 March 2017 |  Computes the density of the noncentral beta distribution with |
| dnorm.c | ./lib/dnorm.ts | 25 feb 2017 | Compute the density of the normal distribution. |
| dnf.c | ./lib/dnt.ts | 25 feb 2017  | The density function of the non-central F distribution |
| dnbinom.c | ./lib/dnbinom.ts | 25 feb 2017 | Computes the negative binomial distribution. |
| dlogis.c | ./lib/dlogis.ts | 4 March 2017 | not sure what it does |
| dlnorm.c | ./lib/dlnorm.ts |4 March 2017|The density of the lognormal distribution.|
| dhyper.c | ./lib/dhyper.ts | 4 March 2017 |  The hypergeometric probability |
| dgeom.c | ./lib/dgeom.ts | 4 March 2017 |   Computes the geometric probabilities, Pr(X=x) = p(1-p)^x. |
| dnbeta.c | ./lib/dnbeta.ts | 4 March 2017 |  Computes the density of the noncentral beta distribution with |
| pgamma.c | ./lib/pgamme.ts | 9 March 2017 | This function computes the distribution function for the gamma distribution |
| dgamma.c | ./lib/dgamma.ts | 27 feb 2017 |  Computes the density of the gamma distribution |
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
bd0.c           | done ./lib/bd0.ts | no | hidden, used by modules dbinom.c ,dpois.c dt.c |       
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
dcauchy.c           | TODO| | |
dchisq.c           | TODO| | |
dexp.c           |TODO | | |
df.c           | TODO| | |
dgamma.c           | done| no  |  Computes the density of the gamma distribution, |
dgeom.c           |done |no  | Computes the geometric probabilities, Pr(X=x) = p(1-p)^x |
dhyper.c           |done | no  |  The hypergeometric probability |
dlnorm.c           |TODO | | |
dlogis.c           | TODO| | |
dnbeta.c           |done | no |  Computes the density of the noncentral beta distribution with |
dnbinom.c           |done | no  | negative binomial probability prob mass function |
dnchisq.c           |TODO | | |
dnf.c           |done | no | The density function of the non-central F distribution |
dnorm.c           |done  | no  |  Compute the density of the normal distribution. |
dnt.c           |done | no | the non-central t density |
dpois.c           | done| no  |  dpois() computes the Poisson probability  lb^x exp(-lb) / x! |
dt.c           |done | no |  The t density  |
dunif.c           | done| no | R "dunif" function  |
dweibull.c           | done| no  |  The density function of the Weibull distribution. |
expm1.c           |done | no  | Compute the Exponential minus 1 |
fmax2.c           |TODO | | |
fmin2.c           | TODO| | |
fprec.c           |done  | no |  Returns the value of x rounded to "digits" significant  |
fround.c           |done | no | fround function |
fsign.c           |TODO | | |
ftrunc.c           | TODO| | |
gamma.c           |done  ./lib/gamma_fn.ts | no | [gammafn](https://en.wikipedia.org/wiki/Gamma_function) |
gamma_cody.c           | done| no | GAMMA function using algo of  W. J. Cody, |
gammalims.c           |done | no | calculates legal bounds of gamma_fn |
i1mach.c           |TODO | | |
imax2.c           |TODO | | |
imin2.c           | TODO| | |
lbeta.c           | done| no  |  This function returns the value of the log beta function. |
lgamma.c           | done ./lib/lgamma_fn.ts | no | logarithmic gamma [lgammafn](https://en.wikipedia.org/wiki/Gamma_function) |
lgammacor.c           |done ./lib/lgammecor.ts  | no | lgammacor |
log1p.c           | done | no  | calculate log(1+x) with high accuracy for small x |
mlutils.c           |TODO | | |
pbeta.c           |done | no  | pBeta distribution function |
pbinom.c           |TODO | | |
pcauchy.c           | TODO| | |
pchisq.c           | TODO| | |
pexp.c           | TODO| | |
pf.c           |TODO | | |
pgamma.c           |done | no  | 	This function computes the distribution function for the	gamma distribution  |
pgeom.c           | TODO| | |
phyper.c           |TODO | | |
plnorm.c           | TODO| | |
plogis.c           | TODO| | |
pnbeta.c           |TODO | | |
pnbinom.c           | TODO| | |
pnchisq.c           | TODO| | |
pnf.c           |TODO | | |
pnorm.c           | done| no  |  normal distribution function |
pnt.c           | TODO| | |
polygamma.c           | TODO| | |
ppois.c           | TODO| | |
pt.c           |TODO | | |
ptukey.c           | TODO| | |
punif.c           | TODO| | |
pweibull.c           |TODO | | |
qbeta.c           | TODO| | |
qbinom.c           | TODO| | |
qcauchy.c           | TODO| | |
qchisq.c           |TODO | | |
qexp.c           |TODO | | |
qf.c           |TODO | | |
qgamma.c           |TODO | | |
qgeom.c           |TODO | | |
qhyper.c           | TODO| | |
qlnorm.c           | TODO| | |
qlogis.c           | TODO| | |
qnbeta.c           | TODO| | |
qnbinom.c           | TODO| | |
qnchisq.c           |TODO | | |
qnf.c           |TODO | | |
qnorm.c           | TODO| | |
qnt.c           | TODO| | |
qpois.c                           |TODO | | |                                                                                               
qt.c           |TODO | | |
qtukey.c           |TODO | | |
qunif.c           | TODO| | |
qweibull.c           | TODO| | |
rbeta.c           | TODO| | |
rbinom.c           |TODO | | |
rcauchy.c           |TODO | | |
rchisq.c           |TODO | | |
rexp.c           |TODO | | |
rf.c           | TODO| | |
rgamma.c           |TODO | | |
rgeom.c           |TODO | | |
rhyper.c           | TODO| | |
rlnorm.c           |TODO | | |
rlogis.c           | TODO| | |
rmultinom.c           | TODO| | |
rnbinom.c           |TODO | | |
rnchisq.c           | TODO| | |
rnorm.c           |TODO | | |
rpois.c           | TODO| | |
rt.c           | TODO| | |
runif.c           | done| no | implemented 3 RNG and native browser/node agnostic 64 RNG map to floating number |
rweibull.c           | TODO| | |
sexp.c           | done | no  | (Random variates from the standard exponential distribution) exp_rand (internally used) function  |
sign.c           | TODO| | |
signrank.c           | TODO| | |
snorm.c           | TODO| | |
stirlerr.c           | done ./lib/stirlerr | no | Computes the log of the error term in Stirling's formula ( _stirlerr_ ) |
toms708.c           |NAP | no | ported instead Java Version  from James Curran (j.curran@auckland.ac.nz) (Java version) |
wilcox.c           | TODO| | |

