import { IRNG } from "../../irng";
import { IRNGNormal } from "../normal-rng";
export declare class BoxMuller extends IRNGNormal {
    private BM_norm_keep;
    protected reset(): void;
    constructor(_rng?: IRNG);
    random(): number;
}
//# sourceMappingURL=index.d.ts.map