static double bfrac(double a, double b, double x, double y, double lambda,
					double eps, int log_p)
{
	/* -----------------------------------------------------------------------
       Continued fraction expansion for I_x(a,b) when a, b > 1.
       It is assumed that  lambda = (a + b)*y - b.
   -----------------------------------------------------------------------*/

	double c, e, n, p, r, s, t, w, c0, c1, r0, an, bn, yp1, anp1, bnp1,
		beta, alpha;

	double brc = brcomp(a, b, x, y, log_p);

	if (!log_p && brc == 0.) /* already underflowed to 0 */
		return 0.;

	c = lambda + 1.;
	c0 = b / a;
	c1 = 1. / a + 1.;
	yp1 = y + 1.;

	n = 0.;
	p = 1.;
	s = a + 1.;
	an = 0.;
	bn = 1.;
	anp1 = 1.;
	bnp1 = c / c1;
	r = c1 / c;

	/*        CONTINUED FRACTION CALCULATION */

	do
	{
		n += 1.;
		t = n / a;
		w = n * (b - n) * x;
		e = a / s;
		alpha = p * (p + c0) * e * e * (w * x);
		e = (t + 1.) / (c1 + t + t);
		beta = n + w / s + e * (c + n * yp1);
		p = t + 1.;
		s += 2.;

		/* update an, bn, anp1, and bnp1 */

		t = alpha * an + beta * anp1;
		an = anp1;
		anp1 = t;
		t = alpha * bn + beta * bnp1;
		bn = bnp1;
		bnp1 = t;

		r0 = r;
		r = anp1 / bnp1;
		if (fabs(r - r0) <= eps * r)
		{
			break;
		}

		/* rescale an, bn, anp1, and bnp1 */

		an /= bnp1;
		bn /= bnp1;
		anp1 = r;
		bnp1 = 1.;
	} while (1);

	return (log_p ? brc + log(r) : brc * r);
} /* bfrac */