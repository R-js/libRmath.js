import { loadData } from '@common/load';
import { resolve } from 'path';

import { emptyFloat64Array } from '@lib/r-func';
import { globalUni, RNGkind } from '@rng/global-rng';
import { rgeom } from '..';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('rgeom', function () {
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
        it('n=1, prob=NaN', () => {
            const nan = rgeom(1, NaN);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'rgeom',
                    formatter: "argument out of domain in '%s'",
                    args: ['rgeom']
                }
            ]);
        });
        it('n=1, prob=-1(<0)', () => {
            const nan = rgeom(1, -1);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'rgeom',
                    formatter: "argument out of domain in '%s'",
                    args: ['rgeom']
                }
            ]);
        });
        it('n=1, prob=1.3(>1)', () => {
            const nan = rgeom(1, 1.2);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'rgeom',
                    formatter: "argument out of domain in '%s'",
                    args: ['rgeom']
                }
            ]);
        });
    });

    describe('edge cases', () => {
        it('n=0', () => {
            const z = rgeom(0, 1);
            expect(z === emptyFloat64Array).toBeTruthy();
        });
    });

    describe('with fixtures', () => {
        beforeAll(() => {
            RNGkind({ uniform: 'MERSENNE_TWISTER', normal: 'INVERSION' });
            globalUni().init(12345);
        });
        it('n=100, prob={0.3,0.6}', async () => {
            const [y1, y2] = await loadData(resolve(__dirname, 'fixture-generation', 'rgeom.R'), /\s+/, 1, 2);
            const a1 = rgeom(100, 0.3);
            const a2 = rgeom(100, 0.6);
            expect(a1).toEqualFloatingPointBinary(y1);
            expect(a2).toEqualFloatingPointBinary(y2);
        });
    });
});
