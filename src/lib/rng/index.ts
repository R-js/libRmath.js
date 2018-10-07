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
import { IRNG } from './irng';
import { KnuthTAOCP } from './knuth-taocp';
import { KnuthTAOCP2002 } from './knuth-taocp-2002';
import { LecuyerCMRG } from './lecuyer-cmrg';
import { MarsagliaMultiCarry } from './marsaglia-multicarry';
import { MersenneTwister } from './mersenne-twister';
import { 
    AhrensDieter, 
    BoxMuller, 
    BuggyKindermanRamage, 
    Inversion,
    KindermanRamage
} from './normal';
import { IRNGNormal } from './normal/inormal-rng';
import { SuperDuper } from './super-duper';
import { timeseed } from './timeseed';
import { WichmannHill } from './wichmann-hill';

export const rng = {
  KnuthTAOCP,
  KnuthTAOCP2002,
  LecuyerCMRG,
  MarsagliaMultiCarry,
  MersenneTwister,
  normal: {
    AhrensDieter,
    BoxMuller,
    BuggyKindermanRamage, 
    Inversion,
    KindermanRamage
  },
  SuperDuper,
  timeseed,
  WichmannHill,
};

export { IRNG, IRNGNormal };
