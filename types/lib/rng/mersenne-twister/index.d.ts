import { IRNG } from "../irng";
export declare const SEED_LEN = 625;
export declare class MersenneTwister extends IRNG {
    private m_seed;
    private mt;
    private mti;
    private MT_sgenrand;
    private MT_genrand;
    private fixupSeeds;
    random(): number;
    constructor(_seed?: number);
    init(_seed?: number): void;
    set seed(_seed: Int32Array);
    get seed(): Int32Array;
}
//# sourceMappingURL=index.d.ts.map