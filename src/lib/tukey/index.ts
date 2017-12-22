import { ptukey as _pt } from './ptukey';
import { qtukey as _qt } from './qtukey';

import { INormal, Normal } from '~normal';

export function Tukey(rng: INormal = Normal()) {
  //
  function ptukey<T>(
    q: T,
    nmeans: number,
    df: number,
    nranges: number = 1,
    lowerTail: boolean = true,
    logP: boolean = false
  ): T {
    return _pt(q, nranges, nmeans, df, lowerTail, logP, rng);
  }
  //
  function qtukey<T>(
    q: T,
    nmeans: number,
    df: number,
    nranges: number = 1,
    lowerTail: boolean = true,
    logP: boolean = false
  ): T {
    return _qt(q, nranges, nmeans, df, lowerTail, logP, rng);
  }

  return {
      ptukey,
      qtukey
  };
  
}
