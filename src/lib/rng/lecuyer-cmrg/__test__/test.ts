import { LecuyerCMRG } from '../..';
import { sample100, seedFixture } from './fixture';


describe('rng lecuyer-cmrg', function () {
    it('compare 100 samples seed=0', () => {
        const lcmrg = new LecuyerCMRG();
        lcmrg.init(0);
        const result = lcmrg.randoms(100);
        expect(result).toEqualFloatingPointBinary(sample100, 22, false, false);
    });
    it('check seed data after setting seed to "1234"', () => {
        const lcmrg = new LecuyerCMRG();
        lcmrg.init(1234);
        expect(lcmrg.seed).toEqual(new Int32Array(seedFixture));
    });
    it('restore seed should generate same sequence of randoms', () => {
        const lcmrg = new LecuyerCMRG();
        const seed0 = lcmrg.seed.slice(); // copy
        const var1 = lcmrg.random();
        // bleed 100 randoms
        lcmrg.randoms(100);
        lcmrg.seed = seed0;
        const var2 = lcmrg.random();
        expect(var1).toBe(var2);
    });
});
