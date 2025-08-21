
import besselJ from '..';

import { createLogHarnas } from '@common/debug-backend';
const { getStats } = createLogHarnas();

describe('bessel function of first kind (besselJ)', function () {
    describe('invalid input and edge cases', () => {
        it('[NaN] in, NaN', () => {
            const actual = besselJ(NaN, 0);
            expect(actual).toEqualFloatingPointBinary(NaN);
        });
        it('[-1] in, NaN', () => {
            const actual = besselJ(-1, 0);
            expect(actual).toEqualFloatingPointBinary(NaN);
        });
        it('x=4,nu=1e9 gives NaN', () => {
            const actual = besselJ(4, 1e9);
            expect(actual).toEqualFloatingPointBinary(NaN);
        });
        it('x=4E5,nu=-52 gives warning', () => {
            const actual = besselJ(4e5, -52);
            // check error log
            expect(actual).toEqualFloatingPointBinary(0);
            expect(getStats()).toEqual({ BesselJ: 3, J_bessel: 1 });
        });
        it('x=27.595, nu=398.5', () => {
            const stats0 = getStats();
            const actual = besselJ(27.595, 398.5);
            expect(actual).toBe(0);
            const stats1 = getStats();
            const BesselJCnt = stats1.BesselJ - stats0.BesselJ;
            const J_besselCnt = stats1.J_bessel - stats0.J_bessel;
            expect(BesselJCnt).toBe(2);
            expect(J_besselCnt).toBe(1);
        });
    });
    describe('fidelity', () => {
        it('x=0.1,nu=-0.5', () => {
            const actual = besselJ(0.1, -0.5);
            expect(actual).toEqualFloatingPointBinary(2.5105273689585096974);
        });
        it('x=0.1,nu=-0.9', () => {
            const actual = besselJ(0.1, -0.9);
            expect(actual).toEqualFloatingPointBinary(1.5191602453485768542);
        });
        it('x< 1E-4, nu=-4.9', () => {
            const actual = besselJ(1e-4 / 2.1, 4.9);
            expect(actual).toEqualFloatingPointBinary(2.1907703120848136824e-25);
        });
        it('x > 25, nu = 3', () => {
            const actual = besselJ(40, 3);
            expect(actual).toEqualFloatingPointBinary(-0.12614481550582079539);
        });
    });
});
