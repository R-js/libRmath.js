


import { globalUni, RNGkind } from '@rng/global-rng';
import { rcauchy } from '..';
import { cl } from '@common/debug-mangos-select';

describe('rcauchy', function () {

    beforeEach(() => {
        RNGkind({ uniform: "MERSENNE_TWISTER", normal: "INVERSION"});
        globalUni().init(98765);
        cl.clear('rcauchy');
    })
    it('n=10, defaults', () => {
        const actual = rcauchy(10);
        expect(actual).toEqualFloatingPointBinary([
            -0.66994487715123585,
            1.20955716687833958,
            1.35631725954545934,
            -3.90808796022627103,
            11.85243370429442322,
            -0.18511629328457940,
            1.00495191358054226,
            1.54346903352469722,
            -0.19365762450302235,
            -2.53641576069522667
        ]);
    });
    it('n=1, location=NaN, defaults', () => {
        const nan = rcauchy(1, NaN);
        expect(nan).toEqualFloatingPointBinary(NaN);
    });
    it.todo('expect(out.length).toBe(1)');
    it('n=1, location=3, scale=0', () => {
        const z = rcauchy(1, 3, 0);
        expect(z).toEqualFloatingPointBinary(3);
    });
    it('n=1, location=Infinity, scale=0', () => {
        const z = rcauchy(1, Infinity, 0);
        expect(z).toEqualFloatingPointBinary(Infinity);
    });
});