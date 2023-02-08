
import { ceil } from '@lib/r-func';

const memory: WebAssembly.Memory = new WebAssembly.Memory({
    initial: 1 //  one 64k block
});

function growIn64KBlocks(size: number, current: number){
    const grow = size-current;
    if (grow <= 0)
    {
        return 0;
    }
    const grow64k = ceil(grow/65536);
    return grow64k;
}

export function growMemory(size: number): boolean {
    const blkCnt =  growIn64KBlocks(size * 8, memory.buffer.byteLength);
    if (blkCnt > 0){
        memory.grow(blkCnt);
        return true;
    }
    return false;
}

const base64_v2 ='AGFzbQEAAAABCQFgBH9/f38BfAIPAQNlbnYGbWVtb3J5AgAAAwIBAAcNAQljc2lnbnJhbmsAAArfAQHcAQECf0EBIAAgAkogAEEASBsEQEQAAAAAAAAAAA8LIAIgAGsgACAAIANKGyABQQFGBEBEAAAAAAAA8D8PC0EDdCEEQQArAwBEAAAAAAAA8D9hBEAgBCsDAA8LQQBEAAAAAAAA8D85AwBBCEQAAAAAAADwPzkDAEECIQADQCABQQFqIABKBEAgAEEBaiAAbEECbSICIAMgAiADSBshAgNAIAAgAkwEQCACQQN0IgUgBSsDACACIABrQQN0KwMAoDkDACACQQFrIQIMAQsLIABBAWohAAwBCwsgBCsDAAsASwRuYW1lAQwBAAljc2lnbnJhbmsCFQEABgABMAEBMQIBMgMBMwQBNAUBNQQZAQAWaTMyX2kzMl9pMzJfaTMyXz0+X2Y2NAYEAQABMA==';

export type CSingRank = (
    k: number,
    n: number,
    u: number,
    c: number
    ) => number;

export type CSignRankMap = {
    csignrank: CSingRank;
}    
    
export function initWasm(): CSignRankMap {
    const binary = Buffer.from(base64_v2, 'base64');
    const mod = new WebAssembly.Module(binary);
    const instance = new WebAssembly.Instance(mod,  { env: { memory }});
    return {
        csignrank: instance.exports.csignrank as CSingRank
    }
}

export { memory }





