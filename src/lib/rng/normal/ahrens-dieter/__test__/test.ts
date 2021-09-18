import { AhrensDieter } from '../../..';
import { IRNGNormalTypeEnum } from '../../in01-type';
import _1000Samples from './fixture-1000';
import {
    rnormAfterSeed1234,
    rnormAfterUniformRNGBleed,
    rnormAfterUniformRNGBleed2,
    rnormAfterUniformRNGReset,
} from './fixture';


describe('rng ahrens-dieter', function () {
    it('compare 1000 samples seed=1234', () => {
        //1000 samples hits all pathways in the algorithm
        const ad = new AhrensDieter(); // by default will use Mersenne-Twister like in R
        ad.uniform_rng.init(1234);
        const result = ad.randoms(1e3);
        expect(result).toEqualFloatingPointBinary(_1000Samples, 22, false, false);
    });
    it('compare 10 samples seed=1234', () => {
        const ad = new AhrensDieter(); // by default will use Mersenne-Twister like in R
        ad.uniform_rng.init(1234);
        const result1 = ad.randoms(10);
        expect(result1).toEqualFloatingPointBinary(rnormAfterSeed1234, 22, false, false);
    });
    it('get from underlying uniform rng', () => {
        const ad = new AhrensDieter(); // by default will use Mersenne-Twister like in R
        ad.uniform_rng.init(1234);
        ad.randoms(10);
        const univar1 = ad.uniform_rng.random();
        expect(univar1).toEqualFloatingPointBinary(0.28273358359, 22, false, false);
    });
    it('get from normal rng after get from underlying uniform rng', () => {
        const ad = new AhrensDieter(); // by default will use Mersenne-Twister like in R
        ad.uniform_rng.init(1234);
        ad.randoms(10);
        ad.uniform_rng.random();
        const result = ad.randoms(4);
        expect(result).toEqualFloatingPointBinary(rnormAfterUniformRNGBleed, 22, false, false);
    });
    it('get uniform from underlying rng', () => {
        const ad = new AhrensDieter(); // by default will use Mersenne-Twister like in R
        ad.uniform_rng.init(1234);
        ad.randoms(10);
        ad.uniform_rng.random();
        ad.randoms(4);
        const result = ad.uniform_rng.randoms(-1);
        expect(result).toEqualFloatingPointBinary(0.186722789658, 22, false, false);
        const result2 = ad.randoms(2);
        expect(result2).toEqualFloatingPointBinary(rnormAfterUniformRNGBleed2, 22, false, false);
    });

    it('get from normal rng after reset underlying uniform rng', () => {
        const ad = new AhrensDieter(); // by default will use Mersenne-Twister like in R
        ad.randoms(10);
        ad.uniform_rng.random();
        ad.uniform_rng.init(0);
        const result = ad.randoms(2);
        expect(result).toEqualFloatingPointBinary(rnormAfterUniformRNGReset, 22, false, false);
    });
    it('identity', () => {
        const ad = new AhrensDieter();
        expect(ad.name).toBe('Ahrens-Dieter');
        expect(ad.kind).toBe(IRNGNormalTypeEnum.AHRENS_DIETER);
    });
});
