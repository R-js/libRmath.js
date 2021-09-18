export { dhyper } from "./dhyper";
export { phyper } from "./phyper";
export { qhyper } from "./qhyper";
import type { QHyperFunctionMap, CalcQHyper } from "./qhyper_wasm";
export type { QHyperFunctionMap, CalcQHyper };
export declare function rhyper(N: number, nn1in: number, nn2in: number, kkin: number, rng?: import("../..").IRNG): Float64Array;
export declare function useWasmBackends(): Promise<void>;
export declare function clearBackends(): boolean;
//# sourceMappingURL=index.d.ts.map