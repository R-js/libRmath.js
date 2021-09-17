// node
import { resolve } from 'path';

//helper
import { loadData } from '@common/load.js';

//app
import besselJ from '../index.js';

describe('bessel function of order 0', function () {
    it('ranges x ∊ [0, 10]', async () => {
        /* load data from fixture */
        const [x_data, y] = await loadData(resolve(__dirname, 'fixture-generation', 'bessel-j-0.R'), /\s+/, 1, 2);
        const actual = x_data.map(x => besselJ(x, 0));
        expect(actual).toEqualFloatingPointBinary(y);
    });
    it('x=4, nu=0', async () => {
        const actual = besselJ(4 as never, 0);
        expect(actual).toEqualFloatingPointBinary(-0.3971498098638474028);
    });
    it('missing nu', async () => {
        expect(() => besselJ(undefined as never, undefined as never)).toThrow('argument "nu" is missing/not a number, Execution halted');
    });
    it.todo('x = {4, 5, 6}', async () => {
        const actual = [4, 5, 6].map(x => besselJ(x, 0));
        actual;
    });
    it('[NaN] in, NaN', async () => {
        const actual = besselJ(NaN, 0);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('[-1] in, NaN', async () => {
        const actual = besselJ(-1, 0);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('besselJ(x=4,nu=1e9) = NaN', async () => {
        const actual = besselJ(4, 1e9);
        expect(actual).toEqualFloatingPointBinary(NaN);
    });
    it('besselJ(x=4,nu=-0.5)', async () => {
        const actual = besselJ(4, -0.5);
        expect(actual).toEqualFloatingPointBinary(-0.26076607667717883);
    });
    it('besselJ(x=4,nu=-0.6)', async () => {
        const actual = besselJ(4, -0.6);
        expect(actual).toEqualFloatingPointBinary(-0.20609743783497769);
    });
    it('besselJ(x=1e6,nu=3.6)', async () => {
        const actual = besselJ(1e6, 3.6);
        expect(actual).toEqualFloatingPointBinary(0);
        //check with mock of ML_ERROR "In besselJ(1e+06, 3.6) : value out of range in 'J_bessel'"
    });
    it('besselJ(x=45,nu=15)', async () => {
        const actual = besselJ(45, 15);
        expect(actual).toEqualFloatingPointBinary(-0.046442262826576784);
    });
    it('besselJ(x=45,nu=0)', async () => {
        const actual = besselJ(45, 0);
        expect(actual).toEqualFloatingPointBinary(0.11581867067325632);
    });
});