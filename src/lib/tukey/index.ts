
import { ptukey as _pt } from './ptukey';
import { qtukey as _qt } from './qtukey';


export function Tukey() {

  /*
  > ptukey
  function (q, nmeans, df, nranges = 1, lower.tail = TRUE, log.p = FALSE)
  .Call(C_ptukey, q, nranges, nmeans, df, lower.tail, log.p)
  <bytecode: 0x000000001cde3048>
  <environment: namespace:stats>
  
  double ptukey(
    double q,  // q
    double rr, // nranges
    double cc, // nmeans
    double df, // df
    int lower_tail, // lowertail
    int log_p       // logp
  */

  function ptukey<T>(
    q: T,
    nmeans: number,
    df: number,
    nranges: number = 1,
    lowerTail: boolean = true,
    logP: boolean = false
  ): T {
    return _pt(q, nranges, nmeans, df, lowerTail, logP);
  }
  //
  /*
  /**
> qtukey
function (p, nmeans, df, nranges = 1, lower.tail = TRUE, log.p = FALSE)
.Call(C_qtukey, p, nranges, nmeans, df, lower.tail, log.p)
<bytecode: 0x000000001cde4a80>
<environment: namespace:stats>
  */
  function qtukey<T>(
    q: T,
    nmeans: number,
    df: number,
    nranges: number = 1,
    lowerTail: boolean = true,
    logP: boolean = false
  ): T {
    return _qt(q, nranges, nmeans, df, lowerTail, logP);
  }

  return {
    ptukey,
    qtukey
  };

}
