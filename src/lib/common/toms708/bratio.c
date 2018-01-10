void attribute_hidden
bratio(double a, double b, double x, double y, double *w, double *w1,
	   int *ierr, int log_p)
{
	/* -----------------------------------------------------------------------

 *	      Evaluation of the Incomplete Beta function I_x(a,b)

 *		       --------------------

 *     It is assumed that a and b are nonnegative, and that x <= 1
 *     and y = 1 - x.  Bratio assigns w and w1 the values

 *			w  = I_x(a,b)
 *			w1 = 1 - I_x(a,b)

 *     ierr is a variable that reports the status of the results.
 *     If no input errors are detected then ierr is set to 0 and
 *     w and w1 are computed. otherwise, if an error is detected,
 *     then w and w1 are assigned the value 0 and ierr is set to
 *     one of the following values ...

 *	  ierr = 1  if a or b is negative
 *	  ierr = 2  if a = b = 0
 *	  ierr = 3  if x < 0 or x > 1
 *	  ierr = 4  if y < 0 or y > 1
 *	  ierr = 5  if x + y != 1
 *	  ierr = 6  if x = a = 0
 *	  ierr = 7  if y = b = 0
 *	  ierr = 8	(not used currently)
 *	  ierr = 9  NaN in a, b, x, or y
 *	  ierr = 10     (not used currently)
 *	  ierr = 11  bgrat() error code 1 [+ warning in bgrat()]
 *	  ierr = 12  bgrat() error code 2   (no warning here)
 *	  ierr = 13  bgrat() error code 3   (no warning here)
 *	  ierr = 14  bgrat() error code 4 [+ WARNING in bgrat()]


 * --------------------
 *     Written by Alfred H. Morris, Jr.
 *	  Naval Surface Warfare Center
 *	  Dahlgren, Virginia
 *     Revised ... Nov 1991
* ----------------------------------------------------------------------- */

	Rboolean do_swap;
	int n, ierr1 = 0;
	double z, a0, b0, x0, y0, lambda;

	/*  eps is a machine dependent constant: the smallest
 *      floating point number for which   1. + eps > 1.
 * NOTE: for almost all purposes it is replaced by 1e-15 (~= 4.5 times larger) below */
	double eps = 2. * Rf_d1mach(3); /* == DBL_EPSILON (in R, Rmath) */

	/* ----------------------------------------------------------------------- */
	*w = R_D__0;
	*w1 = R_D__0;

#ifdef IEEE_754
	// safeguard, preventing infinite loops further down
	if (ISNAN(x) || ISNAN(y) ||
		ISNAN(a) || ISNAN(b))
	{
		*ierr = 9;
		return;
	}
#endif
	if (a < 0. || b < 0.)
	{
		*ierr = 1;
		return;
	}
	if (a == 0. && b == 0.)
	{
		*ierr = 2;
		return;
	}
	if (x < 0. || x > 1.)
	{
		*ierr = 3;
		return;
	}
	if (y < 0. || y > 1.)
	{
		*ierr = 4;
		return;
	}

	/* check that  'y == 1 - x' : */
	z = x + y - 0.5 - 0.5;

	if (fabs(z) > eps * 3.)
	{
		*ierr = 5;
		return;
	}

	R_ifDEBUG_printf("bratio(a=%g, b=%g, x=%9g, y=%9g, .., log_p=%d): ",
					 a, b, x, y, log_p);
	*ierr = 0;
	if (x == 0.)
		goto L200;
	if (y == 0.)
		goto L210;

	if (a == 0.)
		goto L211;
	if (b == 0.)
		goto L201;

	eps = max(eps, 1e-15);
	Rboolean a_lt_b = (a < b);
	if (/* max(a,b) */ (a_lt_b ? b : a) < eps * .001)
	{ /* procedure for a and b < 0.001 * eps */
		// L230:  -- result *independent* of x (!)
		// *w  = a/(a+b)  and  w1 = b/(a+b) :
		if (log_p)
		{
			if (a_lt_b)
			{
				*w = log1p(-a / (a + b)); // notably if a << b
				*w1 = log(a / (a + b));
			}
			else
			{ // b <= a
				*w = log(b / (a + b));
				*w1 = log1p(-b / (a + b));
			}
		}
		else
		{
			*w = b / (a + b);
			*w1 = a / (a + b);
		}

		R_ifDEBUG_printf("a & b very small -> simple ratios (%g,%g)\n", *w, *w1);
		return;
	}

#define SET_0_noswap \
	a0 = a;          \
	x0 = x;          \
	b0 = b;          \
	y0 = y;

#define SET_0_swap \
	a0 = b;        \
	x0 = y;        \
	b0 = a;        \
	y0 = x;

	if (min(a, b) <= 1.)
	{ /*------------------------ a <= 1  or  b <= 1 ---- */

		do_swap = (x > 0.5);
		if (do_swap)
		{
			SET_0_swap;
		}
		else
		{
			SET_0_noswap;
		}
		/* now have  x0 <= 1/2 <= y0  (still  x0+y0 == 1) */

		R_ifDEBUG_printf(" min(a,b) <= 1, do_swap=%d;", do_swap);

		if (b0 < min(eps, eps * a0))
		{ /* L80: */
			*w = fpser(a0, b0, x0, eps, log_p);
			*w1 = log_p ? R_Log1_Exp(*w) : 0.5 - *w + 0.5;
			R_ifDEBUG_printf("  b0 small -> w := fpser(*) = %.15g\n", *w);
			goto L_end;
		}

		if (a0 < min(eps, eps * b0) && b0 * x0 <= 1.)
		{ /* L90: */
			*w1 = apser(a0, b0, x0, eps);
			R_ifDEBUG_printf("  a0 small -> w1 := apser(*) = %.15g\n", *w1);
			goto L_end_from_w1;
		}

		Rboolean did_bup = FALSE;
		if (max(a0, b0) > 1.)
		{ /* L20:  min(a,b) <= 1 < max(a,b)  */
			R_ifDEBUG_printf("\n L20:  min(a,b) <= 1 < max(a,b); ");
			if (b0 <= 1.)
				goto L_w_bpser;

			if (x0 >= 0.29) /* was 0.3, PR#13786 */
				goto L_w1_bpser;

			if (x0 < 0.1 && pow(x0 * b0, a0) <= 0.7)
				goto L_w_bpser;

			if (b0 > 15.)
			{
				*w1 = 0.;
				goto L131;
			}
		}
		else
		{ /*  a, b <= 1 */
			R_ifDEBUG_printf("\n      both a,b <= 1; ");
			if (a0 >= min(0.2, b0))
				goto L_w_bpser;

			if (pow(x0, a0) <= 0.9)
				goto L_w_bpser;

			if (x0 >= 0.3)
				goto L_w1_bpser;
		}
		n = 20; /* goto L130; */
		*w1 = bup(b0, a0, y0, x0, n, eps, FALSE);
		did_bup = TRUE;
		R_ifDEBUG_printf("  ... n=20 and *w1 := bup(*) = %.15g; ", *w1);
		b0 += n;
	L131:
		R_ifDEBUG_printf(" L131: bgrat(*, w1=%.15g) ", *w1);
		bgrat(b0, a0, y0, x0, w1, 15 * eps, &ierr1, FALSE);
#ifdef DEBUG_bratio
		REprintf(" ==> new w1=%.15g", *w1);
		if (ierr1)
			REprintf(" ERROR(code=%d)\n", ierr1);
		else
			REprintf("\n");
#endif
		if (*w1 == 0 || (0 < *w1 && *w1 < 1e-310))
		{ // w1=0 or very close:
			// "almost surely" from underflow, try more: [2013-03-04]
			// FIXME: it is even better to do this in bgrat *directly* at least for the case
			//  !did_bup, i.e., where *w1 = (0 or -Inf) on entry
			R_ifDEBUG_printf(" denormalized or underflow (?) -> retrying: ");
			if (did_bup)
			{ // re-do that part on log scale:
				*w1 = bup(b0 - n, a0, y0, x0, n, eps, TRUE);
			}
			else
				*w1 = ML_NEGINF; // = 0 on log-scale
			bgrat(b0, a0, y0, x0, w1, 15 * eps, &ierr1, TRUE);
			if (ierr1)
				*ierr = 10 + ierr1;
#ifdef DEBUG_bratio
			REprintf(" ==> new log(w1)=%.15g", *w1);
			if (ierr1)
				REprintf(" Error(code=%d)\n", ierr1);
			else
				REprintf("\n");
#endif
			goto L_end_from_w1_log;
		}
		// else
		if (ierr1)
			*ierr = 10 + ierr1;
		if (*w1 < 0)
			MATHLIB_WARNING4("bratio(a=%g, b=%g, x=%g): bgrat() -> w1 = %g",
							 a, b, x, *w1);
		goto L_end_from_w1;
	}
	else
	{ /* L30: -------------------- both  a, b > 1  {a0 > 1  &  b0 > 1} ---*/

		if (a > b)
			lambda = (a + b) * y - b;
		else
			lambda = a - (a + b) * x;

		do_swap = (lambda < 0.);
		if (do_swap)
		{
			lambda = -lambda;
			SET_0_swap;
		}
		else
		{
			SET_0_noswap;
		}

		R_ifDEBUG_printf("  L30:  both  a, b > 1; |lambda| = %#g, do_swap = %d\n",
						 lambda, do_swap);

		if (b0 < 40.)
		{
			R_ifDEBUG_printf("  b0 < 40;");
			if (b0 * x0 <= 0.7 || (log_p && lambda > 650.)) /* << added 2010-03-18 */
				goto L_w_bpser;
			else
				goto L140;
		}
		else if (a0 > b0)
		{ /* ----  a0 > b0 >= 40  ---- */
			R_ifDEBUG_printf("  a0 > b0 >= 40;");
			if (b0 <= 100. || lambda > b0 * 0.03)
				goto L_bfrac;
		}
		else if (a0 <= 100.)
		{
			R_ifDEBUG_printf("  a0 <= 100; a0 <= b0 >= 40;");
			goto L_bfrac;
		}
		else if (lambda > a0 * 0.03)
		{
			R_ifDEBUG_printf("  b0 >= a0 > 100; lambda > a0 * 0.03 ");
			goto L_bfrac;
		}

		/* else if none of the above    L180: */
		*w = basym(a0, b0, lambda, eps * 100., log_p);
		*w1 = log_p ? R_Log1_Exp(*w) : 0.5 - *w + 0.5;
		R_ifDEBUG_printf("  b0 >= a0 > 100; lambda <= a0 * 0.03: *w:= basym(*) =%.15g\n",
						 *w);
		goto L_end;

	} /* else: a, b > 1 */

	/*            EVALUATION OF THE APPROPRIATE ALGORITHM */

L_w_bpser: // was L100
	*w = bpser(a0, b0, x0, eps, log_p);
	*w1 = log_p ? R_Log1_Exp(*w) : 0.5 - *w + 0.5;
	R_ifDEBUG_printf(" L_w_bpser: *w := bpser(*) = %.15g\n", *w);
	goto L_end;

L_w1_bpser: // was L110
	*w1 = bpser(b0, a0, y0, eps, log_p);
	*w = log_p ? R_Log1_Exp(*w1) : 0.5 - *w1 + 0.5;
	R_ifDEBUG_printf(" L_w1_bpser: *w1 := bpser(*) = %.15g\n", *w1);
	goto L_end;

L_bfrac:
	*w = bfrac(a0, b0, x0, y0, lambda, eps * 15., log_p);
	*w1 = log_p ? R_Log1_Exp(*w) : 0.5 - *w + 0.5;
	R_ifDEBUG_printf(" L_bfrac: *w := bfrac(*) = %g\n", *w);
	goto L_end;

L140:
	/* b0 := fractional_part( b0 )  in (0, 1]  */
	n = (int)b0;
	b0 -= n;
	if (b0 == 0.)
	{
		--n;
		b0 = 1.;
	}

	*w = bup(b0, a0, y0, x0, n, eps, FALSE);

	R_ifDEBUG_printf(" L140: *w := bup(b0=%g,..) = %.15g; ", b0, *w);
	if (*w < DBL_MIN && log_p)
	{ /* do not believe it; try bpser() : */
		/*revert: */ b0 += n;
		/* which is only valid if b0 <= 1 || b0*x0 <= 0.7 */
		goto L_w_bpser;
	}
	if (x0 <= 0.7)
	{
		/* log_p :  TODO:  w = bup(.) + bpser(.)  -- not so easy to use log-scale */
		*w += bpser(a0, b0, x0, eps, /* log_p = */ FALSE);
		R_ifDEBUG_printf(" x0 <= 0.7: *w := *w + bpser(*) = %.15g\n", *w);
		goto L_end_from_w;
	}
	/* L150: */
	if (a0 <= 15.)
	{
		n = 20;
		*w += bup(a0, b0, x0, y0, n, eps, FALSE);
		R_ifDEBUG_printf("\n a0 <= 15: *w := *w + bup(*) = %.15g;", *w);
		a0 += n;
	}
	R_ifDEBUG_printf(" bgrat(*, w=%.15g) ", *w);
	bgrat(a0, b0, x0, y0, w, 15 * eps, &ierr1, FALSE);
	if (ierr1)
		*ierr = 10 + ierr1;
#ifdef DEBUG_bratio
	REprintf("==> new w=%.15g", *w);
	if (ierr1)
		REprintf(" Error(code=%d)\n", ierr1);
	else
		REprintf("\n");
#endif
	goto L_end_from_w;

	/* TERMINATION OF THE PROCEDURE */

L200:
	if (a == 0.)
	{
		*ierr = 6;
		return;
	}
	// else:
L201:
	*w = R_D__0;
	*w1 = R_D__1;
	return;

L210:
	if (b == 0.)
	{
		*ierr = 7;
		return;
	}
	// else:
L211:
	*w = R_D__1;
	*w1 = R_D__0;
	return;

L_end_from_w:
	if (log_p)
	{
		*w1 = log1p(-*w);
		*w = log(*w);
	}
	else
	{
		*w1 = 0.5 - *w + 0.5;
	}
	goto L_end;

L_end_from_w1:
	if (log_p)
	{
		*w = log1p(-*w1);
		*w1 = log(*w1);
	}
	else
	{
		*w = 0.5 - *w1 + 0.5;
	}
	goto L_end;

L_end_from_w1_log:
	// *w1 = log(w1) already; w = 1 - w1  ==> log(w) = log(1 - w1) = log(1 - exp(*w1))
	if (log_p)
	{
		*w = R_Log1_Exp(*w1);
	}
	else
	{
		*w = /* 1 - exp(*w1) */ -expm1(*w1);
		*w1 = exp(*w1);
	}
	goto L_end;

L_end:
	if (do_swap)
	{ /* swap */
		double t = *w;
		*w = *w1;
		*w1 = t;
	}
	return;

} /* bratio */