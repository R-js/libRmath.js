import { SuperDuper } from '../';
import { samples25fromSeed1234, stateAfterSeed4568, samplesAfterCorrectedSeed } from './fixture';
import '$jest-extension';

describe('rng super-duper', function () {
    it('compare 25 samples seed=0', () => {
        const sd = new SuperDuper();
        sd.init(1234);
        const result = sd.randoms(25);
        expect(result).toEqualFloatingPointBinary(samples25fromSeed1234, 23, false, false);
    });
    it('check seed data after setting seed to "1234"', () => {
        const sd = new SuperDuper();
        sd.init(4568);
        expect(sd.seed).toEqual(new Int32Array(stateAfterSeed4568));
    });
    it('restore seed should generate same sequence of randoms', () => {
        const sd = new SuperDuper(7895);
        const seed0 = sd.seed;
        const var1 = sd.random();
        sd.randoms(100);
        sd.seed = seed0;
        const var2 = sd.random();
        expect(var1).toBe(var2);
    });
    it('check state vars', () => {
        const sd = new SuperDuper(7895);
        expect(sd.name).toBe('Super-Duper');
        expect(sd.kind).toBe('SUPER_DUPER');
        expect(() => (sd.seed = new Int32Array(6))).toThrow(
            'the seed is not an array of proper size for rng SUPER_DUPER',
        );
        // set seed to all zeros , will trigger internal correction
        expect(() => (sd.seed = new Int32Array(2))).not.toThrow();
        expect(sd.randoms(2)).toEqualFloatingPointBinary(samplesAfterCorrectedSeed, 23, false);
        //console.log(sd.randoms(2));
    });
});
