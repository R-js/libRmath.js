//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';
import { dhyper } from '..';

const cl = require('debug');

function select(ns: string) {
    return function (filter: string) {
        return function () {
            const logs = cl.get(ns);// put it here and not in the function scope
            if (!logs) return [];
            return logs.filter((s: string[]) => s[0] === filter);
        };
    };
}

const dhyperLogs = select('dhyper');
const dhyperWarns = dhyperLogs("argument out of domain in '%s'");
const nonIntWarns = dhyperLogs('non-integer x = %d');

/**
 * dhyper(x, m, n, k, log = FALSE)
 * x= number of white balls drawn without replacement
 * m= number of white balls in the population
 * n= number of black balls in the population
 * k=total number of balls drawn (k-x)=number of non-white balls
 * log= return probabilities as log(p);
 */

describe('dhyper(x,m,n,k,log)', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('dhyper');
        });
        it('test all inputs on NaN', () => {
            const nan1 = dhyper(NaN, 0,0,0);
            const nan2 = dhyper(0, NaN,0,0);
            const nan3 = dhyper(0, 0,NaN,0);
            const nan4 = dhyper(0, 0,0,NaN);
            expect([nan1,nan2,nan3,nan4]).toEqualFloatingPointBinary(NaN);
        });
        it('test all inputs (except x) on negative of non integer', () => {
            const nan1 = dhyper(0, 1.2,0,0);
            const nan2 = dhyper(0, 0, 3.2,0);
            const nan3 = dhyper(0, 0,0,1);
            expect([nan1,nan2,nan3]).toEqualFloatingPointBinary(NaN);
            expect(dhyperWarns()).toHaveLength(3);
        });
    });

    describe('edge cases', () => {
        it('x = -1, m=0 n=2, k=1',()=>{
            const z = dhyper(-1,0,2,1);
            expect(z).toBe(0);
        });
        it('x = 0, m=0 n=2, k=1',()=>{
            const z = dhyper(0,0,2,1);
            expect(z).toBe(1);
        });  
        it('sample more then avail, x = 3, m=2 n=2, k=1',()=>{
            const z = dhyper(3,2,2,3);
            expect(z).toBe(0);
        });
        it('x is a non integer', () => {
            const z = dhyper(0.5, 3,2,2);
            expect(z).toBe(0);
            expect(nonIntWarns()).toHaveLength(1);
        });  
        it('(contradiction) n = 0( no samples drawn), x > 0', () => {
            const z = dhyper(2, 3,2,0);
            expect(z).toBe(0);
        });
        it('n = 0 && x=0' , () => {
            const z = dhyper(0, 3,2,0);
            expect(z).toBe(1);
        });
    });

    describe('with fixtures', () => {
        it('x ∈ [0,15], m=20, n=10, k=15', async () => {
            const [x, y1] = await loadData(
                resolve(__dirname, 'fixture-generation', 'dhyper.R'),
                /\s+/,
                1, 2, 3
            );
            const a1 = x.map(_x => dhyper(_x, 20, 10, 15));
            const a2 = x.map(_x => Math.exp(dhyper(_x, 20, 10, 15, true)));
            expect(a1).toEqualFloatingPointBinary(y1, 46);
            expect(a2).toEqualFloatingPointBinary(y1, 43);
        });
    });
});