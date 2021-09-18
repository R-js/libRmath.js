import { IRNG } from "../irng";
export declare const SEED_LEN = 3;
export declare class WichmannHill extends IRNG {
    private m_seed;
    random(): number;
    constructor(_seed?: number);
    fixupSeeds(): void;
    init(_seed?: number): void;
    set seed(_seed: Uint32Array);
    get seed(): Uint32Array;
}
//# sourceMappingURL=index.d.ts.map