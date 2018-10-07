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
const { trunc, ceil, min, log2, pow } = Math;
const { now } = Date;

export function timeseed() {
  const n = now();
  //delay 0.5 sec
  do {
    now(); // consume cpu, do something silly
  } while (now() - n < 500);

  // how many bits?
  const nBits = min(32, ceil(log2(n)));
  const lowBits = trunc(nBits / 2);
  const hi = trunc(n / pow(2, lowBits));
  const lo = n - hi * pow(2, lowBits);
  //
  // create 32 bit array
  const buf = new ArrayBuffer(4);
  const reverser = new Uint8Array(buf);
  const uint32 = new Uint32Array(buf);
  uint32[0] = lo ^ hi; // little endian, highest order bytes has lowest indexes so
  // reverse order of bytes, milliseconds changes the fastest in a time
  reverser.reverse();
  return uint32[0];
}
