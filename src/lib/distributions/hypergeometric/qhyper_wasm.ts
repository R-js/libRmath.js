// wasm module needs these native functions
const callbacks = {
    simple: {
        log: Math.log,
        exp: Math.exp
    }
};

const base64 = 'AGFzbQEAAAABEgJgAXwBfGAIfHx8fHx8fHwBfAIbAgZzaW1wbGUDbG9nAAAGc2ltcGxlA2V4cAAAAwMCAQEFAwEAAAchAwljYWxjVGlueU4AAghjYWxjQmlnTgADBm1lbW9yeQIACssBAmIAA0AgAyAEY0EAIAAgAmMbBEAgACABIAcgA0QAAAAAAADwP6AiA6MgBSAGRAAAAAAAAPA/oCIGo6KgIgGgIQAgBUQAAAAAAADwP6EhBSAHRAAAAAAAAPA/oSEHDAELCyADC2YAA0AgAyAEY0EAIAAgAmMbBEAgACABIAcgA0QAAAAAAADwP6AiA6MgBSAGRAAAAAAAAPA/oCIGo6IQAKAiARABoCEAIAVEAAAAAAAA8D+hIQUgB0QAAAAAAADwP6EhBwwBCwsgAwsAIxBzb3VyY2VNYXBwaW5nVVJMES4vc2ltcGxlLndhc20ubWFw';

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
    calcTinyN: CalcQHyper
    calcBigN: CalcQHyper
}    

export async function initWasm(): Promise<QHyperFunctionMap> {
    const binary = Buffer.from(base64, 'base64');
    const mod = await WebAssembly.instantiate(binary, callbacks);
    // get the functions from wasm
    return { 
            calcTinyN: mod.instance.exports.calcTinyN as CalcQHyper,
            calcBigN: mod.instance.exports.calcBigN as CalcQHyper,
    };
}

