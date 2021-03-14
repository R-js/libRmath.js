'use strict'
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { ptukey as _pt } from './ptukey';
import { qtukey as _qt } from './qtukey';


/*
> ptukey
function (q, nmeans, df, nranges = 1, lower.tail = TRUE, log.p = FALSE)
.Call(C_ptukey, q, nranges, nmeans, df, lower.tail, log.p)
<bytecode: 0x000000001cde3048>
<environment: namespace:stats>
 
double ptukey(
  double q,  // q
  double rr, // nranges
  double cc, // nmeans
  double df, // df
  int lower_tail, // lowertail
  int log_p       // logp
*/

export function ptukey(
  q: number,
  nmeans: number,
  df: number,
  nranges = 1,
  lowerTail = true,
  logP = false
) {
  return _pt(q, nranges, nmeans, df, lowerTail, logP);
}
//
/*
/**
> qtukey
function (p, nmeans, df, nranges = 1, lower.tail = TRUE, log.p = FALSE)
.Call(C_qtukey, p, nranges, nmeans, df, lower.tail, log.p)
<bytecode: 0x000000001cde4a80>
<environment: namespace:stats>
*/
export function qtukey(
  q: number,
  nmeans: number,
  df: number,
  nranges = 1,
  lowerTail = true,
  logP = false
) {
  return _qt(q, nranges, nmeans, df, lowerTail, logP);
}
