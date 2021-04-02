//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';
import { qexp } from '..';

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

const dexpLogs = select('qexp');
const dexpDomainWarns = dexpLogs("argument out of domain in '%s'");
dexpDomainWarns;
/*
#options(digits=18)
#x=seq(0-0.125,1+0.125,0.125/2)
#y1=qexp(x, rate=4, T, F)
#y2=qexp(x, rate=32, F, F)
#y3=qexp(log(x), rate=8, F, T)
#data.frame(x,y1,y2,y3)
*/

describe('qexp', function () {
    beforeEach(() => {
        cl.clear('qexp');
    })
    it('p=[ -0.1250, 1.1250 ], rates= 4, 32, (8 and tail=false, log=true)', async () => {
        const [p, y1, y2, y3 ] = await loadData(resolve(__dirname, 'fixture-generation', 'qexp.R'), /\s+/, 1, 2, 3, 4);

        const a1 = p.map(_p => qexp(_p, 4));
        expect(a1).toEqualFloatingPointBinary(y1);

        const a2 = p.map(_p => qexp(_p, 32, false));
        expect(a2).toEqualFloatingPointBinary(y2, 48);

        const a3 = p.map(_p => qexp(Math.log(_p), 8, false, true));
        expect(a3).toEqualFloatingPointBinary(y3, 49);
    });
    it('rate = NaN', () => {
        const nan = qexp(0, NaN);
        expect(nan).toBeNaN();
    });
    it('rate = -3 (<0)', () => {
        const nan = qexp(0, -3);
        expect(nan).toBeNaN();
        expect(dexpDomainWarns()).toHaveLength(1);
    });
});