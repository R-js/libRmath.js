//helper
import '$jest-extension';
import { globalUni, RNGKind } from '@rng/globalRNG';

import { rcauchy } from '..';
import { IRNGTypeEnum  } from '@rng/irng-type';
import { IRNGNormalTypeEnum } from '@rng/normal/in01-type';

jest.mock('@common/logger', () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual('@common/logger');
    const { ML_ERROR, ML_ERR_return_NAN } = originalModule;
    let array: unknown[];
    function pr(...args: unknown[]): void {
        array.push([...args]);
    }

    return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        ML_ERROR: jest.fn((x: unknown, s: unknown) => ML_ERROR(x, s, pr)),
        ML_ERR_return_NAN: jest.fn(() => ML_ERR_return_NAN(pr)),
        setDestination(arr: unknown[] = []) {
            array = arr;
        },
        getDestination() {
            return array;
        }
    };
});
//app
const cl = require('@common/logger');
cl.setDestination();
const out = cl.getDestination();

describe('rcauchy', function () {

    beforeEach(() => {
        out.splice(0);//clear out
        RNGKind(IRNGTypeEnum.MERSENNE_TWISTER, IRNGNormalTypeEnum.INVERSION);
        globalUni().init(98765);
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
        expect(out.length).toBe(1);
    });
    it('n=1, location=3, scale=0', () => {
        const z = rcauchy(1, 3, 0);
        expect(z).toEqualFloatingPointBinary(3);
    });
    it('n=1, location=Infinity, scale=0', () => {
        const z = rcauchy(1, Infinity, 0);
        expect(z).toEqualFloatingPointBinary(Infinity);
    });
});