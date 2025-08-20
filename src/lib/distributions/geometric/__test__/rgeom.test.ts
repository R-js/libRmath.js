import { loadData } from '@common/load';
import { resolve } from 'path';
import { emptyFloat64Array } from '@lib/r-func';
import { globalUni, RNGkind } from '@rng/global-rng';
import { rgeom } from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas()

describe('rgeom', function () {
    describe('invalid input', () => {
        it('n=1, prob=NaN', () => {
            const nan = rgeom(1, NaN);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(getStats().rgeom).toBe(1);
        });
        it('n=1, prob=-1(<0)', () => {
            const stats0 = getStats();
            const nan = rgeom(1, -1);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(getStats().rgeom - stats0.rgeom).toBe(1)
        });
        it('n=1, prob=1.3(>1)', () => {
            const stats0 = getStats();
            const nan = rgeom(1, 1.2);
            expect(nan).toEqualFloatingPointBinary(NaN);
            expect(getStats().rgeom - stats0.rgeom).toBe(1)
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
