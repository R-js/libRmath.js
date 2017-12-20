import { rmultinom as _rmultinom } from './rmultinom';

//FIXME: convert dmultinom from pure R to ts equivalent

import { INormal, Normal } from '../normal';

export function MultiNomial(rng: INormal = Normal()) {
  
  function rmultinom(n: number, prob: number[], K: number, rN: number[]) {
    return _rmultinom(n, prob, K, rN, rng);
  }
  
  return {
    rmultinom
  };
}
