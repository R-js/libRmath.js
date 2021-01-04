import { MersenneTwister } from '../';
import { samples100fromSeed1234, seedStateAfterSeed1234, sample10fromSeed0 } from './fixture';
import '$jest-extension';
sample10fromSeed0;
describe('rng mersenne-twister', function () {
    it('compare 100 samples seed=0', () => {
        const mt = new MersenneTwister();
        mt.init(1234);
        const result = mt.randoms(100);
        expect(result).toEqualFloatingPointBinary(samples100fromSeed1234, 22, false, false);
    });
    it('check seed data after setting seed to "1234"', () => {
        const mt = new MersenneTwister();
        mt.init(4568);
        expect(mt.seed).toEqual(new Int32Array(seedStateAfterSeed1234));
    });
    it('restore seed should generate same sequence of randoms', () => {
        const mt = new MersenneTwister(7895);
        const seed0 = mt.seed.slice(); // copy
        const var1 = mt.random();
        // bleed 100 randoms
        mt.randoms(100);
        mt.seed = seed0;
        const var2 = mt.random();
        expect(var1).toBe(var2);
    });
    it('check state vars',()=>{
        const mt = new MersenneTwister(7895);
        console.log(mt.name);
    }
});
