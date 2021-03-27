import { MersenneTwister } from '../../';
import { samples100fromSeed1234, seedStateAfterSeed1234 } from './fixture';
import '$jest-extension';

describe('rng mersenne-twister', function () {
    it('seed=12345, 2 samples',()=>{
        const mt = new MersenneTwister();
        mt.init(12345);
        const result = mt.randoms(10);
        expect(result).toEqualFloatingPointBinary([
            0.72090389626100659,
            0.87577319308184087,
            0.76098232832737267,
            0.88612456619739532,
            0.45648096012882888,
            0.16637178510427475,
            0.32509538671001792,
            0.50922433566302061,
            0.72770525375381112,
            0.98973693791776896
        ]);
    });
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
        const seed0 = mt.seed; // copy
        const var1 = mt.random();
        // bleed 100 randoms
        mt.randoms(100);
        mt.seed = seed0;
        const var2 = mt.random();
        expect(var1).toBe(var2);
    });
    it('check state vars', () => {
        const mt = new MersenneTwister(7895);
        expect(mt.name).toBe('Mersenne-Twister');
        expect(mt.kind).toBe('MERSENNE_TWISTER');
        expect(() => (mt.seed = new Int32Array(6))).toThrow(
            'the seed is not an array of proper size for rng MERSENNE_TWISTER',
        );
        expect(() => (mt.seed = new Int32Array(625))).not.toThrow();
    });
});
