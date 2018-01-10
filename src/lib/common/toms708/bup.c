static double bup(double a, double b, double x, double y, int n, double eps,
				  int give_log)
{
	/* ----------------------------------------------------------------------- */
	/*     EVALUATION OF I_x(A,B) - I_x(A+N,B) WHERE N IS A POSITIVE INT. */
	/*     EPS IS THE TOLERANCE USED. */
	/* ----------------------------------------------------------------------- */

	/* System generated locals */
	double ret_val;

	/* Local variables */
	int i, k, mu;
	double d, l, r, t;

	// Obtain the scaling factor exp(-mu) and exp(mu)*(x^a * y^b / beta(a,b))/a

	double apb = a + b,
		   ap1 = a + 1.;
	if (n > 1 && a >= 1. && apb >= ap1 * 1.1)
	{
		mu = (int)fabs(exparg(1));
		k = (int)exparg(0);
		if (mu > k)
			mu = k;
		t = (double)mu;
		d = exp(-t);
	}
	else
	{
		mu = 0;
		d = 1.;
	}

	/* L10: */
	ret_val = give_log
				  ? brcmp1(mu, a, b, x, y, TRUE) - log(a)
				  : brcmp1(mu, a, b, x, y, FALSE) / a;
	if (n == 1 ||
		(give_log && ret_val == ML_NEGINF) || (!give_log && ret_val == 0.))
		return ret_val;

	int nm1 = n - 1;
	double w = d;

	/*          LET K BE THE INDEX OF THE MAXIMUM TERM */

	k = 0;
	if (b <= 1.)
	{
		goto L40;
	}
	if (y > 1e-4)
	{
		r = (b - 1.) * x / y - a;
		if (r < 1.)
		{
			goto L40;
		}
		k = nm1;
		t = (double)nm1;
		if (r < t)
		{
			k = (int)r;
		}
	}
	else
	{
		k = nm1;
	}

	/*          ADD THE INCREASING TERMS OF THE SERIES */

	/* L30: */
	for (i = 1; i <= k; ++i)
	{
		l = (double)(i - 1);
		d = (apb + l) / (ap1 + l) * x * d;
		w += d;
		/* L31: */
	}
	if (k != nm1)
	{
	/*          ADD THE REMAINING TERMS OF THE SERIES */
	L40:
		for (i = k + 1; i <= nm1; ++i)
		{
			l = (double)(i - 1);
			d = (apb + l) / (ap1 + l) * x * d;
			w += d;
			if (d <= eps * w) /* relativ convergence (eps) */
				break;
		}
	}

	// L50: TERMINATE THE PROCEDURE
	if (give_log)
	{
		ret_val += log(w);
	}
	else
		ret_val *= w;

	return ret_val;
} /* bup */