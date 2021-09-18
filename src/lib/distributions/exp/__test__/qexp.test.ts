import { resolve } from 'path';
import { qexp } from '..';

import { loadData } from '@common/load';
import { cl, select } from '@common/debug-select';

const qexpLogs = select('qexp');
const qexpDomainWarns = qexpLogs("argument out of domain in '%s'");
qexpDomainWarns;

describe('qexp', function () {
    beforeEach(() => {
        cl.clear('qexp');
    })
    it('p=[ -0.1250, 1.1250 ], rates= 4, 32, (8 and tail=false, log=true)', async () => {
        const [p, y1, y2, y3 ] = await loadData(resolve(__dirname, 'fixture-generation', 'qexp.R'), /\s+/, 1, 2, 3, 4);

        const a1 = p.map(_p => qexp(_p, 4));
        expect(a1).toEqualFloatingPointBinary(y1);

        const a2 = p.map(_p => qexp(_p, 32, false));
        expect(a2).toEqualFloatingPointBinary(y2, 48);

        const a3 = p.map(_p => qexp(Math.log(_p), 8, false, true));
        expect(a3).toEqualFloatingPointBinary(y3, 49);
    });
    it('rate = NaN', () => {
        const nan = qexp(0, NaN);
        expect(nan).toBeNaN();
    });
    it('rate = -3 (<0)', () => {
        const nan = qexp(0, -3);
        expect(nan).toBeNaN();
        expect(qexpDomainWarns()).toHaveLength(1);
    });
});