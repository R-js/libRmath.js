import { loadData } from '@common/load';
import { resolve } from 'path';

import { pgeom } from '..';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('pgeom', function () {
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
        it('x=NaN, prop=0.2', () => {
            const nan = pgeom(NaN, 0.2);
            expect(nan).toBe(NaN);
        });
        it('x=4, prob=-1(<0)', () => {
            const nan = pgeom(4, -1);
            expect(nan).toBe(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'pgeom',
                    formatter: "argument out of domain in '%s'",
                    args: ['pgeom']
                }
            ]);
        });
    });

    describe('edge cases', () => {
        it('non integer x,(2.2) p=0.2, log={true|false}', () => {
            expect(pgeom(2.2, 0.2)).toEqualFloatingPointBinary(0.48800000000000004);
            expect(pgeom(2.2, 0.2, undefined, true)).toEqualFloatingPointBinary(-0.71743987312898982);
        });
        it('x = Infinity p=0.2, log={true|false}', () => {
            expect(pgeom(Infinity, 0.2)).toBe(1);
            expect(pgeom(Infinity, 0.2, undefined, true)).toBe(0);
        });
        it('p=1, x=>0, lower={true|false} log={true|false}', () => {
            expect(pgeom(33, 1, true, false)).toBe(1);
            expect(pgeom(33, 1, true, true)).toBe(0);
            expect(pgeom(33, 1, false, false)).toBe(0);
            expect(pgeom(33, 1, false, true)).toBe(-Infinity);
        });
    });

    describe('with fixtures', () => {
        it('x ∈ [-1, 10], prob=0.5, log={true|false}', async () => {
            const [p, y1, y2] = await loadData(resolve(__dirname, 'fixture-generation', 'pgeom.R'), /\s+/, 1, 2, 3);
            const a1 = p.map((_p) => pgeom(_p, 0.5));
            const a2 = p.map((_p) => pgeom(_p, 0.5, false, false));
            expect(a1).toEqualFloatingPointBinary(y1);
            expect(a2).toEqualFloatingPointBinary(y2);
        });
    });
});
