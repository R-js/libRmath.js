import type { IRNGNormal } from "../../rng/normal/normal-rng";
export declare function dnbinom(x: number, size: number, prob?: number, mu?: number, giveLog?: boolean): number;
export declare function pnbinom(q: number, size: number, prob?: number, mu?: number, lowerTail?: boolean, logP?: boolean): number;
export declare function qnbinom(p: number, size: number, prob?: number, mu?: number, lowerTail?: boolean, logP?: boolean): number;
export declare function rnbinom(n: number, size: number, prob?: number, mu?: number, rng?: IRNGNormal): Float64Array;
//# sourceMappingURL=index.d.ts.map