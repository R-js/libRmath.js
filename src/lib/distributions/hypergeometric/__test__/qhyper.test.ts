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
//const nonIntWarns = phyperLogs('non-integer x = %d');

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
            cl.clear('phyper');
        });
        it('test all inputs on NaN', () => {
            const nan1 = qhyper(NaN, 0, 0, 0);
            const nan2 = qhyper(0, NaN, 0, 0);
            const nan3 = qhyper(0, 0, NaN, 0);
            const nan4 = qhyper(0, 0, 0, NaN);
            expect([nan1, nan2, nan3, nan4]).toEqualFloatingPointBinary(NaN);
            expect(qhyperWarns()).toHaveLength(0);
        });
        it('test all inputs (except x) on negative of non integer', () => {
            const nan1 = qhyper(0, -1, 0, 0);
            const nan2 = qhyper(0, 0, -1, 0);
            const nan3 = qhyper(0, Infinity, 0, 0);
            const nan4 = qhyper(0, 0, 0, -1);
            const nan5 = qhyper(0, 1, 1, 4);
            expect([nan1, nan2, nan3, nan4, nan5]).toEqualFloatingPointBinary(NaN);
            expect(qhyperWarns()).toHaveLength(5);
        });
    });
    xdescribe('edge cases', () => {
        it('(negative x)x=-1, m=0 n=2, k=1', () => {
            const z = qhyper(-1, 0, 2, 1);
            expect(z).toBe(0);
        });
        it('flip when x*(n+m) > k*m ), x=2, m=0 n=2, k=2', () => {
            // x*(n+m) > k*m
            // x/k > m/(n+m)
            // with m/(n+m) always <=1
            // x/k > 1 is always false
            // x > k is always false (more success then sampled)
            // so this protect against x > k
            // using parameters specified:
            // 2*2 > 2*0; yes, this will flip to
            // x=(k -x ) -1= -1
            // swap values m and n (n=0,m=2)
            // lowerTail =!lowerTail
            // another example:
            //   x=?, m=10, n=30 k=15, at what 'x' will it flip?
            //   x/15 > 10/40 =>  x/15 > 0.25 => x > 3.75
            const z = qhyper(2, 0, 2, 2);
            expect(z).toBe(1);
        });
        it('(sample black balls more then avail), x = 3, m=3 n=2, k=4', () => {
            // x < nn - nb
            // -x > -nn + nb
            // nn -x > nb  (more "black balls" sampled then avail)
            const z = qhyper(3, 3, 2, 4);
            expect(z).toBe(1);
        });
        it('x >= k and k=nr so x=>nr', () => {
            // avoid "switch of vars" so this must be true: x*(n+m) <= k*m
            // x/k <= m/(m+n) since x/k >=1 is also a condition this means
            // 1 <= m/(m+n) this can only be so if m = 0 or n=0 (not both)
            const z = qhyper(4, 4, 0, 4);
            expect(z).toBe(1);
        });
        it('x >= k while x < nr is not testable', () => {
            // avoid "switch of vars" so this must be true: x*(n+m) <= k*m
            // x/k <= m/(m+n) (deviding away solution m=0) since x/k >=1 is also a condition this means
            // x < nn - nb must be false,  so -x > -nn + nb, so nn-x > nb
            // 1 <= m/(m+n) this can only be so if m = 0 or n=0 (not both)
            const z = qhyper(4, 0, 4, 4);
            expect(z).toBe(1);
        });
        it('small chances x=10, nr=4000, nb=2000, nn=k=1000', () => {
            // avoid "switch of vars" so this must be true: x*(n+m) <= k*m
            // x/k <= m/(m+n) (deviding away solution m=0) since x/k >=1 is also a condition this means
            // x < nn - nb must be false,  so -x > -nn + nb, so nn-x > nb
            // 1 <= m/(m+n) this can only be so if m = 0 or n=0 (not both)
            const z = qhyper(10, 4000, 2000, 1000);
            expect(z).toBe(0);
        });

        qhyper(10, 4000, 2000, 1000);
    });

    xdescribe('with fixtures', () => {
        it('x ∈ [0,15], m=15, n=20, k=15', async () => {
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