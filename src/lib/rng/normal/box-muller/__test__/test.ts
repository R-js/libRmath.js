import { BoxMuller } from '@rng/normal/box-muller/index.js';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type.js';
import {
    rnormAfterSeed123,
    rnormAfterUniformRNGBleed,
    rnormAfterUniformRNGBleed2,
    rnormAfterUniformRNGReset,
} from './fixture.js';


describe('rng box-muller', function () {
    it.only('compare 100 samples seed=0', () => {
        const bm = new BoxMuller(); // by default will use Mersenne-Twister like in R
        bm.uniform_rng.init(1234);
        const result1 = bm.randoms(10);
        expect(result1).toEqualFloatingPointBinary(rnormAfterSeed123, 22, false, false);

        const univar1 = bm.uniform_rng.random();
        expect(univar1).toEqualFloatingPointBinary(0.693591291783, 22, false, false);

        const result2 = bm.randoms(4);
        expect(result2).toEqualFloatingPointBinary(rnormAfterUniformRNGBleed, 22, false, false);

        const univar2 = bm.uniform_rng.random();
        expect(univar2).toEqualFloatingPointBinary(0.837295628153, 22, false, false);

        const result3 = bm.randoms(2);
        expect(result3).toEqualFloatingPointBinary(rnormAfterUniformRNGBleed2, 22, false, false);
        bm.uniform_rng.init(0);

        const result4 = bm.randoms(2);
        expect(result4).toEqualFloatingPointBinary(rnormAfterUniformRNGReset, 22, false, false);

        bm.uniform_rng.init(1234);
        const normVar1 = bm.random();
        expect(normVar1).toEqualFloatingPointBinary(0.735828171633, 22, false, false);

        expect(bm.name).toBe('Box-Muller');
        expect(bm.kind).toBe(IRNGNormalTypeEnum.BOX_MULLER);

        bm.uniform_rng.init(1234);
        const normVar2 = bm.randoms(-1);
        expect(normVar2).toEqualFloatingPointBinary(0.735828171633, 22, false, false);
    });
});
