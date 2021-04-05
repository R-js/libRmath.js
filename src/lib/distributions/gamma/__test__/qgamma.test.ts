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
const bounderiesWarns = select('R_Q_P01_boundaries')("argument out of domain in '%s'");

describe('qgamma', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('qgamma');
            cl.clear('R_Q_P01_boundaries');
        });
        it('p=NaN, shape=1.6, defaults', () => {
            const z = qgamma(NaN, 1.6);
            expect(z).toBeNaN();
        });
        it('p=0.5, shape<0 or scale<0, defaults', () => {
            const nan = qgamma(0.5, -5);
            const nan2 = qgamma(0.5, 2, -3);
            expect(nan).toBeNaN();
            expect(nan2).toBeNaN();
            expect(qgammaDomainWarns()).toHaveLength(2);
        });
        it('p=-2 shape=1.6, defaults', () => {
            const nan = qgamma(-2, 1.6);
            expect(nan).toBe(nan);
            expect(bounderiesWarns()).toHaveLength(1);
        });
    });
    describe('edge cases', () => {
        it('p=0 or p=1, shape=1.6, defaults', () => {
            const z = qgamma(0, 1.6);
            expect(z).toBe(0);
            const inf = qgamma(1, 1.6);
            expect(inf).toBe(Infinity);
        });
        it('shape=0, p=0.5 (0,1) defaults', () => {
            const z = qgamma(0.5, 0);
            expect(z).toBe(0);
        });
        it('shape<1e-10, p=0.9 (0,1) defaults', () => {
            const z = qgamma(0.9, 0.5e-10);
            expect(z).toBe(0);
        });
        it('shape=5, (1 - 1e-14) < p < 1, defaults', () => {
            const z = qgamma(1 - 0.5e-14, 5);
            expect(z).toEqualFloatingPointBinary(45.076173899165994);
        });
        it('shape=1e9 (shape high because p<<<1 and need to skip some checks), 0 < p < 1e-100, defaults', () => {
            const z = qgamma(0.5e-100, 1e9);
            expect(z).toEqualFloatingPointBinary(999326397.98956001);
        });
    });
    describe('with fixtures', () => {
        it('0 < p < 1, various shape={9}, lower={false,true}, log={false,true}', async () => {
            const [p,y1, y2] = await loadData(
                resolve(
                    __dirname,
                    'fixture-generation',
                    'qgamma1.R'
                ),
                /\s+/,
                1, /*y1*/2, 3, 4
            );
            const a1 = p.map(_p => qgamma(_p, 9));
            expect(a1).toEqualFloatingPointBinary(y1, 45);

            const a2 = p.map(_p => qgamma(_p, 9, undefined, undefined, false));
            expect(a2).toEqualFloatingPointBinary(y2, 45);

            const a3 = p.map(_p => qgamma(Math.log(_p), 9, undefined, undefined, false, true));
            expect(a3).toEqualFloatingPointBinary(y2, 45);
        });
    });
});