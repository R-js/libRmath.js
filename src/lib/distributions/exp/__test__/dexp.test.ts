
import { loadData } from '@common/load';
import { cl, select } from '@common/debug-mangos-select';
const dexpDomainWarns = select('dexp')("argument out of domain in '%s'");

import { resolve } from 'path';
import { dexp } from '..';

describe('dexp', function () {
    beforeEach(() => {
        cl.clear('dexp');
    })
    it('x=[-0.5, 3], rate=(1, 2, 45, 0.5)', async () => {
        
        const [p, y1, y2, y3, y4] = await loadData(resolve(__dirname, 'fixture-generation', 'dexp.R'), /\s+/, 1, 2, 3, 4, 5);

        const a1 = p.map(_p => dexp(_p, 1));
        expect(a1).toEqualFloatingPointBinary(y1, 51);

        const a2 = p.map(_p => dexp(_p, 2));
        expect(a2).toEqualFloatingPointBinary(y2, 50);

        const a3 = p.map(_p => dexp(_p, 4));
        expect(a3).toEqualFloatingPointBinary(y3, 50);

        const a4 = p.map(_p => dexp(_p, 8));
        expect(a4).toEqualFloatingPointBinary(y4, 50);

    });
    it('rate = NaN', () => {
        const nan = dexp(0, NaN);
        expect(nan).toBeNaN();
    });
    it('rate = -3 (<0)', () => {
        const nan = dexp(0, -3);
        expect(nan).toBeNaN();
        expect(dexpDomainWarns()).toHaveLength(1);
    });
    it('asLog = true, rate = 5, x=0', () => {
        const z = dexp(0, 5, true);
        expect(z).toEqualFloatingPointBinary(1.6094379124341003);
    })
    it('defaults', () => {
        const z = dexp(3);
        expect(z).toEqualFloatingPointBinary(0.049787068367863944);
    })
});