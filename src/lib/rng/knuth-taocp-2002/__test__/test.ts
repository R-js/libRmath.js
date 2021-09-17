import { KnuthTAOCP2002 } from '../../index.js';
import { fixtureSeed0, seedStateAfter500FetchedInit1234, seedStateAfter20FetchesInit654321 } from './fixture.js';


describe('rng knuth-taocp-2002', function n() {
    it('for seed=0, n=100', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init(0);
        const result = knuth2002.randoms(100);
        const expected = fixtureSeed0;
        expect(result).toEqualFloatingPointBinary(expected, 22);
    });
    it('get internal state after 500 samples, seed=1234', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init(1234);
        knuth2002.randoms(500);
        const result = knuth2002.seed;
        const expected = seedStateAfter500FetchedInit1234;
        for (let i = 0; i < result.length; i++) {
            expect(`${i}:${result[i]}`).toBe(`${i}:${expected[i]}`);
        }
    });
    it('for seed=654321 -> set seed from external state -> sample 20 numbers', () => {
        const knuth2002 = new KnuthTAOCP2002(654321);
        knuth2002.randoms(20);
        const result = knuth2002.seed;
        expect(result).toEqual(new Uint32Array(seedStateAfter20FetchesInit654321));
    });
    it('init() resets the state to random values', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init();
        const seed1 = knuth2002.seed.slice();
        knuth2002.init();
        const seed2 = knuth2002.seed.slice();
        expect(seed1.length).toBe(seed2.length);
        expect(seed2).not.toEqual(seed1);
    });
    it('set the state, generates predictable seq of values afterwards', () => {
        const knuth2002 = new KnuthTAOCP2002(1234);
        const seed = knuth2002.seed.slice();
        const var1 = knuth2002.random();
        knuth2002.randoms(100);
        knuth2002.seed = seed;
        const var2 = knuth2002.random();
        expect(var1).toEqual(var2);
    });
});
