import { NumberW } from '$toms708';
const SIXTEN = 16; /* Cutoff allowing exact "*" and "/" */
      
export function do_del(
    ccum: NumberW,
    cum: NumberW,
    log_p: boolean,
    X: number,
    temp: number,
    upper: boolean,
    lower: boolean,
    x: number
  ): void {
    const xsq = Math.trunc(X * SIXTEN) / SIXTEN;
    const del = (X - xsq) * (X + xsq);
    if (log_p) {
      //B
      cum.val = -xsq * xsq * 0.5 + -del * 0.5 + Math.log(temp);
      if ((lower && x > 0) || (upper && x <= 0))
        //A
        ccum.val = Math.log1p(-Math.exp(-xsq * xsq * 0.5) * Math.exp(-del * 0.5) * temp);
    } else {
      //C
      cum.val = Math.exp(-xsq * xsq * 0.5) * Math.exp(-del * 0.5) * temp;
      ccum.val = 1.0 - cum.val;
    }
  }

  /*
     log_p,   x> 0 &&  lower,   x<=0 &&   higher, path 
      T              T            F               A+B
      T              F            T               A+B
      T              F            F               B  
      F              X            X               C 
  */ 
