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
import type { IRNGType } from './rng-types';
import type { IRNGNormalType } from './normal/rng-types';
import type { SampleKindType } from './sample-kind-type';

const uniformMap = {
    // uniform
    KNUTH_TAOCP: KnuthTAOCP,
    KNUTH_TAOCP2002: KnuthTAOCP2002,
    LECUYER_CMRG: LecuyerCMRG,
    MARSAGLIA_MULTICARRY: MarsagliaMultiCarry,
    MERSENNE_TWISTER: MersenneTwister,
    SUPER_DUPER: SuperDuper,
    WICHMANN_HILL: WichmannHill
};

const normalMap = {
    // normal
    AHRENS_DIETER: AhrensDieter,
    BOX_MULLER: BoxMuller,
    BUGGY_KINDERMAN_RAMAGE: BuggyKindermanRamage,
    INVERSION: Inversion,
    KINDERMAN_RAMAGE: KindermanRamage
};

const uniformKeys: Record<IRNGType, IRNGType> = {
    // uniform
    KNUTH_TAOCP: 'KNUTH_TAOCP',
    KNUTH_TAOCP2002: 'KNUTH_TAOCP2002',
    LECUYER_CMRG: 'LECUYER_CMRG',
    MARSAGLIA_MULTICARRY: 'MARSAGLIA_MULTICARRY',
    MERSENNE_TWISTER: 'MERSENNE_TWISTER',
    SUPER_DUPER: 'SUPER_DUPER',
    WICHMANN_HILL: 'WICHMANN_HILL'
};

const normalKeys: Record<IRNGNormalType, IRNGNormalType> = {
    AHRENS_DIETER: 'AHRENS_DIETER',
    BOX_MULLER: 'BOX_MULLER',
    BUGGY_KINDERMAN_RAMAGE: 'BUGGY_KINDERMAN_RAMAGE',
    INVERSION: 'INVERSION',
    KINDERMAN_RAMAGE: 'KINDERMAN_RAMAGE'
};

const sampleKind: Record<SampleKindType, SampleKindType> = {
    ROUNDING: 'ROUNDING',
    REJECTION: 'REJECTION'
};

const symRNG = Symbol.for('rngUNIFORM');
const symRNGNormal = Symbol.for('rngNORMAL');
const symSampleKind = Symbol.for('sample.kind');

type EgT = typeof globalThis & {
    [symRNG]: IRNG;
    [symRNGNormal]: IRNGNormal;
    [symSampleKind]: SampleKindType;
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

export function globalSampleKind(d?: SampleKindType): SampleKindType {
    if (d) {
        (globalThis as EgT)[symSampleKind] = d;
    }
    return (globalThis as EgT)[symSampleKind];
}

export type RandomGenSet = {
    uniform?: IRNGType;
    normal?: IRNGNormalType;
    sampleKind?: SampleKindType;
};

export function setSeed(seed: number, randomSet?: RandomGenSet): void {
    if (typeof seed !== 'number') {
        throw new Error('Seed needs to bea number');
    }
    if (isNaN(seed) || !isFinite(seed)) {
        throw new Error('Seed needs to be a finite number');
    }
    if (randomSet) {
        RNGkind(randomSet);
    }
    const gu = globalUni();

    const s = new Uint32Array([0]);
    s[0] = seed;
    if (s[0] !== seed) {
        throw new Error(`Seed needs to be an unsigned 32 bit integer, it is ${seed}`);
    }
    gu.init(seed);
}

function RNGkind(opt: RandomGenSet = {}): RandomGenSet {
    let gu = globalUni();
    let no = globalNorm();
    let sk = globalSampleKind();

    function testAndSetUniform(u: IRNGType): boolean {
        const tu = uniformMap[u];
        if (tu) {
            // do nothing if it is the same type
            if (tu.kind !== (gu.constructor as unknown as typeof IRNG).kind) {
                // different so change it
                // it IS bound, (this happens in the constructor of the rng)
                // eslint-disable-next-line @typescript-eslint/unbound-method
                no.unregister(); // decouple the normal rng from the old uniform rng
                gu = globalUni(new tu()); // replace global uniform
                no.register(gu); // register the uniform rng as a source of the existing normal rng
            }
            return true;
        }
        return false;
    }

    function testAndSetNormal(n: IRNGNormalType): boolean {
        const tn = normalMap[n];
        if (tn) {
            if (tn.kind !== (no.constructor as unknown as typeof IRNGNormal).kind) {
                // do nothing if it is the same type
                // it IS bound, above line...
                // eslint-disable-next-line @typescript-eslint/unbound-method
                // we need to de-couple all normal rngs that this inrg
                no.unregister();
                no = globalNorm(new tn(gu));
                no.register(gu);
            }
            return true;
        }
        return false;
    }

    function testAndSetSampleKind(s: SampleKindType): boolean {
        if (s === 'REJECTION' || s === 'ROUNDING') {
            if (s !== sk) {
                sk = globalSampleKind(s);
            }
            return true;
        }
        return false;
    }

    if (opt.uniform) {
        testAndSetUniform(opt.uniform); // replace it if it is different
    }

    if (opt.normal) {
        testAndSetNormal(opt.normal);
    }

    if (opt.sampleKind) {
        testAndSetSampleKind(opt.sampleKind);
    }

    return {
        uniform: (gu.constructor as unknown as typeof IRNG).kind,
        normal: (no.constructor as unknown as typeof IRNGNormal).kind,
        sampleKind: sk
    };
}

RNGkind.uniform = uniformKeys;
RNGkind.normal = normalKeys;
RNGkind.sampleKind = sampleKind;

export { RNGkind };

export function randomSeed(internalState?: Uint32Array | Int32Array): Uint32Array | Int32Array | never {
    const gu = globalUni();
    if (internalState === undefined) {
        return gu.seed;
    }
    const state = gu.seed;
    if (state.constructor.name === internalState.constructor.name && state.length === internalState.length) {
        gu.seed = internalState;
    }
    throw new Error(`the internal state of ${gu.name} is a ${state.constructor.name} of length ${state.length}`);
}

//init
(globalThis as EgT)[symRNG] = new MersenneTwister();
(globalThis as EgT)[symRNGNormal] = new Inversion((globalThis as EgT)[symRNG]);
(globalThis as EgT)[symSampleKind] = 'ROUNDING';
