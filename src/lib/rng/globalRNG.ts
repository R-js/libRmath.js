'use strict';



//rng
import { IRNG } from '@rng/irng';
import { KnuthTAOCP } from '@rng/knuth-taocp';
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

const normalMap = {
    // normal
    [IRNGNormalTypeEnum.AHRENS_DIETER]: AhrensDieter,
    [IRNGNormalTypeEnum.BOX_MULLER]: BoxMuller,
    [IRNGNormalTypeEnum.BUGGY_KINDERMAN_RAMAGE]: BuggyKindermanRamage,
    [IRNGNormalTypeEnum.INVERSION]: Inversion,
    [IRNGNormalTypeEnum.KINDERMAN_RAMAGE]: KindermanRamage
}

const symRNG = Symbol.for('rngUNIFORM');
const symRNGNormal = Symbol.for('rngNORMAL');

export function globalUni(d?: IRNG): IRNG {
    if (d) {
        (globalThis as any)[symRNG] = d;
    }
    return (globalThis as any)[symRNG];
}

export function globalNorm(d?: IRNGNormal): IRNGNormal {
    if (d) {
        (globalThis as any)[symRNGNormal] = d;
    }
    return (globalThis as any)[symRNGNormal];
}

export function RNGKind(
    uniform?: IRNGTypeEnum | IRNGNormalTypeEnum,
    normal?: IRNGNormalTypeEnum
): { uniform: IRNG, normal: IRNGNormal } {
    let uni;
    let norm;
    if (!uniform && !normal) {
        const tu = globalUni() ? globalUni().kind :IRNGTypeEnum.MERSENNE_TWISTER;
        const tn = globalNorm() ? globalNorm().kind : IRNGNormalTypeEnum.INVERSION;
        return RNGKind(tu, tn);
    }
    if (!normal && uniform) {
        // is the uniform a normal?
        if (!normalMap[uniform as IRNGNormalTypeEnum]) {
            return RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, uniform as IRNGNormalTypeEnum);
        }
    }
    // at this point we have uni/normals, be it defaults or not
    // uniform is ok?
    if (!uniformMap[uniform as IRNGTypeEnum]) {
        throw new TypeError(`wrong rng kind specified for uniform "${uniform}"`);
    }
    uni = uniformMap[uniform as IRNGTypeEnum];

    // normal ok?
    if (!normalMap[normal as IRNGNormalTypeEnum]) {
        throw new TypeError(`wrong rng kind specified for normal "${normal}"`);
    }
    norm = normalMap[normal as IRNGNormalTypeEnum];

    // we have both normal and uniform, but are the different then globals?
    let uniChange;
    if (
        undefined === globalUni()
        ||
        uni.name !== globalNorm().constructor.name
    ) {
        globalUni(new uni());
        uniChange = true;
    }


    if (
        uniChange  // if uni-rng changed, re-create the normal rng regardless
        ||
        undefined === globalNorm()
        ||
        globalNorm().constructor.name !== norm.name
    ) {
        globalNorm(new norm(globalUni()))
    }

    return {
        uniform: globalUni(),
        normal: globalNorm(),
    };
}



