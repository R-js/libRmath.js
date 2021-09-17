// node
import { resolve } from 'path';

//helper
import { loadData } from '@common/load';
import { cl, select } from '@common/debug-select.js';

const dnbetaDomainWarns = select('dnbeta')("argument out of domain in '%s'");

import { dbeta } from '../index.js';

describe('dbeta, ncp != undefined', () => {
    beforeEach(()=>{
        cl.clear('dnbeta');
    });
    it('ranges x ∊ [0, 1], shape1=3, shape2=3, ncp=2', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dnbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dbeta(_x, 3, 3, 2));
        expect(actual).toEqualFloatingPointBinary(y, 45);
    });
    it('ranges x = NaN, shape1=3, shape2=3, ncp=2', () => {
        const nan = dbeta(NaN, 3, 3, 2);
        expect(nan).toBeNaN();
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=-2', () => {
        const nan = dbeta(0.5, 3, 3, -2);
        expect(dnbetaDomainWarns()).toHaveBeenCalledTimes(1);
        expect(nan).toBe(NaN);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=-2', () => {
        const nan = dbeta(0.5, 3, 3, Infinity);
        expect(dnbetaDomainWarns()).toHaveBeenCalledTimes(1);
        expect(nan).toBe(NaN);
    });
    it('ranges x = -1, shape1=3, shape2=3, ncp=2', () => {
        const z = dbeta(-1, 3, 3, 2);
        expect(z).toBe(0);
    });
    it('ranges x = -1, shape1=3, shape2=3, ncp=2, log=true', () => {
        const z = dbeta(-1, 3, 3, 2, true);
        expect(z).toBe(-Infinity);
    });
    it('ranges x = 0, shape1=3, shape2=0.01, ncp=4', async () => {
        const z = dbeta(0, 1, 0.01, 4);
        expect(z).toEqualFloatingPointBinary(0.0013533528323661276);
    });
});