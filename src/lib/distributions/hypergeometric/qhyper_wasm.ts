// wasm module needs these native functions
const callbacks = {
    simple: {
        log: Math.log,
        exp: Math.exp
    }
};

//const base64 = 'AGFzbQEAAAABEgJgAXwBfGAIfHx8fHx8fHwBfAIbAgZzaW1wbGUDbG9nAAAGc2ltcGxlA2V4cAAAAwMCAQEFAwEAAAchAwljYWxjVGlueU4AAghjYWxjQmlnTgADBm1lbW9yeQIACssBAmIAA0AgAyAEY0EAIAAgAmMbBEAgACABIAcgA0QAAAAAAADwP6AiA6MgBSAGRAAAAAAAAPA/oCIGo6KgIgGgIQAgBUQAAAAAAADwP6EhBSAHRAAAAAAAAPA/oSEHDAELCyADC2YAA0AgAyAEY0EAIAAgAmMbBEAgACABIAcgA0QAAAAAAADwP6AiA6MgBSAGRAAAAAAAAPA/oCIGo6IQAKAiARABoCEAIAVEAAAAAAAA8D+hIQUgB0QAAAAAAADwP6EhBwwBCwsgAwsAIxBzb3VyY2VNYXBwaW5nVVJMES4vc2ltcGxlLndhc20ubWFw';

const base64_v2 = 'AGFzbQEAAAABEgJgAXwBfGAIfHx8fHx8fHwBfAIbAgZzaW1wbGUDbG9nAAAGc2ltcGxlA2V4cAAAAwMCAQEFAwEAAAchAwljYWxjVGlueU4AAghjYWxjQmlnTgADBm1lbW9yeQIACssBAmIAA0AgAyAEY0EAIAAgAmMbBEAgACABIAcgA0QAAAAAAADwP6AiA6MgBSAGRAAAAAAAAPA/oCIGo6KgIgGgIQAgBUQAAAAAAADwP6EhBSAHRAAAAAAAAPA/oSEHDAELCyADC2YAA0AgAyAEY0EAIAAgAmMbBEAgACABIAcgA0QAAAAAAADwP6AiA6MgBSAGRAAAAAAAAPA/oCIGo6IQAKAiARABoCEAIAVEAAAAAAAA8D+hIQUgB0QAAAAAAADwP6EhBwwBCwsgAwsAvwEEbmFtZQE8BAAKc2ltcGxlL2xvZwEKc2ltcGxlL2V4cAIQc2ltcGxlL2NhbGNUaW55TgMPc2ltcGxlL2NhbGNCaWdOAj0EAAEAAAEBAAACCAABMAEBMQIBMgMBMwQBNAUBNQYBNgcBNwMIAAEwAQExAgEyAwEzBAE0BQE1BgE2BwE3BDUCAApmNjRfPT5fZjY0ASZmNjRfZjY0X2Y2NF9mNjRfZjY0X2Y2NF9mNjRfZjY0Xz0+X2Y2NAYEAQABMA=='

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
    const binary = Buffer.from(base64_v2, 'base64');
    const mod = await WebAssembly.instantiate(binary, callbacks);
    // get the functions from wasm
    return { 
            calcTinyN: mod.instance.exports.calcTinyN as CalcQHyper,
            calcBigN: mod.instance.exports.calcBigN as CalcQHyper,
    };
}

