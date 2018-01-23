#include <math.h>
#include <stdio.h>
#include "bessel/common.h"

extern double cospi(double x) {
	if (ISNAN(x)) return ML_NAN;
	if (!R_FINITE(x)) {
		printf("argument out of domain in '%f'\n", x);
		return ML_NAN;
	}

	x = fmod(fabs(x), 2.);// cos() symmetric; cos(pi(x + 2k)) == cos(pi x) for all integer k
	if (fmod(x, 1.) == 0.5) return 0.;
	if (x == 1.)   return -1.;
	if (x == 0.)   return  1.;
	// otherwise
	return cos(M_PI * x);

}