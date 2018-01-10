static double basym(double a, double b, double lambda, double eps, int log_p)
{
/* ----------------------------------------------------------------------- */
/*     ASYMPTOTIC EXPANSION FOR I_x(A,B) FOR LARGE A AND B. */
/*     LAMBDA = (A + B)*Y - B  AND EPS IS THE TOLERANCE USED. */
/*     IT IS ASSUMED THAT LAMBDA IS NONNEGATIVE AND THAT */
/*     A AND B ARE GREATER THAN OR EQUAL TO 15. */
/* ----------------------------------------------------------------------- */

/* ------------------------ */
/*     ****** NUM IS THE MAXIMUM VALUE THAT N CAN TAKE IN THE DO LOOP */
/*            ENDING AT STATEMENT 50. IT IS REQUIRED THAT NUM BE EVEN. */
#define num_IT 20
	/*            THE ARRAYS A0, B0, C, D HAVE DIMENSION NUM + 1. */

	static double const e0 = 1.12837916709551;	 /* e0 == 2/sqrt(pi) */
	static double const e1 = .353553390593274;	 /* e1 == 2^(-3/2)   */
	static double const ln_e0 = 0.120782237635245; /* == ln(e0) */

	double a0[num_IT + 1], b0[num_IT + 1], c[num_IT + 1], d[num_IT + 1];

	double f = a * rlog1(-lambda / a) + b * rlog1(lambda / b), t;
	if (log_p)
		t = -f;
	else
	{
		t = exp(-f);
		if (t == 0.)
		{
			return 0; /* once underflow, always underflow .. */
		}
	}
	double z0 = sqrt(f),
		   z = z0 / e1 * 0.5,
		   z2 = f + f,
		   h, r0, r1, w0;

	if (a < b)
	{
		h = a / b;
		r0 = 1. / (h + 1.);
		r1 = (b - a) / b;
		w0 = 1. / sqrt(a * (h + 1.));
	}
	else
	{
		h = b / a;
		r0 = 1. / (h + 1.);
		r1 = (b - a) / a;
		w0 = 1. / sqrt(b * (h + 1.));
	}

	a0[0] = r1 * .66666666666666663;
	c[0] = a0[0] * -0.5;
	d[0] = -c[0];
	double j0 = 0.5 / e0 * erfc1(1, z0),
		   j1 = e1,
		   sum = j0 + d[0] * w0 * j1;

	double s = 1.,
		   h2 = h * h,
		   hn = 1.,
		   w = w0,
		   znm1 = z,
		   zn = z2;
	for (int n = 2; n <= num_IT; n += 2)
	{
		hn *= h2;
		a0[n - 1] = r0 * 2. * (h * hn + 1.) / (n + 2.);
		int np1 = n + 1;
		s += hn;
		a0[np1 - 1] = r1 * 2. * s / (n + 3.);

		for (int i = n; i <= np1; ++i)
		{
			double r = (i + 1.) * -0.5;
			b0[0] = r * a0[0];
			for (int m = 2; m <= i; ++m)
			{
				double bsum = 0.;
				for (int j = 1; j <= m - 1; ++j)
				{
					int mmj = m - j;
					bsum += (j * r - mmj) * a0[j - 1] * b0[mmj - 1];
				}
				b0[m - 1] = r * a0[m - 1] + bsum / m;
			}
			c[i - 1] = b0[i - 1] / (i + 1.);

			double dsum = 0.;
			for (int j = 1; j <= i - 1; ++j)
			{
				dsum += d[i - j - 1] * c[j - 1];
			}
			d[i - 1] = -(dsum + c[i - 1]);
		}

		j0 = e1 * znm1 + (n - 1.) * j0;
		j1 = e1 * zn + n * j1;
		znm1 = z2 * znm1;
		zn = z2 * zn;
		w *= w0;
		double t0 = d[n - 1] * w * j0;
		w *= w0;
		double t1 = d[np1 - 1] * w * j1;
		sum += t0 + t1;
		if (fabs(t0) + fabs(t1) <= eps * sum)
		{
			break;
		}
	}

	if (log_p)
		return ln_e0 + t - bcorr(a, b) + log(sum);
	else
	{
		double u = exp(-bcorr(a, b));
		return e0 * t * u * sum;
	}

} /* basym_ */