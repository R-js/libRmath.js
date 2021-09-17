// node
import { resolve } from 'path';

//helper
import { loadData } from '@common/load';
import { cl, select } from '@common/debug-select.js';

const qnbetaDomainWarns = select('qnbeta')("argument out of domain in '%s'");
qnbetaDomainWarns;

//app
import { qbeta } from '../index.js';

describe('qbeta, ncp != undefined',  function () {
    beforeEach(()=>{
        cl.clear('qnbeta');
    });
    it.todo('check unhappy path with ME warnings');
    it('ranges x ∊ [0, 1], shape1=1, shape2=2, ncp=3', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qnbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => qbeta(_x, 1, 2, 3));
        expect(actual).toEqualFloatingPointBinary(y, 6);
    });
    it('x = 0.5, shape1=NaN, shape2=2, ncp=3', () => {
        const nan = qbeta(0.5, NaN, 2, 3);
        expect(nan).toBe(NaN);
    });
    it('x=0.5, shape1=Infinite,shape2=3, ncp=3', () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        const nan = qbeta(0.5, Infinity, 2, 3);
        expect(nan).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('x=0.5, shape1=-2,shape2=3, ncp=3', () => {
        const dest: unknown[] = [];
        cl.setDestination(dest);
        const nan = qbeta(0.5, -2, 2, 3);
        expect(nan).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('x=1-EPSILON/2, shape1=-2, shape2=2, ncp=4', () => {
        const z = qbeta(1 - Number.EPSILON / 2, 2, 2, 4, true);
        expect(z).toBe(1);
    });
});