import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-mangos-select';

import { dgeom } from '..';

const dgammaLogs = select('dgeom');
const dgammaDomainWarns = dgammaLogs("argument out of domain in '%s'");

describe('dgeom', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('dgeom');
        });
        it('x=NaN, prop=0', () => {
            const nan = dgeom(NaN, 0);
            expect(nan).toBe(NaN);
        });
        it('x=4, prob=-1(<0)', () => {
            const nan = dgeom(4, -1);
            expect(nan).toBe(NaN);
            expect(dgammaDomainWarns()).toHaveLength(1);
        });
        it('x=4, prob=1.2(>1)', () => {
            const nan = dgeom(4, 1.2);
            expect(nan).toBe(NaN);
            expect(dgammaDomainWarns()).toHaveLength(1);
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
