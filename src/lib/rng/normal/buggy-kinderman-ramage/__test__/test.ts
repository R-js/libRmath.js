import { BuggyKindermanRamage } from '@rng/normal/buggy-kinderman-ramage/index.js';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type.js';
import { testData } from './fixture.js';
import flushSample from './_1000flushSample.js';

const { rnorm10, runif1, rnorm4, runif1_2, rnorm2, rnorm2AfterResetSeedTo0 } = testData;

describe('rng buggy kinderman-ramage', function () {
    it('compare 10 samples seed=1234', () => {
        const bkm = new BuggyKindermanRamage(); // by default will use Mersenne-Twister like in R
        bkm.uniform_rng.init(1234);
        const result1 = bkm.randoms(10);
        expect(result1).toEqualFloatingPointBinary(rnorm10, 22, false, false);
    });
    it('get from underlying uniform rng', () => {
        const bkm = new BuggyKindermanRamage(); // by default will use Mersenne-Twister like in R
        bkm.uniform_rng.init(1234);
        bkm.randoms(10);
        const univar1 = bkm.uniform_rng.random();
        expect(univar1).toEqualFloatingPointBinary(runif1, 22, false, false);
    });
    it('get from normal rng after get from underlying uniform rng', () => {
        const bkm = new BuggyKindermanRamage(); // by default will use Mersenne-Twister like in R
        bkm.uniform_rng.init(1234);
        bkm.randoms(10);
        bkm.uniform_rng.random();
        const result = bkm.randoms(4);
        expect(result).toEqualFloatingPointBinary(rnorm4, 22, false, false);
    });
    it('get uniform from underlying rng', () => {
        const bkm = new BuggyKindermanRamage(); // by default will use Mersenne-Twister like in R
        bkm.uniform_rng.init(1234);
        bkm.randoms(10);
        bkm.uniform_rng.random();
        bkm.randoms(4);
        const result = bkm.uniform_rng.randoms(-1);
        expect(result).toEqualFloatingPointBinary(runif1_2, 22, false, false);
        const result2 = bkm.randoms(2);
        expect(result2).toEqualFloatingPointBinary(rnorm2, 22, false, false);
    });

    it('get from normal rng after reset underlying uniform rng', () => {
        const bkm = new BuggyKindermanRamage(); // by default will use Mersenne-Twister like in R
        bkm.randoms(10);
        bkm.uniform_rng.random();
        bkm.uniform_rng.init(0);
        const result = bkm.randoms(2);
        expect(result).toEqualFloatingPointBinary(rnorm2AfterResetSeedTo0, 22, false, false);
    });
    it('identity and flush-test', () => {
        const bkm = new BuggyKindermanRamage();
        expect(bkm.name).toBe('Buggy-Kinderman-Ramage');
        expect(bkm.kind).toBe(IRNGNormalTypeEnum.BUGGY_KINDERMAN_RAMAGE);
        bkm.uniform_rng.init(1234);
        expect(bkm.randoms(1e3)).toEqualFloatingPointBinary(flushSample, 22, false, false);
    });
});
