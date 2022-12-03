import hypot from '../hypot';

describe('hypot', function () {
    describe('invalid input and edge cases', () => {
        it('NaN input', () => {
            const l = hypot(NaN, 0);
            expect(l).toEqualFloatingPointBinary(NaN);
            const l2 = hypot(0, NaN);
            expect(l2).toEqualFloatingPointBinary(NaN);
        });
        it('Infinite input', () => {
            const l = hypot(Infinity, 0);
            expect(l).toEqualFloatingPointBinary(Infinity);
            const l2 = hypot(0, Infinity);
            expect(l2).toEqualFloatingPointBinary(Infinity);
        });
    });
    describe('fidelity', () => {
        it('hypot(3,2)', () => {
            expect(hypot(3,2)).toEqualFloatingPointBinary(Math.sqrt(3**2+2**2));
        });
        it('hypot(3E3,2E9)', () => {
            expect(hypot(3E3,2E9)).toEqualFloatingPointBinary(Math.sqrt(3E3**2+2E9**2), 50);
        });
        it('hypot(3E-3,2E-9)', () => {
            expect(hypot(3E-3,2E-9)).toEqualFloatingPointBinary(Math.sqrt(3E-3**2+2E-9**2), 49);
        });
    });
});