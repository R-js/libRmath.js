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
seed
You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { KnuthTAOCP } from './knuth-taocp';
export { KnuthTAOCP };
export { KnuthTAOCP2002 } from './knuth-taocp-2002';
export { LecuyerCMRG } from './lecuyer-cmrg';
export { MarsagliaMultiCarry } from './marsaglia-multicarry';
export { MersenneTwister } from './mersenne-twister';
export { SuperDuper } from './super-duper';
export { default as seed } from './seed';
export { WichmannHill } from './wichmann-hill';
// normal
export { AhrensDieter } from './normal/ahrens-dieter';
export { Inversion } from './normal/inversion';
export { BoxMuller } from './normal/box-muller';
export { BuggyKindermanRamage } from './normal/buggy-kinderman-ramage';
export { KindermanRamage } from './normal/kinderman-ramage';
// stubs
export { IRNG, MessageType } from './irng';
export { IRNGNormal } from './normal/normal-rng';
export type { IRNGType } from './rng-types';
export type { IRNGNormalType } from './normal/rng-types';
// globalRNG
export { globalUni, globalNorm, RNGkind } from './global-rng';
export type { SampleKindType } from './sample-kind-type';

