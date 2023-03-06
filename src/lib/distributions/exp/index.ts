import { dexp as _dexp} from './dexp';
import { pexp as _pexp} from './pexp';
import { qexp as _qexp} from './qexp';
import { rexpOne } from './rexp';

import { repeatedCall64 } from '@lib/r-func';

export function dexp(x: number, rate = 1, log = false): number {
  return _dexp(x, 1 / rate, log);
}

export function pexp(q: number, rate = 1, lowerTail = true, logP = false): number {
  return _pexp(q, 1 / rate, lowerTail, logP);
}

export function qexp(p: number, rate = 1, lowerTail = true, logP = false): number { 
  return _qexp(p, 1 / rate, lowerTail, logP);
}

export function rexp(n: number, rate = 1):Float64Array {
  return repeatedCall64(n, rexpOne, rate);
}

export { rexpOne };