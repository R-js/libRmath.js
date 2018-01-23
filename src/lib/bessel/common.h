#pragma once

#include <math.h>

#include <stdbool.h>

#define R_FINITE(x)    isfinite(x)

#define ML_ERR_return_NAN { ML_ERROR(ME_DOMAIN, ""); return ML_NAN; }

#define ML_POSINF	INFINITY
#define ML_NEGINF	-INFINITY
#define ML_NAN		NAN

#define ISNAN(x) (isnan(x)!=0)

#define ML_VALID(x)	(!ISNAN(x))

#define ME_NONE		0
/*	no error */
#define ME_DOMAIN	1
/*	argument out of domain */
#define ME_RANGE	2
/*	value out of range */
#define ME_NOCONV	4
/*	process did not converge */
#define ME_PRECISION	8
/*	does not have "full" precision */
#define ME_UNDERFLOW	16
/*	and underflow occured (important for IEEE)*/

#define ML_ERR_return_NAN { ML_ERROR(ME_DOMAIN, ""); return ML_NAN; }

#define MATHLIB_ERROR(fmt,x)  printf(fmt,x)
#define MATHLIB_WARNING(msg, s) printf(msg, s)
#define MATHLIB_WARNING2(fmt,x,x2)	printf(fmt,x,x2)
#define MATHLIB_WARNING3(fmt,x,x2,x3)	printf(fmt,x,x2,x3)
#define MATHLIB_WARNING4(fmt,x,x2,x3,x4) printf(fmt,x,x2,x3,x4)
#define MATHLIB_WARNING5(fmt,x,x2,x3,x4,x5) printf(fmt,x,x2,x3,x4,x5)


#define ML_ERROR(x, s) { \
   if(x > ME_DOMAIN) { \
       char *msg = ""; \
       switch(x) { \
       case ME_DOMAIN: \
	   msg = "argument out of domain in '%s'\n";	\
	   break; \
       case ME_RANGE: \
	   msg = "value out of range in '%s'\n";	\
	   break; \
       case ME_NOCONV: \
	   msg = "convergence failed in '%s'\n";	\
	   break; \
       case ME_PRECISION: \
	   msg = "full precision may not have been achieved in '%s'\n"; \
	   break; \
       case ME_UNDERFLOW: \
	   msg = "underflow occurred in '%s'\n";	\
	   break; \
       } \
       printf(msg, s); \
   } \
}



#define M_PI 3.141592653589793238462643383279502884197169399375

#define PI             M_PI
#include <float.h>  /* Defines the rest, at least in C99 */
#define SINGLE_EPS     FLT_EPSILON
#define SINGLE_BASE    FLT_RADIX
#define SINGLE_XMIN    FLT_MIN
#define SINGLE_XMAX    FLT_MAX
#define DOUBLE_DIGITS  DBL_MANT_DIG
#define DOUBLE_EPS     DBL_EPSILON
#define DOUBLE_XMAX    DBL_MAX
#define DOUBLE_XMIN    DBL_MIN

extern double sinpi(double x);
extern double cospi(double x);
extern double Rf_gamma_cody(double x);
extern double bessel_y(double x, double alpha);
extern double bessel_j(double x, double alpha);
extern double bessel_k(double x, double alpha, bool expo);
extern double bessel_i(double x, double alpha, bool expo);

typedef struct {
	double x;
	int	nb;
	int ncalc;
} BesselRC;