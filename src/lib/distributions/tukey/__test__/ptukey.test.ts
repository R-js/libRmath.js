import { cl, select } from '@common/debug-select';
import { ptukey } from '../index';

const ptukeyDomainWarns = select('ptukey')("argument out of domain in '%s'");

describe('ptukey', function () {

    describe('invalid input and edge cases', () => {

        beforeEach(() => {
            cl.clear('ptukey');
            cl.clear('R_Q_P01_boundaries');
        });

        it('p=Nan|nmeans=NaN|df=NaN|ranges=NaN', () => {
            const nan1 = ptukey(NaN, 4, 3, 2);
            const nan2 = ptukey(0.9, NaN, 3, 2);
            const nan3 = ptukey(0.9, 4, NaN);
            const nan4 = ptukey(0.9, 4, 3, NaN);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
            expect(ptukeyDomainWarns()).toHaveLength(4);
        });
        it('x <= 0 | x -> infinity', () => {
            const zero = ptukey(-0.9, 4, 2);
            const one = ptukey(Infinity, 4, 2);
            expect(zero).toBe(0);
            expect(one).toBe(1);
        })
        it('df < 2| nmeans < 2| nrnanges < 1', () => {
            const nan1 = ptukey(5, 4, 1);
            const nan2 = ptukey(5, 1, 2);
            const nan3 = ptukey(5, 2, 2, 0);
            expect([nan1, nan2, nan3]).toEqualFloatingPointBinary(NaN);
            expect(ptukeyDomainWarns()).toHaveLength(3);
        });
        it('df > 25000, use wprob', () => {
            const ans = ptukey(1, 5, 26000);
            expect(ans).toEqualFloatingPointBinary(0.045045144807077879, 51);
        });
        it('df <= 100', () => {
            const ans = ptukey(1, 5, 99);
            expect(ans).toEqualFloatingPointBinary(0.045568098320534482, 43);
        });
        it('df <= 800', () => {
            const ans = ptukey(1, 5, 800);
            expect(ans).toEqualFloatingPointBinary(0.045110384253139374, 43);
        });
        it('df <= 800', () => {
            const ans = ptukey(1, 5, 800);
            expect(ans).toEqualFloatingPointBinary(0.045110384253139374, 43);
        });
        it('df <= 5000', () => {
            const ans = ptukey(2, 15, 5000);
            expect(ans).toEqualFloatingPointBinary(0.013785222188205156, 42);
        });
        it('5000 > df > 25000', () => {
            const ans = ptukey(2, 45, 20000);
            expect(ans).toEqualFloatingPointBinary(2.5070931912134792e-07, 49);
        });
    });
    describe('fidelity', () => {
        //
        it('q=1,means=2,df=2', ()=>{
            const ans = ptukey(1,2,2);
            expect(ans).toEqualFloatingPointBinary(0.4472265936580529);
        });
        it('q=1,means=10,df=2', ()=>{
            const ans = ptukey(1,10,2);
            expect(ans).toEqualFloatingPointBinary(0.0062302208521515471);
        });
        it('q=3,means=2,df=2', ()=>{
            const ans = ptukey(3,2,2);
            expect(ans).toEqualFloatingPointBinary(0.83208936636478947);
        });
        it('q=1,means=15,df=2', ()=>{
            const ans = ptukey(1,15,2);
            expect(ans).toEqualFloatingPointBinary(0.0011575694736568522, 48);
        });

    });
});