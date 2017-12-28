//export { fsign } from './fsign';
import { IRNG, rng } from '../rng';
import {
  dsignrank,
  psignrank,
  qsignrank,
  rsignrank as _rsignrank
} from './signrank';

const { SuperDuper } = rng;

export function SignRank(rng: IRNG = new SuperDuper(0)) {
  function rsignrank(nn: number, n: number) {
    return _rsignrank(nn, n, rng);
  }

  return {
    dsignrank,
    psignrank,
    qsignrank,
    rsignrank
  };
}
