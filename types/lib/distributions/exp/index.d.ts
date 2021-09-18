import type { IRNG } from "../../rng/irng";
export declare function dexp(x: number, rate?: number, asLog?: boolean): number;
export declare function pexp(q: number, rate?: number, lowerTail?: boolean, logP?: boolean): number;
export declare function qexp(p: number, rate?: number, lowerTail?: boolean, logP?: boolean): number;
export declare function rexp(n: number, rate?: number, rng?: IRNG): Float64Array;
//# sourceMappingURL=index.d.ts.map