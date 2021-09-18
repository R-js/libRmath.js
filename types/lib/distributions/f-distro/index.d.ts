import type { IRNGNormal } from "../../rng/normal/normal-rng";
export declare function df(x: number, df1: number, df2: number, ncp?: number, log?: boolean): number;
export declare function pf(q: number, df1: number, df2: number, ncp?: number, lowerTail?: boolean, logP?: boolean): number;
export declare function qf(p: number, df1: number, df2: number, ncp?: number, lowerTail?: boolean, logP?: boolean): number;
export declare function rf(n: number, df1: number, df2: number, ncp?: number, rng?: IRNGNormal): Float64Array;
//# sourceMappingURL=index.d.ts.map