import { register, unRegister } from '@mangos/debug-frontend';

import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

import besselJ from '..';

describe('bessel function of first kind (besselJ)', function () {
    describe('invalid input and edge cases', () => {
        const logs: MockLogs[] = [];
        beforeEach(() => {
            const backend = createBackEndMock(logs);
            register(backend);
        });
        afterEach(() => {
            unRegister();
            logs.splice(0);
        });
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
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'J_bessel',
                    formatter: "argument out of range in '%s'",
                    args: ['J_bessel_err_nr=1000']
                },
                {
                    prefix: '',
                    namespace: 'BesselJ',
                    formatter: 'debug (nu=%d, na=%d, nb=%d, rc=%j',
                    args: [
                        0,
                        52,
                        53,
                        {
                            x: 0,
                            nb: 53,
                            ncalc: 53
                        }
                    ]
                }
            ]);
        });
        it('x=27.595, nu=398.5', () => {
            const actual = besselJ(27.595, 398.5);
            expect(actual).toBe(0);
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'J_bessel',
                    formatter: 'rest: x=%d, nb=%d\t',
                    args: [27.595, 399]
                },
                {
                    prefix: '',
                    namespace: 'BesselJ',
                    formatter: 'debug (nu=%d, na=%d, nb=%d, rc=%j',
                    args: [
                        0.5,
                        398,
                        399,
                        {
                            x: 0,
                            nb: 399,
                            ncalc: 320
                        }
                    ]
                },
                {
                    prefix: '',
                    namespace: 'BesselJ',
                    formatter: 'bessel_j(%d,nu=%d): precision lost in result',
                    args: [27.595, 398.5]
                }
            ]);
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
