import { IRNG } from "../irng";
export declare const SEED_LEN = 2;
export declare class SuperDuper extends IRNG {
    private m_seed;
    constructor(_seed?: number);
    random(): number;
    private fixupSeeds;
    init(_seed?: number): void;
    set seed(_seed: Int32Array | Uint32Array);
    get seed(): Int32Array | Uint32Array;
}
//# sourceMappingURL=index.d.ts.map