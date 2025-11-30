import { samples25fromSeed1234 } from './fixture';
import { getWasmModule } from '../wasm-module';

describe('rng (wasm) wichman-hill', function () {
    it('bulk 25 samples seed=1234', () => {
        const memory = new WebAssembly.Memory({ initial: 1 });
        const wasmModule = getWasmModule();
        const instance = new WebAssembly.Instance(wasmModule, {
            env: { memory }
        });
        const { init, randoms } = instance.exports as { 
            random: () => number;
            init: (a: number) => void;
            randoms: (offset: number, cnt: number) => number
        };
        init(1234);
        const result = randoms(10, 25);
        expect(result).toBe(25);
        const rc = new Float64Array(memory.buffer.slice(10, 10+25*8));
        expect(rc).toEqualFloatingPointBinary(samples25fromSeed1234, 23, false, false);
    });
});
