import { IRNG } from "../irng";
export declare const SEED_LEN = 101;
export declare class KnuthTAOCP2002 extends IRNG {
    private qualityBuffer;
    private ran_arr_buf;
    private m_seed;
    private ran_x;
    private get KT_pos();
    private set KT_pos(value);
    private ran_array;
    private ran_arr_cycle;
    private ran_start;
    private RNG_Init_KT2;
    private KT_next;
    constructor(_seed?: number);
    random(): number;
    init(_seed?: number): void;
    set seed(_seed: Uint32Array);
    get seed(): Uint32Array;
}
//# sourceMappingURL=index.d.ts.map