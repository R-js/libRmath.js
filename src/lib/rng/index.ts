import * as WichMannHill from './wichmann-hill';
import * as Marsaglia from './marsaglia-multicarry';
import * as Superduper from './super-duper';
import * as MersenneTwister from './mersenne-twister';
import * as KnuthTAOCP from './knuth-taocp';
import * as KnuthTAOCP2002 from './knuth-taocp-2002';
import * as LecuyerCMRG from './lecuyer-cmrg';
export const rng = {
  LecuyerCMRG,
  KnuthTAOCP2002,
  KnuthTAOCP,
  WichMannHill,
  Marsaglia,
  Superduper,
  MersenneTwister
};

