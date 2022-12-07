import { cl, select } from '@common/debug-mangos-select';
const lbetaDomainWarns = select('lbeta')("argument out of domain in '%s'");
lbetaDomainWarns;

//app
import { lbeta } from '..';

describe('lbeta(a,b)', function () {
    beforeEach(()=>{
        cl.clear('lbeta');
    })
    it('a = 0, b > 0', () => {
        /* load data from fixture */
        const a = 0;
        const b = 0.5;
        const actual = lbeta(a, b);
        expect(actual).toEqualFloatingPointBinary(Infinity);
    });
    it('a={1,4} {3,2}', () => {
        const rc = [[1,4],[3,2]].map(v => lbeta(v[0], v[1]));
        expect(rc).toEqualFloatingPointBinary([-1.386294361, -2.484906650], 31);
    });
    it('a=[NaN, NaN] should return NaN', () => {
        const rc = lbeta(NaN, NaN);
        expect(rc).toEqualFloatingPointBinary(NaN);
    });
    it('(check ME) a < 0, b > 0 should return NaN', () => {
        /* eslint-disable-line  @typescript-eslint/no-explicit-any */
        const rc = lbeta(-1,0.5);
         /* eslint-disable-line  @typescript-eslint/no-explicit-any */
         expect(rc).toEqualFloatingPointBinary(NaN);
    });
    it('a > 0, b = +Inf should -Infinity', () => {
        const rc = lbeta(1,Infinity);
        expect(rc).toEqualFloatingPointBinary(-Infinity);
    });
    it('a >= 5, b = 20', () => {
        const rc = lbeta(5,20);
        expect(rc).toEqualFloatingPointBinary(-12.26679138, 32);
    });
    it('a = 1E-307, b = 5', () => {
        const rc = lbeta(1e-307,5);
        expect(rc).toEqualFloatingPointBinary(706.8936235, 32);
    });
});
