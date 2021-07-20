//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { plogis } from '..';

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

const pLogisLogs = select('plogis');
const pLogisDomainWarns = pLogisLogs("argument out of domain in '%s'");

describe('plogis', function () {
    describe('edge cases', () => {
        beforeEach(() => {
            cl.clear('plogis');
        });
        it('x = NaN or location = Nan, or scale = NaN or give_log = NaN', () => {
            const nan1 = plogis(NaN);
            expect(nan1).toBeNaN();
            //
            const nan2 = plogis(0, NaN);
            expect(nan2).toBeNaN();
            //
            const nan3 = plogis(0, undefined, NaN);
            expect(nan3).toBeNaN();
        });
        it('scale <= 0', () => {
            const nan = plogis(0,undefined, -0.5);
            expect(nan).toBeNaN();
            expect(pLogisDomainWarns()).toEqual([ [ "argument out of domain in '%s'", '' ] ]);
        });
        it('x = -Infinity and x = Infinity', () => {
            const zero = plogis(-Infinity);
            const one = plogis(Infinity);
            expect(zero).toBe(0);
            expect(one).toBe(1);
        });
    });
    describe('fidelity', () => {
        it('x=0.4, location=4, scale = 0.4, lower.tail = false', () => {
            const r = plogis(0.4, 4, 0.4, false);
            expect(r).toEqualFloatingPointBinary(0.99987660542401369);
        });
        it('x=0.4, location=4, scale = 0.4, lower.tail = true', () => {
            const r = plogis(0.4, 4, 0.4, true);
            expect(r).toEqualFloatingPointBinary(0.00012339457598623172);
        });
        //# y=dlogis(x,localtion=4,scale=99.125, Log=TRUE)
        it('x=0.4, location=4, scale = 0.4, lower.tail = true, log = true', () => {
            const r = plogis(0.4, 4, 0.4, true, true);
            expect(r).toEqualFloatingPointBinary(-9.0001234021897236);
        });
        it('x=0.4, location=4, scale = 0.4, lower.tail = false, log = true', () => {
            const r = plogis(0.4, 4, 0.4, false, true);
            expect(r).toEqualFloatingPointBinary(-0.00012340218972325883);
        });
        //plogis(252, 4, 0.4, FALSE, TRUE)
        it('x=252, location=4, scale = 0.4, lower.tail = false, log=true', () => {
            const r = plogis(252, 4, 0.4, false, true);
            expect(r).toEqualFloatingPointBinary(-620);
        });
        it('x = 14, location = 4, scale = 0.4, lower.tail = false, log=true', () => {
            const r = plogis(14, 4, 0.4, false, true);
            expect(r).toEqualFloatingPointBinary(-25.000000000013888);
        });
    });
});
