import { resolve } from 'path';

//helper
import { loadData } from '@common/load';
import { cl, select } from '@common/debug-select.js';

const dbinomDomainWarns = select('dbinom')("argument out of domain in '%s'");
dbinomDomainWarns;

//app

import { dbinom } from '../index.js';

describe('dbinom', function () {
    beforeEach(()=>{
        cl.clear('dbinom');
    });
    it.todo('check unhappy path with ME warnings');
    it('ranges x ∊ [0, 12] size=12, prob=0.01', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'dbinom1.R'), /\s+/, 1, 2);
        const actual = x.map(_x => dbinom(_x, 12, 0.01));
        expect(actual).toEqualFloatingPointBinary(y, 50)
    });
    it('x=0, size=12, prob=0, asLog=true|false', () => {
        const z0 = dbinom(0, 12, 0, true);
        expect(z0).toBe(0); //log(1) //
        const z1 = dbinom(0, 12, 0);
        expect(z1).toBe(1);
    });
    it('x=4 (x!=0 || x!=12), size=12, prob=0, asLog=true|false', () => {
        const z0 = dbinom(4, 12, 0, true);
        expect(z0).toBe(-Infinity); //log(0) //
        const z1 = dbinom(4, 12, 0);
        expect(z1).toBe(0);
    });
    it('x=12, size=12, prob=0, asLog=true|false', () => {
        const z0 = dbinom(12, 12, 1, true); // 100%, you always score "head", never "tail"
        expect(z0).toBe(0);
        const z1 = dbinom(12, 12, 1);
        expect(z1).toBe(1);
    });
    it('x=8, size=12, prob=0, asLog=true|false', () => {
        const z0 = dbinom(8, 12, 1, true); // 100%, you always score "head", never "tail"
        expect(z0).toBe(-Infinity);
        const z1 = dbinom(8, 12, 1);
        expect(z1).toBe(0);
    });
    it('x=0, size=0, prob=0.2, asLog=true|false', () => {
        const z0 = dbinom(0, 0, 0.2, true); // 100%, you always score "head", never "tail"
        expect(z0).toBe(0);
        const z1 = dbinom(0, 0, 0.2);
        expect(z1).toBe(1);
    });
    it('x=0, size=100, prob=0.99, asLog=true', () => {
        const z0 = dbinom(0, 100, 0.99, true); // 100%, you always score "head", never "tail"
        expect(z0).toEqualFloatingPointBinary(-460.517018598809);
    });
    it('x=100, size=100, prob=0.99, asLog=true', () => {
        const z0 = dbinom(100, 100, 0.99, true); // 100%, you always score "head", never "tail"
        expect(z0).toEqualFloatingPointBinary(-1.0050335853501451);
    });
    it('x=-1|x=101, size=100, prob=0.99', () => {
        const z0 = dbinom(-1, 100, 0.99); // 100%, you always score "head", never "tail"
        expect(z0).toBe(0);
        const z2 = dbinom(101, 100, 0.99); // 100%, you always score "head", never "tail"
        expect(z2).toBe(0);
    });
    it('x=4, size=100, prob=3 (>1)', () => {
        const dest = cl.getDestination();
        const z0 = dbinom(4, 100, 3); // 100%, you always score "head", never "tail"
        expect(z0).toBeNaN();
        expect(dest.length).toBe(1);
    });
    it('x=4, size=NaN, prob=0.5', () => {
        const z0 = dbinom(4, NaN, 0.5); // 100%, you always score "head", never "tail"
        expect(z0).toBeNaN();
    });
    it('x=4.4 (nonint), size=100, prob=0.5', () => {
        const z0 = dbinom(4.4, 100, 0.5); // 100%, you always score "head", never "tail"
        expect(z0).toBe(0);
        const z1 = dbinom(4.4, 100, 0.5, true); // 100%, you always score "head", never "tail"
        expect(z1).toBe(-Infinity);
    });
});