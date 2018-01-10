static double apser(double a, double b, double x, double eps)
{
	/* -----------------------------------------------------------------------
 *     apser() yields the incomplete beta ratio  I_{1-x}(b,a)  for
 *     a <= min(eps,eps*b), b*x <= 1, and x <= 0.5,  i.e., a is very small.
 *     Use only if above inequalities are satisfied.
 * ----------------------------------------------------------------------- */

	static double const g = .577215664901533;

	double tol, c, j, s, t, aj;
	double bx = b * x;

	t = x - bx;
	if (b * eps <= 0.02)
		c = log(x) + psi(b) + g + t;
	else // b > 2e13 : psi(b) ~= log(b)
		c = log(bx) + g + t;

	tol = eps * 5. * fabs(c);
	j = 1.;
	s = 0.;
	do
	{
		j += 1.;
		t *= x - bx / j;
		aj = t / j;
		s += aj;
	} while (fabs(aj) > tol);

	return -a * (c + s);
} /* apser */