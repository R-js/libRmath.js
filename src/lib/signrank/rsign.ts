import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';
import { forEach, seq } from '../r-func';
import { IRNG } from '../rng/irng';

const { isNaN: ISNAN } = Number;
const { floor, round } = Math;
const printer_rsignrank = debug('rsignrank');
const sequence = seq()();

export function rsignrank(nn: number, n: number, rng: IRNG): number | number[] {
  return forEach(sequence(nn))(() => {
    /* NaNs propagated correctly */
    if (ISNAN(n)) return n;
    const nRound = round(n);
    if (nRound < 0) return ML_ERR_return_NAN(printer_rsignrank);

    if (nRound === 0) return 0;
    let r = 0.0;
    let k = floor(nRound);
    for (let i = 0; i < k /**/; ) {
      r += ++i * floor(rng.unif_rand() + 0.5);
    }
    return r;
  });
}
