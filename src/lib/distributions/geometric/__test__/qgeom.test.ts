import { loadData } from '@common/load';
import { resolve } from 'path';

import { qgeom } from '..';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('qgeom', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input', () => {
        it('p=NaN, prop=0.2', () => {
            const nan = qgeom(NaN, 0.2);
            expect(nan).toBe(NaN);
        });
        it('p=4, prob=-1(<0)', () => {
            const nan = qgeom(4, -1);
            expect(nan).toBe(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qgeom',
                    formatter: "argument out of domain in '%s'",
                    args: ['qgeom']
                }
            ]);
        });
        it('p=1.2, prob=0.2, log=T', () => {
            const nan = qgeom(1.2, 0.2, undefined, true);
            expect(nan).toBe(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'R_Q_P01_check',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_check']
                }
            ]);
        });
    });

    describe('edge cases', () => {
        it('0<p<1, prob=1', () => {
            expect(qgeom(0.5, 1)).toBe(0);
        });
    });

    describe('with fixtures', () => {
        it('x ∈ [-1, 10], prob={0.3,0.5}', async () => {
            const [p, y1, y2, y3] = await loadData(
                resolve(__dirname, 'fixture-generation', 'qgeom.R'),
                /\s+/,
                1,
                2,
                3,
                4
            );
            const a1 = p.map((_p) => qgeom(_p, 0.3, false, false));
            const a2 = p.map((_p) => qgeom(_p, 0.3, true, false));
            const a3 = p.map((_p) => qgeom(Math.log(_p), 0.3, false, true));
            expect(a1).toEqualFloatingPointBinary(y1);
            expect(a2).toEqualFloatingPointBinary(y2);
            expect(a3).toEqualFloatingPointBinary(y3);
        });
    });
});
