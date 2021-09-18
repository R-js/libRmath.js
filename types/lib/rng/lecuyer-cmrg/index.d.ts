import { IRNG } from "../irng";
export declare const SEED_LEN = 6;
export declare class LecuyerCMRG extends IRNG {
    private m_seed;
    constructor(_seed?: number);
    init(_seed?: number): void;
    random(): number;
    set seed(_seed: Int32Array);
    get seed(): Int32Array;
}
//# sourceMappingURL=index.d.ts.map