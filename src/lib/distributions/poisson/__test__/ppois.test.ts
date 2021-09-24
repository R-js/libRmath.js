//import { loadData } from '@common/load';
//import { resolve } from 'path';

//import { cl /*, select*/ } from '@common/debug-select';
import { ppois } from '..';

//import { DBL_MIN, MAX_SAFE_INTEGER, trunc } from '@lib/r-func';

//const dpoisLogs = select('ppois');
//const dpoisDomainWarns = dpoisLogs("argument out of domain in '%s'");

describe('ppois', function () {
    /*beforeEach(() => {
        cl.clear('dpois');
    })*/
    describe('invalid input and edge cases', () => {
        it('x and lambda are NaN', () => {
            const nan1 = ppois(NaN, 2);
            expect(nan1).toBeNaN();
            const nan2 = ppois(0.1, NaN);
            expect(nan2).toBeNaN();
        });
        xit('lambda < 0', () => {
            const nan1 = ppois(0.5, -1);
            expect(nan1).toBeNaN();
            //expect(dpoisDomainWarns()).toHaveLength(1);
        });
        xit('x is non integer', () => {
            const zero = ppois(0.5, 1);
            expect(zero).toBe(0);
            //expect(dpoisNonInt()).toHaveLength(1);
        });
        xit('x < 0 or x is Infinite', () => {
            const zero1 = ppois(-2, 1);
            expect(zero1).toBe(0);
            const zero2 = ppois(Infinity, 1);
            expect(zero2).toBe(0);
        });
        it('x = 1 lambda = Infinite', () => {
            const zero1 = ppois(1, Infinity);
            expect(zero1).toBe(0);
        });
    });
    /*describe('fidelity', () => {
        it('x > 0 lambda = 0', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois1.R'), /\s+/, 1, 2);
            const result = x.map(_x => dpois(_x, 0));
            expect(result).toEqualFloatingPointBinary(y);
        });
        it('x > 0 lambda = 1', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois2.R'), /\s+/, 1, 2);
            const result = x.map(_x => dpois(_x, 1));
            expect(result).toEqualFloatingPointBinary(y, 50);
        });
        it('x > 0 lambda = 2', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois3.R'), /\s+/, 1, 2);
            const result = x.map(_x => dpois(_x, 2));
            expect(result).toEqualFloatingPointBinary(y, 51);
        });
        it('x > 0 lambda = 4', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois4.R'), /\s+/, 1, 2);
            const result = x.map(_x => dpois(_x, 4));
            expect(result).toEqualFloatingPointBinary(y, 51);
        });
        it('x > 0 lambda = 10', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois5.R'), /\s+/, 1, 2);
            const result = x.map(_x => dpois(_x, 10));
            expect(result).toEqualFloatingPointBinary(y, 46);
        });
        it('lambda < MAX_SAFE_INTEGER * DBL_MIN', async () => {
            const ans1 = dpois(
                MAX_SAFE_INTEGER, // x
                DBL_MIN * (trunc(MAX_SAFE_INTEGER - 1) // lambda
                )
            );
            expect(ans1).toBe(0);

            const ans2 = dpois_raw(
                Infinity, // x
                DBL_MIN * (MAX_SAFE_INTEGER - 1), // lambda
                false
            );
            expect(ans2).toBe(0);
        });
        it.todo('any reasonable value of "lambda < x * DBL_MIN" slaps result to zero investigate');
    });*/
});