import { log1p } from '../log1p';
import { cl, select } from '@common/debug-mangos-select';
const dlog1pDomain = select('log1p')(/.*/)

//hypot

describe('log1p', function () {
    beforeEach(() => {
        cl.clear('log1p');
    });
    describe('invalid input and edge cases', () => {
        it('x < -1 should be a NaN', () => {
            /* load data from fixture */
            const l = log1p(-1.5);
            expect(l).toEqualFloatingPointBinary(NaN);
            expect(dlog1pDomain()).toEqual([
                [
                    "argument out of domain in '%s'",
                    'log1p, line:96, col:42'
                ]
            ]);
        });
        it('x = -1 should be a -Infinity', () => {
            /* load data from fixture */
            const l = log1p(-1);
            expect(l).toEqualFloatingPointBinary(-Infinity);
        });
        it('x < -0.999999985 causes precision failure warning', () => {
            const l = log1p(-0.999999999);
            // check for debug printing with mock
            expect(l).toEqualFloatingPointBinary(-20.723265865228342);
            expect(dlog1pDomain()).toEqual([
                [
                    "full precision may not have been achieved in '%s'",
                    'log1p, line:110, col:18'
                ]
            ]);
        })
    });
    describe('fidelity', () => {
        it('log1p(0)', () => {
            expect(log1p(0)).toEqualFloatingPointBinary(0)
        });
        it('log1p(1)', () => {
            expect(log1p(1)).toEqualFloatingPointBinary(0.6931471805599453);
        });
        it('log1p(10000)', () => {
            expect(log1p(10000)).toEqualFloatingPointBinary(9.210440366976517);
        })
    });
});
