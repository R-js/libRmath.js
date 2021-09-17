import { resolve } from 'path';

//helper
import { loadData } from '@common/load';
import { cl, select } from '@common/debug-select.js';

const pbinomDomainWarns = select('pbinom')("argument out of domain in '%s'");
pbinomDomainWarns;

//app
import { pbinom } from '../index.js';

describe('pbinom', function () {
    beforeEach(() => {
        cl.clear('pbinom');
    });
    it.todo('trigger ME warnings');
    it('ranges x ∊ [0, 12] size=12, prob=0.01', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pbinom1.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pbinom(_x, 12, 0.02));
        expect(actual).toEqualFloatingPointBinary(y, 34)
    });
    it('x = NaN, size=NaN, prob=0.01', () => {
        const actual = pbinom(NaN, NaN, 0.01);
        expect(actual).toBeNaN();
    });
    it('x = 5, size=Infinity, prob=0.01', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = pbinom(5, Infinity, 0.01);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
        //console.log(dest);
    });
    it('x=0, size=12, prob=0, asLog=true|false', () => {
        const actual = pbinom(-5, 10, 0.01);
        expect(actual).toBe(0);
    });
    
    it('x = 5, size=Infinity, prob=0.01', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = pbinom(5, 7.2, 0.01);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
        //console.log(dest);
    });
    it('x = 5, size=Infinity, prob=0.01', () => {
        const dest: string[] = [];
        cl.setDestination(dest);
        const actual = pbinom(5, -7, 0.01);
        expect(actual).toBeNaN();
        expect(dest.length).toBe(1);
        //console.log(dest);
    });
});