//helper
import { resolve } from 'path';

import { loadData } from '@common/load';
import { cl, select } from '@common/debug-mangos-select';

const qbinomDomainWarns = select('qbinom')("argument out of domain in '%s'");
const doSearchDomainWarns = select('do_search')("argument out of domain in '%s'");
qbinomDomainWarns;
doSearchDomainWarns;



//app
import { qbinom } from '..';

describe('qbinom', function () {
    beforeEach(()=>{
        cl.clear('qbinom');
        cl.clear('do_search');
    });
    it('ranges p ∊ [0, 1, step 0.01] size=10, prob=0.5', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qbinom1.R'), /\s+/, 1, 2);
        const actual = x.map(_x => qbinom(_x, 10, 0.5));
        expect(actual).toEqualFloatingPointBinary(y)
    });
    it('p = NaN, size=NaN, prob=0.01', () => {
         const actual = qbinom(NaN, NaN, 0.01);
         expect(actual).toBeNaN();
    });
    it('p = Infinity, size=10, prob=0.5', () => {
        const actual = qbinom(Infinity, 10, 0.5);
        expect(actual).toBeNaN();
        expect(qbinomDomainWarns()).toHaveLength(1);
    });
    it('p = 0.5, size=Infinity, prob=0.5', () => {
        const actual = qbinom(0.5, Infinity, 0.5);
        expect(actual).toBeNaN();
        expect(qbinomDomainWarns()).toHaveLength(1);
    });
    it('p = 0.5, size=5.2 (non integer), prob=0.5', () => {
        const actual = qbinom(0.5, 5.2, 0.5);
        expect(actual).toBeNaN();
        expect(qbinomDomainWarns()).toHaveLength(1);
    });
    it('p = 0.5, size=-5 (<0), prob=0.5', () => {
        const actual = qbinom(0.5, -5, 0.5);
        expect(actual).toBeNaN();
        expect(qbinomDomainWarns()).toHaveLength(1)
    });
    it('p = 0.5, size=5 , prob=0', () => {
        const actual = qbinom(0.5, 5, 0);
        expect(actual).toBe(0);
    });
    it('p = 0.5, size=5 , prob=1', () => {
        const actual = qbinom(0.5, 5, 1);
        expect(actual).toBe(5);
    });
    it('p=-2.302, size=50 , prob=0.5, tail=TRUE, logp=TRUE', () => {
        const z0 = qbinom(-2.302, 50, 0.5, true, true);
        expect(z0).toBe(20);
    });
    it('p=(1-EPSILON/2), size=50 , prob=0.3', () => {
        const z0 = qbinom(1-Number.EPSILON/2, 50, 0.3);
        expect(z0).toBe(50);
    });
    it('p=0.99, size=50 , prob=0.99', () => {
        const z0 = qbinom(0.9999999, 50, 0.99);
        expect(z0).toBe(50);
    });
    it('p=0.99, size=1e6 , prob=0.99', () => {
        const z0 = qbinom(0.9999999, 1e6, 0.99);
        expect(z0).toBe(990513);
    });
    it('p=0.72, size=2147483647 , prob=0.80', () => {
        const z0 = qbinom(0.72, 2147483647, 0.80);
        expect(z0).toBe(1717997721);
    });
    it('p = 0.3, size=NaN, prob=NaN', () => {
        const actual = qbinom(0.3, NaN, NaN);
        expect(actual).toBeNaN();
   });
});