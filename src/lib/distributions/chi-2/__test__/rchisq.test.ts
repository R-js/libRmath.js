import { globalUni, RNGkind } from '@rng/global-rng';
import { rchisq } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('rchisq', function () {
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
    it('n=10, df=34', () => {
        rchisq(10, 45); // skip 10
        const actual = rchisq(10, 45);
        expect(actual).toEqualFloatingPointBinary([
            32.638684661215024, 63.015911772417191, 40.626237311699306, 51.208705873715331, 44.909424675790682,
            56.32279058685441, 45.370044281715892, 59.646756291554219, 41.112547915379793, 47.739896277088462
        ]);
    });
    it('n=1, location=NaN', () => {
        const nan = rchisq(1, NaN);
        expect(nan).toEqualFloatingPointBinary(NaN);
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'rchisq',
                formatter: "argument out of domain in '%s'",
                args: ['rchisq']
            }
        ]);
    });
    it('n=10, df=4500', () => {
        const actual = rchisq(10, 4500);
        expect(actual).toEqualFloatingPointBinary([
            4583.4082148930993, 4448.7885945022099, 4649.111756627145, 4453.9528251108313, 4501.8382499200725,
            4262.234401079475, 4614.1007111202061, 4394.8048456547158, 4429.5644098095063, 4555.7421319737768
        ]);
    });
});
