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
