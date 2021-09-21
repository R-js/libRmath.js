import { KindermanRamage } from '@rng/normal/kinderman-ramage';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';
import { testData } from './fixture';
import  { _1000Samples } from './_1000flushSample';

const { rnorm10, runif1, rnorm4, runif1_2, rnorm2, rnorm2AfterResetSeedTo0 } = testData;


describe('rng kinderman ramage', function () {
    it('compare 10 samples seed=1234', () => {
        const kr = new KindermanRamage(); // by default will use Mersenne-Twister like in R
        kr.uniform_rng.init(1234);
        const result1 = kr.randoms(10);
        expect(result1).toEqualFloatingPointBinary(rnorm10, 22, false, false);
    });
    it('get from underlying uniform rng', () => {
        const inv = new KindermanRamage(); // by default will use Mersenne-Twister like in R
        inv.uniform_rng.init(1234);
        inv.randoms(10);
        const univar1 = inv.uniform_rng.random();
        expect(univar1).toEqualFloatingPointBinary(runif1, 22, false, false);
    });
    it('get from normal rng after get from underlying uniform rng', () => {
        const inv = new KindermanRamage(); // by default will use Mersenne-Twister like in R
        inv.uniform_rng.init(1234);
        inv.randoms(10);
        inv.uniform_rng.random();
        const result = inv.randoms(4);
        expect(result).toEqualFloatingPointBinary(rnorm4, 22, false, false);
    });
    it('get uniform from underlying rng', () => {
        const inv = new KindermanRamage(); // by default will use Mersenne-Twister like in R
        inv.uniform_rng.init(1234);
        inv.randoms(10);
        inv.uniform_rng.random();
        inv.randoms(4);
        const result = inv.uniform_rng.randoms(-1);
        expect(result).toEqualFloatingPointBinary(runif1_2, 21, false, false);
        const result2 = inv.randoms(2);
        expect(result2).toEqualFloatingPointBinary(rnorm2, 22, false, false);
    });

    it('get from normal rng after reset underlying uniform rng', () => {
        const inv = new KindermanRamage(); // by default will use Mersenne-Twister like in R
        inv.randoms(10);
        inv.uniform_rng.random();
        inv.uniform_rng.init(0);
        const result = inv.randoms(2);
        expect(result).toEqualFloatingPointBinary(rnorm2AfterResetSeedTo0, 22, false, false);
    });
    it('identity and slush check', () => {
        const inv = new KindermanRamage();
        inv.uniform_rng.init(1234);
        expect(inv.name).toBe('KinderMan Ramage');
        expect(inv.kind).toBe(IRNGNormalTypeEnum.KINDERMAN_RAMAGE);
        expect(inv.randoms(1e3)).toEqualFloatingPointBinary(_1000Samples, 22, false, false);
    });
});
