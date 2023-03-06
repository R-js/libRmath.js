export const nsig_BESS = 16;
export const ensig_BESS = 1e16;
export const rtnsig_BESS = 1e-4;
export const enmten_BESS = 8.9e-308;
export const enten_BESS = 1e308;

export const exparg_BESS = 709;
export const xlrg_BESS_IJ = 1e5;
export const xlrg_BESS_Y = 1e8;
export const thresh_BESS_Y = 16;

export const xmax_BESS_K = 705.342; /* maximal x for UNscaled answer */

/* sqrt(DBL_MIN) =	1.491668e-154 */
export const sqxmin_BESS_K = 1.49e-154;

/* x < eps_sinc	 <==>  sin(x)/x == 1 (particularly "==>");
  Linux (around 2001-02) gives 2.14946906753213e-08
  Solaris 2.5.1		 gives 2.14911933289084e-08
  Javascript (V8) around 2018 gives 2.1491194e-8 => 0.9999999999999999,  
*/
export const M_eps_sinc = 2.149e-8;
