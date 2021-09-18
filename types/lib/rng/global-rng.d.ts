import { IRNG } from "./irng";
import { IRNGNormal } from "./normal/normal-rng";
import { IRNGTypeEnum } from "./irng-type";
import { IRNGNormalTypeEnum } from "./normal/in01-type";
export declare function globalUni(d?: IRNG): IRNG;
export declare function globalNorm(d?: IRNGNormal): IRNGNormal;
export declare function RNGKind(uniform?: IRNGTypeEnum | IRNGNormalTypeEnum, normal?: IRNGNormalTypeEnum): {
    uniform: IRNG;
    normal: IRNGNormal;
};
//# sourceMappingURL=global-rng.d.ts.map