import { globalUni, RNGkind } from '@rng/global-rng';
import { rchisq } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('rnchisq', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
        globalUni().init(98765);
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    it('n=10, df=34, ncp=34', () => {
        const actual = rchisq(10, 45, 34);
        expect(actual).toEqualFloatingPointBinary(
            [
                // R fixture
                94.407790482227966, 87.1658105807456, 80.060616441152177, 62.03300113004692, 94.719569190643426,
                89.143673039011006, 89.819262972685692, 66.754808964860459, 73.939018003492038, 88.40884111031941
            ],
            20
        );
    });
    it('n=1, location=NaN', () => {
        const nan = rchisq(1, NaN, 5);
        expect(nan).toEqualFloatingPointBinary(NaN);
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'rnchisq',
                formatter: "argument out of domain in '%s'",
                args: ['rnchisq']
            }
        ]);
    });
    it('n=1, df=0, ncp=0', () => {
        const actual = rchisq(1, 0, 0);
        expect(actual).toEqualFloatingPointBinary(0);
    });
    it('n=1, df=0, ncp=4', () => {
        const actual = rchisq(1, 0, 4);
        expect(actual).toEqualFloatingPointBinary(3.3275030977911904);
    });
    it('n=5, df=0, ncp=4', () => {
        const actual = rchisq(5, 0, 4);
        expect(actual).toEqualFloatingPointBinary([
            //> set.seed(98765)
            //> s=rchisq(n=5,df=0,ncp=4)
            //> data.frame(s)
            //                   s
            3.3275030977911904, 8.0761723183715599, 4.385429790682088, 6.5992030278403737, 2.2564214291756741
        ]);
    });
});
