import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

import { qlogis } from '..';

describe('qlogis', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('edge cases', () => {
        it('x = NaN or location = Nan, or scale = NaN or give_log = NaN', () => {
            const nan1 = qlogis(NaN);
            expect(nan1).toBeNaN();
            //
            const nan2 = qlogis(0, NaN);
            expect(nan2).toBeNaN();
            //
            const nan3 = qlogis(0, undefined, NaN);
            expect(nan3).toBeNaN();
        });
        it('p = 0', () => {
            const nInf = qlogis(0);
            expect(nInf).toBe(-Infinity);
        });
        it('p = 1', () => {
            const Inf = qlogis(1);
            expect(Inf).toBe(Infinity);
        });
        it('p = -1 and p = 1.2', () => {
            const nan1 = qlogis(-1);
            const nan2 = qlogis(1.2);
            expect(nan1).toEqualFloatingPointBinary(NaN);
            expect(nan2).toEqualFloatingPointBinary(NaN);
        });
        it('scale <= 0', () => {
            const nan = qlogis(0.3, undefined, -1);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qlogis',
                    formatter: "argument out of domain in '%s'",
                    args: ['qlogis']
                }
            ]);
        });
        it('scale == 0', () => {
            const location = qlogis(0.2, 4, 0);
            expect(location).toEqualFloatingPointBinary(4);
        });
    });
    describe('fidelity', () => {
        it('x=0.4, location=4, scale = 0.4, lower.tail = false', () => {
            const q = qlogis(0.4, 4, 0.4, false);
            expect(q).toEqualFloatingPointBinary(4.162186043243266);
        });
        it('x=0.4, location=4, scale = 0.4, lower.tail = true', () => {
            const q = qlogis(0.4, 4, 0.4, true);
            expect(q).toEqualFloatingPointBinary(3.8378139567567344);
        });
        it('x=0.4, location=4, scale = 0.4, lower.tail = false, log.p=true', () => {
            const q = qlogis(Math.log(0.4), 4, 0.4, false, true);
            expect(q).toEqualFloatingPointBinary(4.162186043243266);
        });
        it('x=0.4, location=4, scale = 0.4, lower.tail = true, log.p=true', () => {
            const q = qlogis(Math.log(0.4), 4, 0.4, true, true);
            expect(q).toEqualFloatingPointBinary(3.8378139567567344);
        });
    });
});
