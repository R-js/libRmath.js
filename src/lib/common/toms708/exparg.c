static double exparg(int l)
{
	/* --------------------------------------------------------------------
 *     If l = 0 then  exparg(l) = The largest positive W for which
 *     exp(W) can be computed. With 0.99999 fuzz  ==> exparg(0) =   709.7756  nowadays

 *     if l = 1 (nonzero) then  exparg(l) = the largest negative W for
 *     which the computed value of exp(W) is nonzero.
 *     With 0.99999 fuzz			  ==> exparg(1) =  -709.0825  nowadays

 *     Note... only an approximate value for exparg(L) is needed.
 * -------------------------------------------------------------------- */

	static double const lnb = .69314718055995;
	int m = (l == 0) ? Rf_i1mach(16) : Rf_i1mach(15) - 1;

	return m * lnb * .99999;
} /* exparg */