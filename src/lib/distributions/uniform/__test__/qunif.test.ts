import { cl, select } from '@common/debug-mangos-select';

import { qunif } from '..';


const qunifDomainWarns = select('qunif')("argument out of domain in '%s'");
const qbounderyWarns = select('R_Q_P01_check')("argument out of domain in '%s'");


describe('qunif', function () {

    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('qunif');
        });
        it('p=Nan|a=NaN|b=NaN', () => {
            // qunif(p: number, a = 0, b = 1, lowerTail = true, logP = false)
            const nan1 = qunif(NaN, 4, 3);
            expect(nan1).toBeNaN();
            const nan2 = qunif(0.9, NaN, 3);
            expect(nan2).toBeNaN();
            const nan3 = qunif(0.9, 4, NaN);
            expect(nan3).toBeNaN();
        });
        it('x < min=(0) | x > max=(1)', () => {
            const nan1 = qunif(-0.9);
            expect(nan1).toBeNaN();
            const nan2 = qunif(1.2);
            expect(nan2).toBeNaN();
            expect(qbounderyWarns()).toHaveLength(2);
        });
        it('min=Infinity|max=Infinity', () => {
            const nan1 = qunif(0.9, Infinity);
            expect(nan1).toBeNaN();
            const nan2 = qunif(0.9, 0, Infinity);
            expect(nan2).toBeNaN();
            expect(qunifDomainWarns()).toHaveLength(2);
        });
        it('min > max', () => {
            const nan1 = qunif(0.9, 10, 4);
            expect(nan1).toBeNaN();
            expect(qunifDomainWarns()).toHaveLength(1);
        });
        it('min = max', () => {
            const ans = qunif(0.9, 4, 4);
            expect(ans).toBe(4);
        });
    });
    describe('fidelity', () => {
        it('p=log(0.8), min=11, max=11.5 lowerTail=false, pAslog=true',()=>{
            const ans = qunif(Math.log(0.8), 11, 11.5, false, true);
            expect(ans).toBe(11.1);
        });
    });
});