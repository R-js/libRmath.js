import { cl, select } from '@common/debug-select';

import { pweibull } from '..';

const pweibullDomainWarns = select('pweibull')("argument out of domain in '%s'");


describe('pweibull', function () {
    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('pweibull');
        });
        it('x=NaN|shape=NaN|scale=NaN', () => {
            const nan1 = pweibull(NaN, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = pweibull(4, NaN, 0.5);
            expect(nan2).toBeNaN();
            const nan3 = pweibull(4, 0.5, NaN);
            expect(nan3).toBeNaN();
        });
        it('shape < 0 | scale < 0', () => {
            const nan1 = pweibull(3, -0.5, 0.5);
            expect(nan1).toBeNaN();
            const nan2 = pweibull(4, 0.5, -0.5);
            expect(nan2).toBeNaN();
            expect(pweibullDomainWarns()).toHaveLength(2);
        });
        it('x < 0', () => {
            const zero = pweibull(-3, 0.5, 0.5);
            expect(zero).toBe(0);
        });
        it('x = Infinite', () => {
            const one1 = pweibull(Infinity, 0.5, 0.5);
            expect(one1).toBe(1);
            const one2 = pweibull(Infinity, 0.5, 0.5, true);
            expect(one2).toBe(one2);
        });
        it('x == 0 && shape < 1', () => {
            const zero = pweibull(0, 0.5, 1.5);
            expect(zero).toBe(0);
        });
    });

    describe('fidelity', () => {
        it('x=34, shape=23.9, scale=45', () => {
            const ans = pweibull(34, 23.9, 45);
            expect(ans).toEqualFloatingPointBinary(0.0012311176766226404);
        });
        it('x=34, shape=23.9, scale=45, giveLog=true', () => {
            const ans = pweibull(34, 23.9, 45, true, true);
            expect(ans).toEqualFloatingPointBinary(-6.6998328420167095);
        });
        
        it('x=22, shape=0.123, scale= 10, lower_tail=false, givelog=true', () => {
            const ans = pweibull(22, 0.123, 10, false, true);
            expect(ans).toEqualFloatingPointBinary(-1.1018386179606035);
        });
        it('x=22, shape=0.123, scale= undefined, lower_tail=false, givelog=true', () => {
            const ans = pweibull(22, 0.123, undefined, false, true);
            expect(ans).toEqualFloatingPointBinary(-1.4625744747935008);
        });
    });
});