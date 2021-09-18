export declare type CalcQHyper = (sum: number, term: number, p: number, xr: number, xend: number, xb: number, NB: number, NR: number) => number;
export declare type QHyperFunctionMap = {
    calcTinyN: CalcQHyper;
    calcBigN: CalcQHyper;
};
export declare function initWasm(): Promise<QHyperFunctionMap>;
//# sourceMappingURL=qhyper_wasm.d.ts.map