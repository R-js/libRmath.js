import { MarsagliaMultiCarry } from '../';
import { samples100fromSeed1234, seedStateAfterSeed1234 } from './fixture';
import '$jest-extension';

describe('rng marsaglia-multicarry', function () {
    it('compare 100 samples seed=0', () => {
        const mmc = new MarsagliaMultiCarry();
        mmc.init(1234);
        const result = mmc.randoms(100);
        expect(result).toEqualFloatingPointBinary(samples100fromSeed1234, 22, false, false);
    });
    it('check seed data after setting seed to "1234"', () => {
        const mmc = new MarsagliaMultiCarry();
        mmc.init(1234);
        expect(mmc.seed).toEqual(new Int32Array(seedStateAfterSeed1234));
    });
    it('restore seed should generate same sequence of randoms', () => {
        const mmc = new MarsagliaMultiCarry();
        const seed0 = mmc.seed.slice(); // copy
        const var1 = mmc.random();
        // bleed 100 randoms
        mmc.randoms(100);
        mmc.seed = seed0;
        const var2 = mmc.random();
        expect(var1).toBe(var2);
    });
});
