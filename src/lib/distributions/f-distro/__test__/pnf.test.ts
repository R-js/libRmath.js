import { loadData } from '@common/load';
import { resolve } from 'path';
import { cl, select } from '@common/debug-mangos-select';

import { pf } from '..';

const pfLogs = select('pnf');
const pfDomainWarns = pfLogs("argument out of domain in '%s'");

describe('pnf ncp=defined', function () {
    beforeEach(() => {
        cl.clear('pnf');
    });
    it('x ∈ [-0.125, 6.1250], df1=23, df2=52 ncp=34', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'pnf.R'), /\s+/, 1, 2);
        const a1 = p.map((_p) => pf(_p, 23, 52, 34));
        expect(a1).toEqualFloatingPointBinary(y1, 26);
    });
    it('x ∈ [-0.125, 6.1250], df1=23, df2=4E+8 ncp=34', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'pnf2.R'), /\s+/, 1, 2);
        const a1 = p.map((_p) => pf(_p, 23, 4e8, 34));
        expect(a1).toEqualFloatingPointBinary(y1, 43);
    });
    it('x=1, df1=NaN, df2=4, ncp=27', () => {
        const nan = pf(1, NaN, 4, 27);
        expect(nan).toBeNaN();
    });
    it('x=1, df1=-1(<0), df2=4, ncp=27', () => {
        const nan = pf(1, -2, 4, 27);
        expect(nan).toBeNaN();
        expect(pfDomainWarns()).toHaveLength(1);
    });
    it('x=2, df1=23, df2=24, ncp=Infinity', () => {
        const nan = pf(2, 23, 24, Infinity);
        expect(nan).toBeNaN();
        expect(pfDomainWarns()).toHaveLength(1);
    });
    it('x=2, df1=Infinity, df2=Infinity, ncp=38', () => {
        const nan = pf(2, Infinity, Infinity, 38);
        expect(nan).toBeNaN();
        expect(pfDomainWarns()).toHaveLength(1);
    });
});
