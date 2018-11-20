import { NumberW } from '../common/toms708';

const { trunc } = Math;
const SIXTEN = 16; /* Cutoff allowing exact "*" and "/" */
const { log, exp, log1p } = Math;

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
    let xsq = trunc(X * SIXTEN) / SIXTEN;
    let del = (X - xsq) * (X + xsq);
    if (log_p) {
      cum.val = -xsq * xsq * 0.5 + -del * 0.5 + log(temp);
      if ((lower && x > 0) || (upper && x <= 0))
        ccum.val = log1p(-exp(-xsq * xsq * 0.5) * exp(-del * 0.5) * temp);
    } else {
      cum.val = exp(-xsq * xsq * 0.5) * exp(-del * 0.5) * temp;
      ccum.val = 1.0 - cum.val;
    }
  }
