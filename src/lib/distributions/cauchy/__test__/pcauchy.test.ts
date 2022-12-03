import { resolve } from 'path';

import { loadData } from '@common/load';
import { cl, select } from '@common/debug-mangos-select';

const pcauchyDomainWarns = select('pcauchy')("argument out of domain in '%s'");
pcauchyDomainWarns;

import { pcauchy } from '..';

describe('pcauchy', function () {
    beforeEach(() => {
        cl.clear('pcauchy');
    });
    it('ranges x ∊ [-40, 40, step 1] location=2, scale=3, log=false', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pcauchy1.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pcauchy(_x, 2, 3));
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('x=NaN', () => {
        const nan = pcauchy(NaN);
        expect(nan).toBeNaN();
    });
    it('x=0.2, scale=-2(<0), location=0', () => {
        const nan = pcauchy(0.2, 0, -2);
        expect(nan).toBeNaN();
    });
    it.todo('check code path to hit DE Messages');
    it('x=0, scale=Infinity, location=Infinity', () => {
        const nan = pcauchy(0, Infinity, Infinity);
        expect(nan).toBeNaN();
        expect(pcauchyDomainWarns()).toHaveLength(1);
    });

    
    it('x=Infinity, rest=default', () => {
        const z = pcauchy(Infinity);
        expect(z).toBe(1);
    });
    it('x=-Infinity, rest=default', () => {
        const z = pcauchy(-Infinity);
        expect(z).toBe(0);
    });
    it('x=20, lowerTail=false', () => {
        const z = pcauchy(20, undefined, undefined, false);
        expect(z).toEqualFloatingPointBinary(0.015902251256176378);
    });
});