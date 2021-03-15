
import { NumberW } from '$toms708';
import { do_del } from './do_del';

import {
    M_1_SQRT_2PI,
    M_SQRT_32,
    R_D__0,
    R_D__1
  } from '$constants';

const {
    EPSILON: DBL_EPSILON,
    MIN_VALUE: DBL_MIN
  } = Number;

export function pnorm_both(
    x: number,
    cum: NumberW,
    ccum: NumberW,
    i_tail: boolean,
    log_p: boolean
  ): void {
    /* i_tail in {0,1,2} means: "lower", "upper", or "both" :
         if(lower) return  *cum := P[X <= x]
         if(upper) return *ccum := P[X >  x] = 1 - P[X <= x]
      */
    const a = [
      2.2352520354606839287,
      161.02823106855587881,
      1067.6894854603709582,
      18154.981253343561249,
      0.065682337918207449113
    ];
    const b = [
      47.20258190468824187,
      976.09855173777669322,
      10260.932208618978205,
      45507.789335026729956
    ];
    const c = [
      0.39894151208813466764,
      8.8831497943883759412,
      93.506656132177855979,
      597.27027639480026226,
      2494.5375852903726711,
      6848.1904505362823326,
      11602.651437647350124,
      9842.7148383839780218,
      1.0765576773720192317e-8
    ];
    const d = [
      22.266688044328115691,
      235.38790178262499861,
      1519.377599407554805,
      6485.558298266760755,
      18615.571640885098091,
      34900.952721145977266,
      38912.003286093271411,
      19685.429676859990727
    ];
    const p = [
      0.21589853405795699,
      0.1274011611602473639,
      0.022235277870649807,
      0.001421619193227893466,
      2.9112874951168792e-5,
      0.02307344176494017303
    ];
    const q = [
      1.28426009614491121,
      0.468238212480865118,
      0.0659881378689285515,
      0.00378239633202758244,
      7.29751555083966205e-5
    ];
  
    let xden;
    let xnum;
    let temp;
    
    let xsq;

  
    const min = DBL_MIN;
  

  
    /* will never happen
    if (ISNAN(x)) {
      cum.val = ccum.val = x;
      return;
    }*/
  
    /* Consider changing these : */
    const eps = DBL_EPSILON * 0.5; //1.1102230246251565e-16
  
    /* i_tail in {0,1,2} =^= {lower, upper, both} */
    const lower = i_tail !== true;
    const upper = i_tail !== false;
  
    const y = Math.abs(x);
    if (y <= 0.67448975) {
      /* qnorm(3/4) = .6744.... -- earlier had 0.66291 */
      if (y > eps) {
        xsq = x * x;
        xnum = a[4] * xsq;
        xden = xsq;
        for (let i = 0; i < 3; ++i) {
          xnum = (xnum + a[i]) * xsq;
          xden = (xden + b[i]) * xsq;
        }
      } else {
        xnum = xden = 0.0;
      }
  
      temp = x * (xnum + a[3]) / (xden + b[3]);
      if (lower) cum.val = 0.5 + temp;
      if (upper) ccum.val = 0.5 - temp;
      if (log_p) {
        if (lower) cum.val = Math.log(cum.val);
        if (upper) ccum.val = Math.log(ccum.val);
      }
    } else if (y <= M_SQRT_32) {
      /* Evaluate pnorm for 0.674.. = qnorm(3/4) < |x| <= sqrt(32) ~= 5.657 */
  
      xnum = c[8] * y;
      xden = y;
      for (let i = 0; i < 7; ++i) {
        xnum = (xnum + c[i]) * y;
        xden = (xden + d[i]) * y;
      }
      temp = (xnum + c[7]) / (xden + d[7]);
  
      //function do_del(ccum: NumberW, cum: NumberW, log_p: boolean, X: number, temp: number, upper: number, lower: number, x: number):
      /*
          #define swap_tail
              if (x > 0.) {// swap  ccum <--> cum 
                  temp = *cum; if(lower) *cum = *ccum; *ccum = temp; \
              }
          */
      /*
     log_p,   x> 0 &&  lower,   x<=0 &&   higher, path 
      T              T            F               A+B
      T              F            T               A+B
      T              F            F               B  
      F              X            X               C 
      */    
      do_del(ccum, cum, log_p, y, temp, upper, lower, x);
      //swap_tail;
      if (x > 0) {
        // swap  ccum <--> cum
        temp = cum.val;
        if (lower) {
          cum.val = ccum.val;
        }
        ccum.val = temp;
      }
    } else if (
      (log_p && y < 1e170) /* avoid underflow below */ ||
      /*  ^^^^^ MM FIXME: can speedup for log_p and much larger |x| !
           * Then, make use of  Abramowitz & Stegun, 26.2.13, something like
      
           xsq = x*x;
      
           if(xsq * DBL_EPSILON < 1.)
              del = (1. - (1. - 5./(xsq+6.)) / (xsq+4.)) / (xsq+2.);
           else
              del = 0.;
           *cum = -.5*xsq - M_LN_SQRT_2PI - log(x) + log1p(-del);
           *ccum = log1p(-exp(*cum)); /.* ~ log(1) = 0 *./
      
            swap_tail;
      
           [Yes, but xsq might be infinite.]
      
          */
      (lower && -37.5193 < x && x < 8.2924) ||
      (upper && -8.2924 < x && x < 37.5193)
    ) {
      /* else	  |x| > sqrt(32) = 5.657 :
       * the next two case differentiations were really for lower=T, log=F
       * Particularly	 *not*	for  log_p !
      
       * Cody had (-37.5193 < x  &&  x < 8.2924) ; R originally had y < 50
       *
       * Note that we do want symmetry(0), lower/upper -> hence use y
       */
      /* Evaluate pnorm for x in (-37.5, -5.657) union (5.657, 37.5) */
      xsq = 1.0 / (x * x); /* (1./x)*(1./x) might be better */
      xnum = p[5] * xsq;
      xden = xsq;
      for (let i = 0; i < 4; ++i) {
        xnum = (xnum + p[i]) * xsq;
        xden = (xden + q[i]) * xsq;
      }
      temp = xsq * (xnum + p[4]) / (xden + q[4]);
      temp = (M_1_SQRT_2PI - temp) / y;
       /*
     log_p,   x> 0 &&  lower,   x<=0 &&   higher(upper), path 
      T              T            F                       A+B
      T              F            T                       A+B
      T              F            F                       B  
      F              X            X                       C 
      */ 
      do_del(ccum, cum, log_p, x, temp, upper, lower, x);
      //do_del(x);
      //swap_tail;
      if (x > 0) {
        // swap  ccum <--> cum
        temp = cum.val;
        if (lower) {
          cum.val = ccum.val;
        }
        ccum.val = temp;
      }
    } else {
      /* large x such that probs are 0 or 1 */
      if (x > 0) {
        cum.val = R_D__1(log_p);
        ccum.val = R_D__0(log_p);
      } else {
        cum.val = R_D__0(log_p);
        ccum.val = R_D__1(log_p);
      }
    }
  
    /* do not return "denormalized" -- we do in R */
    if (log_p) {
      if (cum.val > -min) cum.val = -0;
      if (ccum.val > -min) {
        ccum.val = -0;
      }
    } else {
      if (cum.val < min) cum.val = 0;
      if (ccum.val < min) ccum.val = 0;
    }
  
    return;
  }
  
