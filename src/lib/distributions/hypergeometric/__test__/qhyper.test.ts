//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';
import { qhyper } from '..';

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

const qhyperLogs = select('qhyper');
const qhyperWarns = qhyperLogs("argument out of domain in '%s'");
const p01bounderies = select('R_Q_P01_boundaries')("argument out of domain in '%s'")

/**
 * function qhyper(p, m, n, k, lower.tail = TRUE, log.p = FALSE)
 * p            = vector of probailities
 * m            = number of white balls in the population
 * n            = number of black balls in the population
 * k            = total number of balls drawn (k-x)=number of non-white balls
 * lower.tail   =  if TRUE (default), probabilities are P[X <= x], otherwise, P[X > x].
 * log.p        =  probabilities as log(p);
 * 
 * return descrete quantile
 */

describe('qhyper(p,m,n,k,log)', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('qhyper');
            cl.clear('R_Q_P01_boundaries');
         });
        it('test inputs p, nr, ,b, n on NaN', () => {
            const nan1 = qhyper(NaN, 0, 0, 0);
            const nan2 = qhyper(0, NaN, 0, 0);
            const nan3 = qhyper(0, 0, NaN, 0);
            const nan4 = qhyper(0, 0, 0, NaN);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
            expect(qhyperWarns()).toHaveLength(0);
        });
        it('test inputs p,nr, nb, n on infinity', () => {
            const I = Infinity;
            const nan1 = qhyper(I, 0, 0, 0);
            const nan2 = qhyper(0, I, 0, 0);
            const nan3 = qhyper(0, 0, I, 0);
            const nan4 = qhyper(0, 0, 0, I);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
            expect(qhyperWarns()).toHaveLength(4);
        });
        it('test inputs nr < 0, nb <0, n <0 n > (nb+nr)', () => {
            const nan1 = qhyper(0.1, -1, 0, 0);
            const nan2 = qhyper(0.1, 0, -1, 0);
            const nan3 = qhyper(0.1, 0, 0, -1);
            const nan4 = qhyper(0.1, 0, 0, 2);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
            expect(qhyperWarns()).toHaveLength(4);
        });
        it('p < 0 || p > 1', () => {
            const nan1 = qhyper(-1, 2, 3, 2);
            const nan2 = qhyper(1.21, 2, 3, 2);
            expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
            expect(p01bounderies()).toHaveLength(2);
        });
    });
    describe('edge cases', () => {
        it('(p=1 and p=1, m=300 n=150, k=400', () => {
            // the minimum output is Max(0,  (nn-nb) )
            // the maximum output is min(nn, nr)
            // xstart = max(0, 400-150) = 250, so p=0 will output 250
            // xstop = min(400, 300) = 300, so if p=1 will output 300
            const z2 = qhyper(0, 300, 150, 400);
            const z3 = qhyper(1, 300, 150, 400);
            expect(z2).toBe(250);
            expect(z3).toBe(300);
        });
    });
    describe('with fixtures', () => {
        it('p ∈ [0,1], m=300, n=150, k=400', async () => {
            const [x, y1, y2, y3] = await loadData(
                resolve(__dirname, 'fixture-generation', 'qhyper.R'),
                /,/,
                1, 2, 3, 4
            );
            const a1 = x.map(_x => qhyper(_x, 15, 20, 15));
            const a2 = x.map(_x => qhyper(_x, 15, 20, 15, false));
            const a3 = x.map(_x => qhyper(_x, 15, 20, 15, false, true));
            expect(a1).toEqualFloatingPointBinary(y1, 45);
            expect(a2).toEqualFloatingPointBinary(y2, 45);
            expect(a3).toEqualFloatingPointBinary(y3, 45);
        });
    });
});