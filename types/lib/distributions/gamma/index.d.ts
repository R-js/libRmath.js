import type { IRNGNormal } from "../../rng/normal/normal-rng";
export { rgammaOne } from "./rgamma";
export declare function dgamma(x: number, shape: number, rate?: number, scale?: number, asLog?: boolean): number;
export declare function qgamma(q: number, shape: number, rate?: number, scale?: number, lowerTail?: boolean, logP?: boolean): number;
export declare function pgamma(q: number, shape: number, rate?: number, scale?: number, lowerTail?: boolean, logP?: boolean): number;
export declare function rgamma(n: number, shape: number, rate?: number, scale?: number, rng?: IRNGNormal): Float64Array;
//# sourceMappingURL=index.d.ts.map