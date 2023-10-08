import { register, unRegister } from '@mangos/debug-frontend';

import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';
//app
import { choose } from '..';

describe('combinatorics (choose)', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input and edge cases', () => {
        it('a = NaN|b = NaN', () => {
            const nan1 = choose(NaN, 5);
            const nan2 = choose(4, NaN);
            expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
        });
        it('warning if int(k)-k > 1e-7', () => {
            expect(choose(5, 4 - 1e-7 * 2)).toBe(5);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'choose',
                    formatter: 'k (%d) must be integer, rounded to %d',
                    args: [3.9999998, 4]
                }
            ]);
        });
        it('k < 0', () => {
            expect(choose(5, -1)).toBe(0);
        });
    });
    describe.skip('fidelity', () => {
        //
    });
});
