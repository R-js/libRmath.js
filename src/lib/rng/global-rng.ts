import { IRNG, MessageType } from '@rng/irng.js';
import { KnuthTAOCP } from './knuth-taocp/index.js';
import { KnuthTAOCP2002 } from '@rng/knuth-taocp-2002/index.js';
import { LecuyerCMRG } from '@rng/lecuyer-cmrg/index.js';
import { MarsagliaMultiCarry } from '@rng/marsaglia-multicarry/index.js';
import { MersenneTwister } from '@rng/mersenne-twister/index.js';
import { SuperDuper } from '@rng/super-duper/index.js';
import { WichmannHill } from '@rng/wichmann-hill/index.js';

// normal
import { IRNGNormal } from '@rng/normal/normal-rng.js';
import { AhrensDieter } from '@rng/normal/ahrens-dieter/index.js';
import { BoxMuller } from '@rng/normal/box-muller/index.js';
import { BuggyKindermanRamage } from '@rng/normal/buggy-kinderman-ramage/index.js';
import { Inversion } from '@rng/normal/inversion/index.js';
import { KindermanRamage } from '@rng/normal/kinderman-ramage/index.js';

//enums
import { IRNGTypeEnum } from './irng-type.js';
import { IRNGNormalTypeEnum } from './normal/in01-type.js';
import { IRNGSampleKindTypeEnum } from './sample-kind-type.js';


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

type NormalMapKey = keyof (typeof normalMap);

const symRNG = Symbol.for('rngUNIFORM');
const symRNGNormal = Symbol.for('rngNORMAL');
const symSampleKind = Symbol.for('sample.kind');

type EgT = typeof globalThis & {
    [symRNG]: IRNG,
    [symRNGNormal]: IRNGNormal,
    [symSampleKind]: IRNGSampleKindTypeEnum
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

export function globalSampleKind(d?: IRNGSampleKindTypeEnum): IRNGSampleKindTypeEnum {
    if (d) {
        (globalThis as EgT)[symSampleKind] = d;
    }
    return (globalThis as EgT)[symSampleKind];
}


export function RNGKind(
    uniform?: IRNGTypeEnum | IRNGNormalTypeEnum | IRNGSampleKindTypeEnum,
    normal?: IRNGNormalTypeEnum| IRNGSampleKindTypeEnum ,
    sampleKind?: IRNGSampleKindTypeEnum 
): { uniform: IRNG, normal: IRNGNormal, sampleKind: IRNGSampleKindTypeEnum }
{
    let gu = globalUni();
    let no = globalNorm();
    let sk = globalSampleKind();

    function testAndSetUniform(u: UniformMapKey): boolean
    {
        const tu =  uniformMap[u];
        if (tu) 
        {
            // do nothing if it is the same type
            if (tu.kind !== (gu.constructor as unknown as typeof IRNG).kind){
                gu.unregister(MessageType.INIT, no.reset);
                gu = globalUni(new tu());
                no.reset(gu);
            }
            return true;
        }
        return false;
    }

    function testAndSetNormal(n: NormalMapKey): boolean
    {

        const tn = normalMap[n];
        if (tn)
        {
            if (tn.kind !== (no.constructor as unknown as typeof IRNGNormal).kind)
            // do nothing if it is the same type
            {
                gu.unregister(MessageType.INIT, no.reset);
                no = globalNorm(new tn());
                no.reset(gu);
            }
            return true;
        }
        return false;
    }

    function testAndSetSampleKind(s: IRNGSampleKindTypeEnum): boolean
    {
        if (
            s === IRNGSampleKindTypeEnum.REJECTION
            ||
            s === IRNGSampleKindTypeEnum.ROUNDING)
        {
            if (s !== sk)
            {
                sk = globalSampleKind(s);
            }
            return true;
        }
        return false;
    }


    // 0 arguments,  dud
    //if (!uniform && !normal && !sampleKind){
    //    return { uniform: gu, normal: no, sampleKind: sk };
    //}

    // 1 argument
    // Is it?:
    // 1. uniform
    // 2. normal
    // 3. sample kind
    if (uniform && !normal && !sampleKind)
    {
        if (testAndSetUniform(uniform as UniformMapKey) === false)
        {
            if (testAndSetNormal(uniform as NormalMapKey) === false)
            {
                testAndSetSampleKind(uniform as IRNGSampleKindTypeEnum)
            }
        }
    }
    //there are 2 arguments
    // possibilities:
    // 1. uniform & normal
    // 2. normal & samplekind
    // 3. uniform & samplekind
    if (uniform && normal && !sampleKind)
    {
        // 1
        if (false === (testAndSetUniform(uniform as UniformMapKey) && testAndSetNormal(normal as NormalMapKey)))
        {
            //2
            if (false === (testAndSetNormal(uniform as NormalMapKey) && testAndSetSampleKind(normal as IRNGSampleKindTypeEnum)))
            {
                //3
                testAndSetUniform(uniform as UniformMapKey);
                testAndSetSampleKind(normal as IRNGSampleKindTypeEnum);
            }
        }
        //
    }

    // there are 3 arguments, just as easy as 1
    if (uniform && normal && sampleKind)
    {
        testAndSetUniform(uniform as UniformMapKey);
        testAndSetNormal(normal as NormalMapKey);
        testAndSetSampleKind(sampleKind);
    }

    return { uniform: gu, normal: no, sampleKind: sk };

}


//init
(globalThis as EgT)[symRNG] = new MersenneTwister;
(globalThis as EgT)[symRNGNormal] = new Inversion((globalThis as EgT)[symRNG]);
(globalThis as EgT)[symSampleKind] = IRNGSampleKindTypeEnum.ROUNDING;


