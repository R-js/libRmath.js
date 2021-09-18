import { IRNG } from "../irng";
import { IRNGNormalTypeEnum } from "./in01-type";
import type { IRandom } from "../IRandom";
export declare class IRNGNormal implements IRandom {
    protected _rng: IRNG;
    protected _name: string;
    protected _kind: IRNGNormalTypeEnum;
    protected reset(): void;
    constructor(_rng: IRNG, name: string, kind: IRNGNormalTypeEnum);
    randoms(n: number): Float32Array;
    random(): number;
    get name(): string;
    get kind(): IRNGNormalTypeEnum;
    get uniform_rng(): IRNG;
}
//# sourceMappingURL=normal-rng.d.ts.map