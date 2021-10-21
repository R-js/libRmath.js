import { cl, select } from '@common/debug-select';

import { dunif } from '../index';


const dunifDomainWarns = select('dunif')("argument out of domain in '%s'");

describe('dunif', function () {

    describe('invalid input and edge cases', () => {
        beforeEach(()=>{
            cl.clear('dunif');
        });
        it('x=Nan|min=NaN|max=NaN', () => {
            // dunif(x: number, min = 0, max = 1, logP = false):
            const nan1 = dunif(NaN, 4, 3);
            const nan2 = dunif(0.9, NaN, 3);
            const nan3 = dunif(0.9, 4, NaN);
            expect([nan1, nan2, nan3]).toEqualFloatingPointBinary(NaN);
        });
        it('x < min=(0) | x > max=(1)', () => {
            const zero1 = dunif(-0.9);
            expect(zero1).toBe(0);
            const zero2 = dunif(1.2);
            expect(zero2).toBe(0);
        });
        it('x = min | x = max', () => {
            const ans1 = dunif(4, 4, 9);
            expect(ans1).toBe(1/(9-4));
            const ans2 = dunif(9, 4,9);
            expect(ans2).toBe(1/(9-4));
        });
        it('min >= max', () => {
            const nan1 = dunif(4, 9, 4);
            expect(nan1).toBeNaN();
            const nan2 = dunif(4, 9, 9);
            expect(nan2).toBeNaN();
            expect(dunifDomainWarns()).toHaveLength(2);
        });
        
    });
    describe('fidelity', () => {
        //
        it('log=true', ()=>{
            const ans = dunif(4,4,9, true);
            expect(ans).toEqualFloatingPointBinary(-1.6094379124341003);
        });
        it('4 < x < 4.001',()=>{
            const ans = dunif(4.00001,4,4.001);
            expect(ans).toEqualFloatingPointBinary(999.9999999996661);
        });
    });
});