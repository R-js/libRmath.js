import { WichmannHill } from './wichmann-hill';
import { MarsagliaMultiCarry } from './marsaglia-multicarry';
import { SuperDuper } from './super-duper';
import { MersenneTwister } from './mersenne-twister';
import { KnuthTAOCP } from './knuth-taocp';
import { KnuthTAOCP2002 } from './knuth-taocp-2002';
import { LecuyerCMRG } from './lecuyer-cmrg';
import { IRNG } from './irng';
import { IRNGNormal } from './normal/inormal-rng';
import { 
    Inversion, 
    BuggyKindermanRamage, 
    BoxMuller, 
    AhrensDieter,
    KindermanRamage 
} from './normal';

export const rng = {
  SuperDuper,
  KnuthTAOCP,
  KnuthTAOCP2002,
  WichmannHill,
  LecuyerCMRG,
  MersenneTwister,
  MarsagliaMultiCarry,
  normal: {
    BuggyKindermanRamage,
    BoxMuller,
    AhrensDieter,
    Inversion,
    KindermanRamage
  }
};

export { IRNG, IRNGNormal };
