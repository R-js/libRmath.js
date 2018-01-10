import { dmultinom, IdmultinomOptions } from './dmultinom';
import { rmultinom as _rmultinom } from './rmultinom';
//FIXME: convert dmultinom from pure R to ts equivalent

import { IRNG } from '../rng/irng';
import { MersenneTwister } from '../rng/mersenne-twister';

export { IdmultinomOptions };

export function Multinomial(rng: IRNG = new MersenneTwister(0)) {
  function rmultinom(n: number, size: number, prob: number | number[]) {
    return _rmultinom(n, size, prob, rng);
  }
  return {
    rmultinom,
    dmultinom
  };
}
