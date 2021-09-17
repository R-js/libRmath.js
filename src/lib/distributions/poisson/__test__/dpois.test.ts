//helper
import '$jest-extension';
import '$mock-of-debug';// for the side effects
import { loadData } from '$test-helpers/load';
import { resolve } from 'path';
import { dpois } from '..';
import { DBL_MIN } from 'lib/common/constants';

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

const dpoisLogs = select('dpois');
const dpoisDomainWarns = dpoisLogs("argument out of domain in '%s'");
const dpoisNonInt = dpoisLogs('non-integer x = %d')


describe('dpois', function () {
    beforeEach(() => {
        cl.clear('dpois');
    })
    it('x ∈ [-1,10], lambda=2', async () => {
        const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'dpois.R'), /\s+/, 1, 2);
        const a1 = p.map(_p => dpois(_p, 2));
        expect(a1).toEqualFloatingPointBinary(y1, 51);
    });
    it('x = NaN, lamda=5', () => {
         const nan = dpois(NaN, 5);
         expect(nan).toBeNaN();
     });
     it('x = 4, lamda=-5(<0)', () => {
        const nan = dpois(4, -5);
        expect(nan).toBeNaN();
        expect(dpoisDomainWarns()).toHaveLength(1);
     });
     it('x = 4.2 (non integer), lamda=5(<0)', () => {
        const nan = dpois(4.2, 5);
        expect(nan).toBe(0);
        expect(dpoisNonInt()).toHaveLength(1);
     });
     it('x = 4,0, lamda=0', () => {
        const z = dpois(4, 0);
        expect(z).toBe(0);
        const z1 = dpois(0, 0);
        expect(z1).toBe(1);
     });
     it('x = 4, lamda=Infinity', () => {
        const z = dpois(4, Infinity);
        expect(z).toBe(0);
     });
     it('x=-4(<0), lamda=3', () => {
        const z = dpois(-4, 3);
        expect(z).toBe(0);
     });
     it('lambda < x$ DBL_MIN',()=>{
        const z = dpois(400, DBL_MIN*4*0.7);
        console.log(z);
        //expect(z).toBe(0);

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
     it('x ∈ [1,2], shape=0.1, scale=100, aslog=true', async () => {
         //const [p, y1] = await loadData(resolve(__dirname, 'fixture-generation', 'dgamma2.R'), /\s+/, 1, 2);
         //const z = p.map(_p => dgamma(_p, 1, undefined, 100, false));
         const z = dgamma(1, 10, undefined, 10, false);
         console.log(z);
         //expect(z).toEqualFloatingPointBinary(y1);
     });
 
 
     /*
     it('x=1, df1=-1(<0), df2=4', () => {
         const nan = df(1, -2, 4);
         expect(nan).toBeNaN();
         expect(dfDomainWarns()).toHaveLength(1);
     });
     it('x=0, df1=3(>2), df2=4', () => {
         const z = df(0, 3, 4);
         expect(z).toBe(0);
     });
     it('x=0, df1=2, df2=4', () => {
         const z = df(0, 2, 4);
         expect(z).toBe(1);
     });
     it('x=0, df1=1, df2=4', () => {
         const z = df(0, 1, 4);
         expect(z).toBe(Infinity);
     });
     it('x=4, df1=inf, df2=inf', () => {
         const z = df(4, Infinity, Infinity);
         expect(z).toBe(0);
     });
     it('x=1, df1=inf, df2=inf', () => {
         const z = df(1, Infinity, Infinity);
         expect(z).toBe(Infinity);
     });
     it('x=1, df1=44, df2=inf', () => {
         const z = df(1, 44, Infinity);
         expect(z).toEqualFloatingPointBinary(1.8641311540557727877);
     });
     it('x=1, df1=1e15, df2=234', () => {
         const z = df(1, 1e15, 234);
         expect(z).toEqualFloatingPointBinary(4.3121481266847112579);
     });
     it('x=1, df1=1e15, df2=234, log=true', () => {
         const z = df(1, 1e15, 234, undefined, true);
         expect(z).toEqualFloatingPointBinary(1.4614361852162813804);
     });
     it('x=1, df1=1, df2=1', () => {
         const z = df(1, 1, 1);
         expect(z).toEqualFloatingPointBinary(0.15915494309189531785);
     });
     it('x=1, df1=1, df2=1, log=true', () => {
         const z = df(1, 1, 1, undefined, true);
         expect(z).toEqualFloatingPointBinary(-1.8378770664093455611);
     });*/
});