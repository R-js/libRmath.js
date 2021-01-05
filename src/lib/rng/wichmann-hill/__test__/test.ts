import { WichmannHill } from '../';
import { samples25fromSeed1234, stateAfterSeed1234, samplesAfterCorrectedSeed } from './fixture';
import '$jest-extension';

describe('rng wichman-hill', function () {
    it('compare 25 samples seed=0', () => {
        const wh = new WichmannHill();
        wh.init(1234);
        const result = wh.randoms(25);
        expect(result).toEqualFloatingPointBinary(samples25fromSeed1234, 23, false, false);
    });
    it('check seed data after setting seed to "1234"', () => {
        const wh = new WichmannHill();
        wh.init(1234);
        expect(wh.seed).toEqual(new Uint32Array(stateAfterSeed1234));
    });
    it('restore seed should generate same sequence of randoms', () => {
        const wh = new WichmannHill(7895);
        const seed0 = wh.seed;
        const var1 = wh.random();
        wh.randoms(100);
        wh.seed = seed0;
        const var2 = wh.random();
        expect(var1).toBe(var2);
    });
    it('check state vars', () => {
        const wh = new WichmannHill(7895);
        expect(wh.name).toBe('Wichmann-Hill');
        expect(wh.kind).toBe('WICHMANN_HILL');
        expect(() => (wh.seed = new Uint32Array(6))).toThrow(
            'the seed is not an array of proper size for rng WICHMANN_HILL',
        );
        // set seed to all zeros , will trigger internal correction
        expect(() => (wh.seed = new Uint32Array(3))).not.toThrow();
        expect(wh.randoms(2)).toEqualFloatingPointBinary(samplesAfterCorrectedSeed, 23, false);
        //console.log(sd.randoms(2));
    });
});
