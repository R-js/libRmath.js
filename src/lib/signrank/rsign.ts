import * as debug from 'debug';
import { ML_ERR_return_NAN } from '../common/_general';
import { map, seq } from '../r-func';
import { IRNG } from '../rng/irng';

const { isNaN: ISNAN } = Number;
const { floor, round } = Math;
const printer_rsignrank = debug('rsignrank');
const sequence = seq()();

export function rsignrank(nn: number, n: number, rng: IRNG): number | number[] {
  return map(sequence(nn))(() => {
    /* NaNs propagated correctly */
    if (ISNAN(n)) return n;
    const nRound = round(n);
    if (nRound < 0) return ML_ERR_return_NAN(printer_rsignrank);

    if (nRound === 0) return 0;
    let r = 0.0;
    let k = floor(nRound);
    for (let i = 0; i < k /**/; ) {
      r += ++i * floor((rng.unif_rand() as number) + 0.5);
    }
    return r;
  });
}
