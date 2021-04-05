//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';
import { qgamma } from '..';

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

const qgammaLogs = select('qgamma');
const qgammaDomainWarns = qgammaLogs("argument out of domain in '%s'");

describe('qgamma', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('qgamma');
        });
        it('x=NaN, shape=1.6, defaults', () => {
            const z = qgamma(NaN, 1.6);
            expect(z).toBeNaN();
        });
        it('x=0, shape=-5(<0), defaults', () => {
            const nan = qgamma(0, -5);
            expect(nan).toBeNaN();
            expect(qgammaDomainWarns()).toHaveLength(1);
        });
    });
    describe('edge cases', () => {
        //
    });
    describe('with fixtures', () => {
        //
    });
});