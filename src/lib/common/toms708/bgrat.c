
static void bgrat(double a, double b, double x, double y, double *w,
				  double eps, int *ierr, Rboolean log_w)
{
/* -----------------------------------------------------------------------
*     Asymptotic Expansion for I_x(a,b)  when a is larger than b.
*     Compute   w := w + I_x(a,b)
*     It is assumed a >= 15 and b <= 1.
*     eps is the tolerance used.
*     ierr is a variable that reports the status of the results.
*
* if(log_w),  *w  itself must be in log-space;
*     compute   w := w + I_x(a,b)  but return *w = log(w):
*          *w := log(exp(*w) + I_x(a,b)) = logspace_add(*w, log( I_x(a,b) ))
* ----------------------------------------------------------------------- */

#define n_terms_bgrat 30
	double c[n_terms_bgrat], d[n_terms_bgrat];
	double bm1 = b - 0.5 - 0.5,
		   nu = a + bm1 * 0.5, /* nu = a + (b-1)/2 =: T, in (9.1) of
			     * Didonato & Morris(1992), p.362 */
		lnx = (y > 0.375) ? log(x) : alnrel(-y),
		   z = -nu * lnx; // z =: u in (9.1) of D.&M.(1992)

	if (b * z == 0.)
	{ // should not happen, but does, e.g.,
		// for  pbeta(1e-320, 1e-5, 0.5)  i.e., _subnormal_ x,
		// Warning ... bgrat(a=20.5, b=1e-05, x=1, y=9.99989e-321): ..
		MATHLIB_WARNING5(
			"bgrat(a=%g, b=%g, x=%g, y=%g): z=%g, b*z == 0 underflow, hence inaccurate pbeta()",
			a, b, x, y, z);
		/* L_Error:    THE EXPANSION CANNOT BE COMPUTED */
		*ierr = 1;
		return;
	}

	/*                 COMPUTATION OF THE EXPANSION */
	double
		/* r1 = b * (gam1(b) + 1.) * exp(b * log(z)),// = b/gamma(b+1) z^b = z^b / gamma(b)
	 * set r := exp(-z) * z^b / gamma(b) ;
	 *          gam1(b) = 1/gamma(b+1) - 1 , b in [-1/2, 3/2] */
		// exp(a*lnx) underflows for large (a * lnx); e.g. large a ==> using log_r := log(r):
		// r = r1 * exp(a * lnx) * exp(bm1 * 0.5 * lnx);
		// log(r)=log(b) + log1p(gam1(b)) + b * log(z) + (a * lnx) + (bm1 * 0.5 * lnx),
		log_r = log(b) + log1p(gam1(b)) + b * log(z) + nu * lnx,
		// FIXME work with  log_u = log(u)  also when log_p=FALSE  (??)
		// u is 'factored out' from the expansion {and multiplied back, at the end}:
		log_u = log_r - (algdiv(b, a) + b * log(nu)), // algdiv(b,a) = log(gamma(a)/gamma(a+b))
		/* u = (log_p) ? log_r - u : exp(log_r-u); // =: M  in (9.2) of {reference above} */
		/* u = algdiv(b, a) + b * log(nu);// algdiv(b,a) = log(gamma(a)/gamma(a+b)) */
		// u = (log_p) ? log_u : exp(log_u); // =: M  in (9.2) of {reference above}
		u = exp(log_u);

	if (log_u == ML_NEGINF)
	{
		R_ifDEBUG_printf(" bgrat(*): underflow log_u = -Inf  = log_r -u', log_r = %g ",
						 log_r);
		/* L_Error:    THE EXPANSION CANNOT BE COMPUTED */ *ierr = 2;
		return;
	}

	Rboolean u_0 = (u == 0.); // underflow --> do work with log(u) == log_u !
	double l =				  // := *w/u .. but with care: such that it also works when u underflows to 0:
		log_w
			? ((*w == ML_NEGINF) ? 0. : exp(*w - log_u))
			: ((*w == 0.) ? 0. : exp(log(*w) - log_u));

	R_ifDEBUG_printf(" bgrat(a=%g, b=%g, x=%g, *)\n -> u=%g, l='w/u'=%g, ",
					 a, b, x, u, l);
	double
		q_r = grat_r(b, z, log_r, eps), // = q/r of former grat1(b,z, r, &p, &q)
		v = 0.25 / (nu * nu),
		t2 = lnx * 0.25 * lnx,
		j = q_r,
		sum = j,
		t = 1., cn = 1., n2 = 0.;
	for (int n = 1; n <= n_terms_bgrat; ++n)
	{
		double bp2n = b + n2;
		j = (bp2n * (bp2n + 1.) * j + (z + bp2n + 1.) * t) * v;
		n2 += 2.;
		t *= t2;
		cn /= n2 * (n2 + 1.);
		int nm1 = n - 1;
		c[nm1] = cn;
		double s = 0.;
		if (n > 1)
		{
			double coef = b - n;
			for (int i = 1; i <= nm1; ++i)
			{
				s += coef * c[i - 1] * d[nm1 - i];
				coef += b;
			}
		}
		d[nm1] = bm1 * cn + s / n;
		double dj = d[nm1] * j;
		sum += dj;
		if (sum <= 0.)
		{
			R_ifDEBUG_printf(" bgrat(*): sum_n(..) <= 0; should not happen (n=%d)\n", n);
			/* L_Error:    THE EXPANSION CANNOT BE COMPUTED */ *ierr = 3;
			return;
		}
		if (fabs(dj) <= eps * (sum + l))
		{
			*ierr = 0;
			break;
		}
		else if (n == n_terms_bgrat)
		{ // never? ; please notify R-core if seen:
			*ierr = 4;
			MATHLIB_WARNING5(
				"bgrat(a=%g, b=%g, x=%g) *no* convergence: NOTIFY R-core!\n dj=%g, rel.err=%g\n",
				a, b, x, dj, fabs(dj) / (sum + l));
		}
	} // for(n .. n_terms..)

	/*                    ADD THE RESULTS TO W */

	if (log_w) // *w is in log space already:
		*w = logspace_add(*w, log_u + log(sum));
	else
		*w += (u_0 ? exp(log_u + log(sum)) : u * sum);
	return;
} /* bgrat */