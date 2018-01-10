double fpser(double a, double b, double x, double eps, int log_p)
{
	/* ----------------------------------------------------------------------- *

 *                 EVALUATION OF I (A,B)
 *                                X

 *          FOR B < MIN(EPS, EPS*A) AND X <= 0.5

 * ----------------------------------------------------------------------- */

	double ans, c, s, t, an, tol;

	/* SET  ans := x^a : */
	if (log_p)
	{
		ans = a * log(x);
	}
	else if (a > eps * 0.001)
	{
		t = a * log(x);
		if (t < exparg(1))
		{ /* exp(t) would underflow */
			return 0.;
		}
		ans = exp(t);
	}
	else
		ans = 1.;

	/*                NOTE THAT 1/B(A,B) = B */

	if (log_p)
		ans += log(b) - log(a);
	else
		ans *= b / a;

	tol = eps / a;
	an = a + 1.;
	t = x;
	s = t / an;
	do
	{
		an += 1.;
		t = x * t;
		c = t / an;
		s += c;
	} while (fabs(c) > tol);

	if (log_p)
		ans += log1p(a * s);
	else
		ans *= a * s + 1.;
	return ans;
} /* fpser */