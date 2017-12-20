//export { fsign } from './fsign';
import {
  dsignrank,
  psignrank,
  qsignrank,
  rsignrank as _rsignrank
} from './signrank';
import { IRNG, rng } from '../rng';

const { SuperDuper } = rng;

export function SignRank(rng: IRNG = new SuperDuper(0)) {
  function rsignrank(nn: number, n: number) {
    return _rsignrank(nn, n, rng);
  }

  return {
    rsignrank,
    dsignrank,
    qsignrank,
    psignrank

  };
}
