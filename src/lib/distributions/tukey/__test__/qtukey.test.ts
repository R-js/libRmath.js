

import { cl, select } from '@common/debug-select';

import { qtukey } from '../index';


const qtukeyDomainWarns = select('qtukey')("argument out of domain in '%s'");
const qtukeyBounderyWarns = select('R_Q_P01_boundaries')("argument out of domain in '%s'")


describe('qtukey', function () {

    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('qtukey');
            cl.clear('R_Q_P01_boundaries');
        });
        it('p=Nan|nmeans=NaN|df=NaN|ranges=NaN', () => {
            const nan1 = qtukey(NaN, 4, 3, 2);
            const nan2 = qtukey(0.9, NaN, 3, 2);
            const nan3 = qtukey(0.9, 4, NaN);
            const nan4 = qtukey(0.9, 4, 3, NaN);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
        });
        it('df < 2 | ranges < 1 | nmeans < 2', () => {
            const nan1 = qtukey(0.9, 4, 1, 2);
            const nan2 = qtukey(0.9, 4, 2, 0);
            const nan3 = qtukey(0.9, 1, 2, 0);
            expect([nan1, nan2, nan3]).toEqualFloatingPointBinary(NaN);
            expect(qtukeyDomainWarns()).toHaveLength(3);
        })
        it('p > 1 | p < 0', () => {
            const nan1 = qtukey(-1, 4, 2);
            const nan2 = qtukey(1.2, 4, 2);
            expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
            expect(qtukeyBounderyWarns()).toHaveLength(2);
        });
        it('p =0  | p = 1', () => {
            const b1 = qtukey(0, 4, 2);
            const b2 = qtukey(1, 4, 2);
            expect(b1).toBe(0);
            expect(b2).toBe(Infinity);
        });
    });
    describe('fidelity', () => {
        it('p=0.01,nmeans=2,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const ans = qtukey(0.01, 2, 2, 1, true, false);
            expect(ans).toEqualFloatingPointBinary(0.020000480186752309, 51);
        });
        it('p=0.01,nmeans=4,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const ans = qtukey(0.01, 4, 2, 1, true, false);
            expect(ans).toEqualFloatingPointBinary(0.3994104987821519);
        });
        it('p=0.01,nmeans=4,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const ans = qtukey(0.01, 4, 2, 1, true, false);
            expect(ans).toEqualFloatingPointBinary(0.3994104987821519);
        });
      

        it('p=0.02,nmeans=4,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const ans = qtukey(0.02, 4, 2, 1, true, false);
            expect(ans).toEqualFloatingPointBinary(0.51073597468881515);
        });

        it('p=0.01,nmeans=62,df=2,nranges=1,lower_tail=true,log_p=false', () => {
            const nan = qtukey(0.01, 62, 2, 1, true, false);
            expect(nan).toBe(NaN);
        });

        it('p=0.01,nmeans=72,df=8,nranges=1,lower_tail=true,log_p=false', () => {
            const nan = qtukey(0.01, 72, 8, 1, true, false);
            expect(nan).toBe(NaN);
        });
       
    });
});