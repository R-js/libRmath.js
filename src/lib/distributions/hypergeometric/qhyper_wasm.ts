import base64ToBinary from '@lib/base64_to_binary';

// wasm module needs these native functions

const callbacks = {
    simple: {
        log: Math.log,
        exp: Math.exp
    }
};

function getWasmAsDecode() {
    const base64_v2 = 'AGFzbQEAAAABEgJgAXwBfGAIfHx8fHx8fHwBfAIbAgZzaW1wbGUDbG9nAAAGc2ltcGxlA2V4cAAAAwMCAQEHGAIJY2FsY1RpbnlOAAIIY2FsY0JpZ04AAwrHAQJgAANAIAMgBGMgACACY3EEQCAAIAEgByADRAAAAAAAAPA/oCIDoyAFIAZEAAAAAAAA8D+gIgajoqIiAaAhACAFRAAAAAAAAPA/oSEFIAdEAAAAAAAA8D+hIQcMAQsLIAMLZAADQCADIARjIAAgAmNxBEAgACABIAcgA0QAAAAAAADwP6AiA6MgBSAGRAAAAAAAAPA/oCIGo6IQAKAiARABoCEAIAVEAAAAAAAA8D+hIQUgB0QAAAAAAADwP6EhBwwBCwsgAwsAfgRuYW1lATwEAApzaW1wbGUvbG9nAQpzaW1wbGUvZXhwAhBzaW1wbGUvY2FsY1RpbnlOAw9zaW1wbGUvY2FsY0JpZ04COQQAAAEAAggAATABATECATIDATMEATQFATUGATYHATcDCAABMAEBMQIBMgMBMwQBNAUBNQYBNgcBNw==';
    return base64_v2;
}
export type CalcQHyper = (
    sum: number,
    term: number,
    p: number,
    xr: number,
    xend: number,
    xb: number,
    NB: number,
    NR: number
) => number;

export type QHyperFunctionMap = {
    calcTinyN: CalcQHyper;
    calcBigN: CalcQHyper;
};

export function initWasm(): QHyperFunctionMap {
    const binary = base64ToBinary(getWasmAsDecode());
    const mod = new WebAssembly.Module(binary);
    const instance = new WebAssembly.Instance(mod, callbacks);
    // get the functions from wasm
    return {
        calcTinyN: instance.exports.calcTinyN as CalcQHyper,
        calcBigN: instance.exports.calcBigN as CalcQHyper
    };
}
