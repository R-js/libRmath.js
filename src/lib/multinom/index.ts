import { dmultinom, IdmultinomOptions } from './dmultinom';
import { rmultinom as _rmultinom } from './rmultinom';
//FIXME: convert dmultinom from pure R to ts equivalent

import { IRNG } from '../rng/irng';
import { MersenneTwister } from '../rng/mersenne-twister';

export { IdmultinomOptions };

export function MultiNomial(rng: IRNG = new MersenneTwister()) {
  function rmultinom(n: number, prob: number[], K: number, rN: number[]) {
    return _rmultinom(n, prob, K, rN, rng);
  }

  return {
    rmultinom,
    dmultinom
  };
}
