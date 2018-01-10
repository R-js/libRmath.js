
static double bpser(double a, double b, double x, double eps, int log_p)
{
	/* -----------------------------------------------------------------------
 * Power SERies expansion for evaluating I_x(a,b) when
 *	       b <= 1 or b*x <= 0.7.   eps is the tolerance used.
 * ----------------------------------------------------------------------- */

	int i, m;
	double ans, c, n, t, u, w, z, a0, b0, apb, tol, sum;

	if (x == 0.)
	{
		return R_D__0;
	}
	/* ----------------------------------------------------------------------- */
	/*	      compute the factor  x^a/(a*Beta(a,b)) */
	/* ----------------------------------------------------------------------- */
	a0 = min(a, b);
	if (a0 >= 1.)
	{ /*		 ------	 1 <= a0 <= b0  ------ */
		z = a * log(x) - betaln(a, b);
		ans = log_p ? z - log(a) : exp(z) / a;
	}
	else
	{
		b0 = max(a, b);

		if (b0 < 8.)
		{

			if (b0 <= 1.)
			{ /*	 ------	 a0 < 1	 and  b0 <= 1  ------ */

				if (log_p)
				{
					ans = a * log(x);
				}
				else
				{
					ans = pow(x, a);
					if (ans == 0.) /* once underflow, always underflow .. */
						return ans;
				}
				apb = a + b;
				if (apb > 1.)
				{
					u = a + b - 1.;
					z = (gam1(u) + 1.) / apb;
				}
				else
				{
					z = gam1(apb) + 1.;
				}
				c = (gam1(a) + 1.) * (gam1(b) + 1.) / z;

				if (log_p) /* FIXME ? -- improve quite a bit for c ~= 1 */
					ans += log(c * (b / apb));
				else
					ans *= c * (b / apb);
			}
			else
			{ /* 	------	a0 < 1 < b0 < 8	 ------ */

				u = gamln1(a0);
				m = (int)(b0 - 1.);
				if (m >= 1)
				{
					c = 1.;
					for (i = 1; i <= m; ++i)
					{
						b0 += -1.;
						c *= b0 / (a0 + b0);
					}
					u += log(c);
				}

				z = a * log(x) - u;
				b0 += -1.; // => b0 in (0, 7)
				apb = a0 + b0;
				if (apb > 1.)
				{
					u = a0 + b0 - 1.;
					t = (gam1(u) + 1.) / apb;
				}
				else
				{
					t = gam1(apb) + 1.;
				}

				if (log_p) /* FIXME? potential for improving log(t) */
					ans = z + log(a0 / a) + log1p(gam1(b0)) - log(t);
				else
					ans = exp(z) * (a0 / a) * (gam1(b0) + 1.) / t;
			}
		}
		else
		{ /* 		------  a0 < 1 < 8 <= b0  ------ */

			u = gamln1(a0) + algdiv(a0, b0);
			z = a * log(x) - u;

			if (log_p)
				ans = z + log(a0 / a);
			else
				ans = a0 / a * exp(z);
		}
	}
	R_ifDEBUG_printf(" bpser(a=%g, b=%g, x=%g, log=%d): prelim.ans = %.14g;\n",
					 a, b, x, log_p, ans);
	if (ans == R_D__0 || (!log_p && a <= eps * 0.1))
	{
		return ans;
	}

	/* ----------------------------------------------------------------------- */
	/*		       COMPUTE THE SERIES */
	/* ----------------------------------------------------------------------- */
	sum = 0.;
	n = 0.;
	c = 1.;
	tol = eps / a;

	do
	{
		n += 1.;
		c *= (0.5 - b / n + 0.5) * x;
		w = c / (a + n);
		sum += w;
	} while (n < 1e7 && fabs(w) > tol);
	if (fabs(w) > tol)
	{ // the series did not converge (in time)
		// warn only when the result seems to matter:
		if ((log_p && !(a * sum > -1. && fabs(log1p(a * sum)) < eps * fabs(ans))) ||
			(!log_p && fabs(a * sum + 1) != 1.))
			MATHLIB_WARNING5(
				" bpser(a=%g, b=%g, x=%g,...) did not converge (n=1e7, |w|/tol=%g > 1; A=%g)",
				a, b, x, fabs(w) / tol, ans);
	}
	R_ifDEBUG_printf("  -> n=%.0f iterations, |w|=%g %s %g=tol:=eps/a ==> a*sum=%g\n",
					 n, fabs(w), (fabs(w) > tol) ? ">!!>" : "<=",
					 tol, a * sum);
	if (log_p)
	{
		if (a * sum > -1.)
			ans += log1p(a * sum);
		else
			ans = ML_NEGINF;
	}
	else
		ans *= a * sum + 1.;
	return ans;
} /* bpser */