//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';
import { pgamma } from '..';

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

const pgammaLogs = select('pgamma');
const pgammaDomainWarns = pgammaLogs("argument out of domain in '%s'");
pgammaDomainWarns;

describe('pgamma', function () {
    beforeEach(() => {
        cl.clear('pgamma');
    })
    it('x ∈ [-1,10], shape=5, scale=400 ,log=T|F', async () => {
        const [p, y1, y2] = await loadData(resolve(__dirname, 'fixture-generation', 'pgamma1.R'), /\s+/, 1, 2, 3);
        const a1 = p.map(_p => pgamma(_p, 5, undefined, 400));
        const a2 = p.map(_p => pgamma(_p, 5, undefined, 400, undefined, true));
        expect(a1).toEqualFloatingPointBinary(y1, 45);
        expect(a2).toEqualFloatingPointBinary(y2);
    });
    it('x ∈ [-1,10], shape=5, rate=2.5(scale=0.4) ,lowertail=T|F', async () => {
        const [p, y1, y2] = await loadData(resolve(__dirname, 'fixture-generation', 'pgamma2.R'), /\s+/, 1, 2, 3);
        const a1 = p.map(_p => pgamma(_p, 5, 2.5));
        const a2 = p.map(_p => pgamma(_p, 5, 2.5, undefined, false));
        expect(a1).toEqualFloatingPointBinary(y1, 45);
        expect(a2).toEqualFloatingPointBinary(y2, 45);
    });
    it('x =NaN, shape=1.6, defaults', () => {
        const z = pgamma(NaN, 1.6);
        expect(z).toBeNaN();
    });
    it('x =0, shape=-5(<0), defaults', () => {
        const nan = pgamma(0, -5);
        expect(nan).toBeNaN();
        expect(pgammaDomainWarns()).toHaveLength(1);
    });
    it('x =0|x=1, shape=0, defaults', () => {
        const z1 = pgamma(0, 0);
        expect(z1).toBe(0);
        const z2 = pgamma(1,0);
        expect(z2).toBe(1);
    });
    it('x ∈ [0,1], shape=3, defaults', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'pgamma3.R'), /\s+/, 1, 2);
        const a1 = p.map(_p => pgamma(_p, 3));
        expect(a1).toEqualFloatingPointBinary(y1, 45);
    });
    it('x ∈ [48,52] (around shape value)  shape=50, scale=25, defaults', async () => {
      
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'pgamma4.R'), /\s+/, 1, 2);
        const a1 = p.map(_p => pgamma(_p, 50, undefined, 25));
        expect(a1).toEqualFloatingPointBinary(y1, 40);
    });
    it('x =3 shape=0.5, defaults', () => {
      
        pgamma(3,0.5);
        pgamma(3,1);
    });
    /*
    it('x = 4, shape=1.6, rate=2, scale=4, should throw error', () => {
        expect(() => dgamma(4, 1.6, 2, 2)).toThrowError("specify 'rate' or 'scale' but not both");
    });
    it('x= 4, shape=1.6, rate=undefined, scale=4', () => {
        const z = dgamma(4, 1.6, undefined, 4);
        expect(z).toEqualFloatingPointBinary(0.10293036416909783);
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
    it('x=0, shape=1, scale=100', () => {
        const z = dgamma(0, 1, undefined, 100);
        expect(z).toEqualFloatingPointBinary(1 / 100);
    });
    it('x=0, shape=1, scale=100, aslog=true', () => {
        const z = dgamma(0, 1, undefined, 100, true);
        expect(z).toEqualFloatingPointBinary(Math.log(1 / 100), 50);
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
 
 
  */
});