/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 14, 2017
 *
 *  ORIGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 1999-2014  The R Core Team
 *  Copyright (C) 2004	     Morten Welinder
 *  Copyright (C) 2004	     The R Foundation
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 *  https://www.R-project.org/Licenses/
 *
 *  DESCRIPTION
 *
 *	The distribution function of the hypergeometric distribution.
 *
 * Current implementation based on posting
 * From: Morten Welinder <terra@gnome.org>
 * Cc: R-bugs@biostat.ku.dk
 * Subject: [Rd] phyper accuracy and efficiency (PR#6772)
 * Date: Thu, 15 Apr 2004 18:06:37 +0200 (CEST)
 ......

 The current version has very serious cancellation issues.  For example,
 if you ask for a small right-tail you are likely to get total cancellation.
 For example,  phyper(59, 150, 150, 60, FALSE, FALSE) gives 6.372680161e-14.
 The right answer is dhyper(0, 150, 150, 60, FALSE) which is 5.111204798e-22.

 phyper is also really slow for large arguments.

 Therefore, I suggest using the code below. This is a sniplet from Gnumeric ...
 The code isn't perfect.  In fact, if  x*(NR+NB)  is close to	n*NR,
 then this code can take a while. Not longer than the old code, though.

 -- Thanks to Ian Smith for ideas.

*/

import * as debug from 'debug';
import { R_DT_log } from '~exp-utils';
import { ML_ERR_return_NAN, R_D_Lval, R_DT_0, R_DT_1 } from '../common/_general';
import { forEach } from '../r-func';
import { dhyper } from './dhyper';

const { floor, round: R_forceint, log1p } = Math;
const { EPSILON: DBL_EPSILON, isNaN: ISNAN, isFinite: R_FINITE } = Number;

//NOTE: p[d]hyper is not  typo!!
const printer_pdhyper = debug('pdhyper');

function pdhyper(
  x: number,
  NR: number,
  NB: number,
  n: number,
  log_p: boolean
): number {
  /*
     * Calculate
     *
     *	    phyper (x, NR, NB, n, TRUE, FALSE)
     *   [log]  ----------------------------------
     *	       dhyper (x, NR, NB, n, FALSE)
     *
     * without actually calling phyper.  This assumes that
     *
     *     x * (NR + NB) <= n * NR
     *
     */

  let sum = 0;
  let term = 1;

  while (x > 0 && term >= DBL_EPSILON * sum) {
    term *= x * (NB - n + x) / (n + 1 - x) / (NR + 1 - x);
    sum += term;
    x--;
  }

  let ss = sum;
  return log_p ? log1p(ss) : 1 + ss;
}

/* FIXME: The old phyper() code was basically used in ./qhyper.c as well
 * -----  We need to sync this again!
*/
const printer_phyper = debug('phyper');

export function phyper<T>(
  xx: T,
  nr: number,
  nb: number,
  nn: number,
  lowerTail: boolean = true,
  logP: boolean = false
): T {
  /* Sample of  n balls from  NR red  and	 NB black ones;	 x are red */

  return forEach(xx)(x => {
    let d: number;
    let pd: number;
    let lower_tail = lowerTail; //copy it gets changed
    let log_p = logP;
    let NR = nr;
    let NB = nb;
    let n = nn;
    if (ISNAN(x) || ISNAN(NR) || ISNAN(NB) || ISNAN(n)) return x + NR + NB + n;

    x = floor(x + 1e-7);
    NR = R_forceint(NR);
    NB = R_forceint(NB);
    n = R_forceint(n);

    if (NR < 0 || NB < 0 || !R_FINITE(NR + NB) || n < 0 || n > NR + NB) {
      return ML_ERR_return_NAN(printer_phyper);
    }

    if (x * (NR + NB) > n * NR) {
      /* Swap tails.	*/
      let oldNB = NB;
      NB = NR;
      NR = oldNB;
      x = n - x - 1;
      lower_tail = !lower_tail;
    }

    if (x < 0) return R_DT_0(lower_tail, log_p);
    if (x >= NR || x >= n) return R_DT_1(lower_tail, log_p);

    d = dhyper(x, NR, NB, n, log_p);
    pd = pdhyper(x, NR, NB, n, log_p);

    return log_p
      ? R_DT_log(lower_tail, log_p, d + pd)
      : R_D_Lval(lower_tail, d * pd);
  }) as any;

}
