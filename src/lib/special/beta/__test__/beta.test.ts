import { register, unRegister } from '@mangos/debug-frontend';

import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';
//app
import { beta } from '..';

describe('beta(a,b)', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    it('a = 0, b > 0', () => {
        /* load data from fixture */
        const a = 0;
        const b = 0.5;
        const actual = beta(a, b);
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('a=1, b=2 to be 0.5', () => {
        expect(beta(1, 2)).toEqualFloatingPointBinary(0.5);
    });

    it('a=Nan | b=Nan', () => {
        const nan1 = beta(NaN, 5);
        const nan2 = beta(4, NaN);
        expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
    });
    it('a<0 or b < 0 returns NaN', () => {
        const nan1 = beta(-1, 4);
        const nan2 = beta(4, -1);
        expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'beta',
                formatter: "argument out of domain in '%s'",
                args: ['beta']
            },
            {
                prefix: '',
                namespace: 'beta',
                formatter: "argument out of domain in '%s'",
                args: ['beta']
            }
        ]);
    });
    it('a=Infinity returns 0 and ME warnings', () => {
        const inf = beta(Infinity, 1);
        expect(inf).toEqualFloatingPointBinary(0);
    });
    it('a>0 and b=Infinity 0', () => {
        const inf = beta(1, Infinity);
        expect(inf).toEqualFloatingPointBinary(0);
    });
    it('domain: (a + b) < 171.61447887182298', () => {
        const ans = beta(4, 5);
        expect(ans).toEqualFloatingPointBinary(0.003571429, 21, false, true);
    });
    it('domain: (a + b) > 171.61447887182298', () => {
        const ans = beta(87, 87);
        expect(ans).toEqualFloatingPointBinary(1.589462e-53, 18, false, true);
    });
    it('domain: (a + b) >>>> 171.61447887182298', () => {
        const ans = beta(520, 520);
        expect(ans).toEqualFloatingPointBinary(1.319812e-314, 18, false, true);
    });
});
