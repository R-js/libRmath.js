import { register, unRegister } from '@mangos/debug-frontend';

import log1p from '../log1p';

//mocks
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

//hypot

describe('log1p', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        register(createBackEndMock(logs));
    });

    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input and edge cases', () => {
        it('x < -1 should be a NaN', () => {
            const l = log1p(-1.5);
            expect(l).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'log1p',
                    formatter: "argument out of domain in '%s'",
                    args: ['log1p']
                }
            ]);
        });
        it('x = -1 should be a -Infinity', () => {
            const l = log1p(-1);
            expect(l).toEqualFloatingPointBinary(-Infinity);
        });
        it('x < -0.999999985 causes precision failure warning', () => {
            const l = log1p(-0.999999999);
            expect(l).toEqualFloatingPointBinary(-20.723265865228342);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'log1p',
                    formatter: "full precision may not have been achieved in '%s'",
                    args: ['log1p']
                }
            ]);
        });
    });
    describe('fidelity', () => {
        it('log1p(0)', () => {
            expect(log1p(0)).toEqualFloatingPointBinary(0);
        });
        it('log1p(1)', () => {
            expect(log1p(1)).toEqualFloatingPointBinary(0.6931471805599453);
        });
        it('log1p(10000)', () => {
            expect(log1p(10000)).toEqualFloatingPointBinary(9.210440366976517);
        });
        it('log1p(x < 0.375, x = 0.2)', () => {
            expect(log1p(0.2)).toEqualFloatingPointBinary(0.18232155679395462, 51);
        });
        it('fabs(x) < 0.5 EPSILON)', () => {
            expect(log1p(0.4 * Number.EPSILON)).toEqualFloatingPointBinary(8.881784197001253e-17);
        });
        it('fabs(x) < 0.5 EPSILON)', () => {
            expect(log1p(0.4 * Number.EPSILON)).toEqualFloatingPointBinary(8.881784197001253e-17);
        });
        it('0 < x < 1e-8)', () => {
            expect(log1p(0.5e-8)).toEqualFloatingPointBinary(4.9999999875e-9);
        });
    });
});
