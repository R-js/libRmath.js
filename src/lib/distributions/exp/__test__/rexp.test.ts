//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { rexp } from '..';

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

const dexpLogs = select('rexp');
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

describe('rexp', function () {
    beforeEach(() => {
        cl.clear('rexp');
    })
    it('n=10, rates= 4, 32, (8 and tail=false, log=true)', () => {
        //
        rexp(1);
    });
    it('rate = NaN', () => {
        //
    });
    it('rate = -3 (<0)', () => {
        //
    });
});
