import * as WichMannHill from './wichmann-hill';
import { MarsagliaMultiCarry } from './marsaglia-multicarry';
import * as Superduper from './super-duper';
import * as MersenneTwister from './mersenne-twister';
import { KnuthTAOCP } from './knuth-taocp';
import { KnuthTAOCP2002 } from './knuth-taocp-2002';
import { LecuyerCMRG } from './lecuyer-cmrg';
import { IRNG } from './IRNG';

export const rng = {
  LecuyerCMRG,
  KnuthTAOCP2002,
  KnuthTAOCP,
  WichMannHill,
  MarsagliaMultiCarry,
  Superduper,
  MersenneTwister,
  IRNG
};

