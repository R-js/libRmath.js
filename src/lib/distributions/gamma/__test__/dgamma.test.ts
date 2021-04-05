//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';
import { dgamma } from '..';

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

const dgammaLogs = select('dgamma');
const dgammaDomainWarns = dgammaLogs("argument out of domain in '%s'");

describe('dgamma', function () {
    describe('invalid input', () => {
        beforeEach(() => {
            cl.clear('dgamma');
        });
        it('x=NaN, shape=0', () => {
            const nan = dgamma(NaN, 0);
            expect(nan).toBe(NaN);
        });
        it('x=4, shape=-1(<0)', () => {
            const nan = dgamma(4, -1);
            expect(nan).toBe(NaN);
            expect(dgammaDomainWarns()).toHaveLength(1);
        });
    });

    describe('edge cases', () => {
        it('x=4, shape=0', () => {
            const z = dgamma(4, 0);
            expect(z).toBe(0);
        });
        it('x=0, shape=0', () => {
            const z = dgamma(0, 0);
            expect(z).toBe(Infinity);
        });
        it('x=0, shape=(0,1)', () => {
            const z = dgamma(0, 0.5);
            expect(z).toBe(Infinity);
        });
        it('x=0, shape=(1,inf)', () => {
            const z = dgamma(0, 1.5);
            expect(z).toBe(0);
        });
    });

    describe('fixture-tests', () => {
        it('x ∈ [-2,2], shape=1.6, rate=1.5', async () => {
            const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'dgamma.R'), /\s+/, 1, 2);
            const a1 = p.map(_p => dgamma(_p, 1.6, 1.5));
            expect(a1).toEqualFloatingPointBinary(y1);
        });
        it('x ∈ [1,5], shape=0.1, scale=4', async () => {
            const [x, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'dgamma2.R'), /\s+/, 1, 2);
            const z = x.map(_x => dgamma(_x, 0.1, undefined, 4, false));
            expect(z).toEqualFloatingPointBinary(y1, 47);
        });
        it('x ∈ [1,5], shape=0.1, scale=4, log=true', async () => {
            const [x, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'dgamma3.R'), /\s+/, 1, 2);
            const z = x.map(_x => dgamma(_x, 0.1, undefined, 4, true));
            expect(z).toEqualFloatingPointBinary(y1, 49);
        });
        it('x ∈ [1,5], shape=5, scale=400, log=true', async () => {
            const [x, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'dgamma4.R'), /\s+/, 1, 2);
            const z = x.map(_x => dgamma(_x, 5, undefined, 400, true));
            expect(z).toEqualFloatingPointBinary(y1);
        });
    });
    describe('other', () => {
        it('x = 4, shape=1.6, rate=undefined, scale=undefined', () => {
            const z = dgamma(4, 1.6);
            expect(z).toEqualFloatingPointBinary(0.047092966626664144);
        });
        it('x = 4, shape=1.6, rate=2, scale=4, should throw error', () => {
            expect(() => dgamma(4, 1.6, 2, 2)).toThrowError("specify 'rate' or 'scale' but not both");
        });
        it('x= 4, shape=1.6, rate=undefined, scale=4', () => {
            const z = dgamma(4, 1.6, undefined, 4);
            expect(z).toEqualFloatingPointBinary(0.10293036416909783);
        });

        it('x=0, shape=1, scale=100', () => {
            const z = dgamma(0, 1, undefined, 100);
            expect(z).toEqualFloatingPointBinary(1 / 100);
        });
        it('x=0, shape=1, scale=100, aslog=true', () => {
            const z = dgamma(0, 1, undefined, 100, true);
            expect(z).toEqualFloatingPointBinary(Math.log(1 / 100), 50);
        });
    });

});