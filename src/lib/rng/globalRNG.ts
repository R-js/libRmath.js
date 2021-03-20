import { IRNG } from '@rng/irng';
import { KnuthTAOCP } from './knuth-taocp';
import { KnuthTAOCP2002 } from '@rng/knuth-taocp-2002';
import { LecuyerCMRG } from '@rng/lecuyer-cmrg';
import { MarsagliaMultiCarry } from '@rng/marsaglia-multicarry';
import { MersenneTwister } from '@rng/mersenne-twister';
import { SuperDuper } from '@rng/super-duper';
import { WichmannHill } from '@rng/wichmann-hill';

// normal
import { IRNGNormal } from '@rng/normal/normal-rng';
import { AhrensDieter } from '@rng/normal/ahrens-dieter';
import { BoxMuller } from '@rng/normal/box-muller';
import { BuggyKindermanRamage } from '@rng/normal/buggy-kinderman-ramage';
import { Inversion } from '@rng/normal/inversion';
import { KindermanRamage } from '@rng/normal/kinderman-ramage';

//enums
import { IRNGTypeEnum } from './irng-type';
import { IRNGNormalTypeEnum } from './normal/in01-type';


const uniformMap = {
    // uniform
    [IRNGTypeEnum.KNUTH_TAOCP]: KnuthTAOCP,
    [IRNGTypeEnum.KNUTH_TAOCP2002]: KnuthTAOCP2002,
    [IRNGTypeEnum.LECUYER_CMRG]: LecuyerCMRG,
    [IRNGTypeEnum.MARSAGLIA_MULTICARRY]: MarsagliaMultiCarry,
    [IRNGTypeEnum.MERSENNE_TWISTER]: MersenneTwister,
    [IRNGTypeEnum.SUPER_DUPER]: SuperDuper,
    [IRNGTypeEnum.WICHMANN_HILL]: WichmannHill,
}

type UniformMapKey = keyof (typeof uniformMap);

const normalMap = {
    // normal
    [IRNGNormalTypeEnum.AHRENS_DIETER]: AhrensDieter,
    [IRNGNormalTypeEnum.BOX_MULLER]: BoxMuller,
    [IRNGNormalTypeEnum.BUGGY_KINDERMAN_RAMAGE]: BuggyKindermanRamage,
    [IRNGNormalTypeEnum.INVERSION]: Inversion,
    [IRNGNormalTypeEnum.KINDERMAN_RAMAGE]: KindermanRamage
}

//type normalMapKey = keyof (typeof normalMap);

const symRNG = Symbol.for('rngUNIFORM');
const symRNGNormal = Symbol.for('rngNORMAL');

type EgT = typeof globalThis & {
    [symRNG]: IRNG,
    [symRNGNormal]: IRNGNormal
};

export function globalUni(d?: IRNG): IRNG {
    if (d) {
        (globalThis as EgT)[symRNG] = d;
    }
    return (globalThis as EgT)[symRNG];
}

export function globalNorm(d?: IRNGNormal): IRNGNormal {
    if (d) {
        (globalThis as EgT)[symRNGNormal] = d;
    }
    return (globalThis as EgT)[symRNGNormal];
}

export function RNGKind(
    uniform?: IRNGTypeEnum | IRNGNormalTypeEnum,
    normal?: IRNGNormalTypeEnum
): { uniform: IRNG, normal: IRNGNormal } {

    const gu = globalUni();
    const no = globalNorm();

    if (uniform && !normal) {
        normal = uniform as IRNGNormalTypeEnum;
        uniform = no ? no.kind : IRNGTypeEnum.MERSENNE_TWISTER;
    }

    if (!uniform) {
        uniform = (gu && gu.kind) || IRNGTypeEnum.MERSENNE_TWISTER;
    }

    if (!normal) {
        normal = (no && no.kind) || IRNGNormalTypeEnum.INVERSION;
    }

    //check if normal exist
    const errors: string[] = [];
    const uni = uniformMap[uniform as UniformMapKey];
    if (!uni){
        errors.push(`Uknown uniform type ${uniform}`);
    }
    else {
        globalUni(new uni());
    }
    const norm = normalMap[normal as IRNGNormalTypeEnum];
    if (!norm){
        errors.push(`Uknown normal type ${normal}`);
    }
    else {
        globalNorm(new norm(globalUni()));
    }
   
    return {
        uniform: globalUni(),
        normal: globalNorm(),
    };
}

//init
RNGKind();



