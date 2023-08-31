import { loadData } from '@common/load';
import { resolve } from 'node:path';

import { dgeom } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('dgeom', function () {
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
        it('x=NaN, prop=0', () => {
            const nan = dgeom(NaN, 0);
            expect(nan).toBe(NaN);
        });
        it('x=4, prob=-1(<0)', () => {
            const nan = dgeom(4, -1);
            expect(nan).toBe(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dgeom',
                    formatter: "argument out of domain in '%s'",
                    args: ['dgeom']
                }
            ]);
        });
        it('x=4, prob=1.2(>1)', () => {
            const nan = dgeom(4, 1.2);
            expect(nan).toBe(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dgeom',
                    formatter: "argument out of domain in '%s'",
                    args: ['dgeom']
                }
            ]);
        });
    });

    describe('edge cases', () => {
        it('non integer x,(4.2)', () => {
            expect(dgeom(4.2, 0.2)).toBe(0);
            expect(dgeom(4.2, 0.2, true)).toBe(-Infinity);
        });
    });

    describe('with fixtures', () => {
        it('x ∈ [-2,2], prob=0.5, log={true|false}', async () => {
            const [p, y1, y2] = await loadData(resolve(__dirname, 'fixture-generation', 'dgeom.R'), /\s+/, 1, 2, 3);
            const a1 = p.map((_p) => dgeom(_p, 0.5));
            const a2 = p.map((_p) => dgeom(_p, 0.5, true));
            expect(a1).toEqualFloatingPointBinary(y1);
            expect(a2).toEqualFloatingPointBinary(y2);
        });
    });
});
