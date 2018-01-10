static double brcmp1(int mu, double a, double b, double x, double y, int give_log)
{
	/* -----------------------------------------------------------------------
 *          Evaluation of    exp(mu) * x^a * y^b / beta(a,b)
 * ----------------------------------------------------------------------- */

	static double const__ = .398942280401433; /* == 1/sqrt(2*pi); */
	/* R has  M_1_SQRT_2PI */

	/* Local variables */
	double c, t, u, v, z, a0, b0, apb;

	a0 = min(a, b);
	if (a0 < 8.)
	{
		double lnx, lny;
		if (x <= .375)
		{
			lnx = log(x);
			lny = alnrel(-x);
		}
		else if (y > .375)
		{
			// L11:
			lnx = log(x);
			lny = log(y);
		}
		else
		{
			lnx = alnrel(-y);
			lny = log(y);
		}

		// L20:
		z = a * lnx + b * lny;
		if (a0 >= 1.)
		{
			z -= betaln(a, b);
			return esum(mu, z, give_log);
		}
		// else :
		/* ----------------------------------------------------------------------- */
		/*              PROCEDURE FOR A < 1 OR B < 1 */
		/* ----------------------------------------------------------------------- */
		// L30:
		b0 = max(a, b);
		if (b0 >= 8.)
		{
			/* L80:                  ALGORITHM FOR b0 >= 8 */
			u = gamln1(a0) + algdiv(a0, b0);
			R_ifDEBUG_printf(" brcmp1(mu,a,b,*): a0 < 1, b0 >= 8;  z=%.15g\n", z);
			return give_log
					   ? log(a0) + esum(mu, z - u, TRUE)
					   : a0 * esum(mu, z - u, FALSE);
		}
		else if (b0 <= 1.)
		{
			//                   a0 < 1, b0 <= 1
			double ans = esum(mu, z, give_log);
			if (ans == (give_log ? ML_NEGINF : 0.))
				return ans;

			apb = a + b;
			if (apb > 1.)
			{
				// L40:
				u = a + b - 1.;
				z = (gam1(u) + 1.) / apb;
			}
			else
			{
				z = gam1(apb) + 1.;
			}
			// L50:
			c = give_log
					? log1p(gam1(a)) + log1p(gam1(b)) - log(z)
					: (gam1(a) + 1.) * (gam1(b) + 1.) / z;
			R_ifDEBUG_printf(" brcmp1(mu,a,b,*): a0 < 1, b0 <= 1;  c=%.15g\n", c);
			return give_log
					   ? ans + log(a0) + c - log1p(a0 / b0)
					   : ans * (a0 * c) / (a0 / b0 + 1.);
		}
		// else:               algorithm for	a0 < 1 < b0 < 8
		// L60:
		u = gamln1(a0);
		int n = (int)(b0 - 1.);
		if (n >= 1)
		{
			c = 1.;
			for (int i = 1; i <= n; ++i)
			{
				b0 += -1.;
				c *= b0 / (a0 + b0);
				/* L61: */
			}
			u += log(c); // TODO?: log(c) = log( prod(...) ) =  sum( log(...) )
		}
		// L70:
		z -= u;
		b0 += -1.;
		apb = a0 + b0;
		if (apb > 1.)
		{
			// L71:
			t = (gam1(apb - 1.) + 1.) / apb;
		}
		else
		{
			t = gam1(apb) + 1.;
		}
		R_ifDEBUG_printf(" brcmp1(mu,a,b,*): a0 < 1 < b0 < 8;  t=%.15g\n", t);
		// L72:
		return give_log
				   ? log(a0) + esum(mu, z, TRUE) + log1p(gam1(b0)) - log(t) // TODO? log(t) = log1p(..)
				   : a0 * esum(mu, z, FALSE) * (gam1(b0) + 1.) / t;
	}
	else
	{

		/* ----------------------------------------------------------------------- */
		/*              PROCEDURE FOR A >= 8 AND B >= 8 */
		/* ----------------------------------------------------------------------- */
		// L100:
		double h, x0, y0, lambda;
		if (a > b)
		{
			// L101:
			h = b / a;
			x0 = 1. / (h + 1.); // => lx0 := log(x0) = 0 - log1p(h)
			y0 = h / (h + 1.);
			lambda = (a + b) * y - b;
		}
		else
		{
			h = a / b;
			x0 = h / (h + 1.); // => lx0 := log(x0) = - log1p(1/h)
			y0 = 1. / (h + 1.);
			lambda = a - (a + b) * x;
		}
		double lx0 = -log1p(b / a); // in both cases

		R_ifDEBUG_printf(" brcmp1(mu,a,b,*): a,b >= 8;	x0=%.15g, lx0=log(x0)=%.15g\n",
						 x0, lx0);
		// L110:
		double e = -lambda / a;
		if (fabs(e) > 0.6)
		{
			// L111:
			u = e - log(x / x0);
		}
		else
		{
			u = rlog1(e);
		}

		// L120:
		e = lambda / b;
		if (fabs(e) > 0.6)
		{
			// L121:
			v = e - log(y / y0);
		}
		else
		{
			v = rlog1(e);
		}

		// L130:
		z = esum(mu, -(a * u + b * v), give_log);
		return give_log
				   ? log(const__) + (log(b) + lx0) / 2. + z - bcorr(a, b)
				   : const__ * sqrt(b * x0) * z * exp(-bcorr(a, b));
	}

} /* brcmp1 */