import { IRNG } from "../irng";
import { IRandom } from "../IRandom";
export declare class KnuthTAOCP extends IRNG implements IRandom {
    private m_seed;
    private get KT_pos();
    private set KT_pos(value);
    private fixupSeeds;
    private KT_next;
    private RNG_Init_R_KT;
    private ran_arr_cycle;
    private ran_array;
    constructor(_seed?: number);
    init(_seed?: number): void;
    set seed(_seed: Uint32Array);
    get seed(): Uint32Array;
    random(): number;
}
//# sourceMappingURL=index.d.ts.map