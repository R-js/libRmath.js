import { KnuthTAOCP2002 } from '../../../src/lib/rng/knuth-taocp-2002';
import {
    fixtureSeed0,
    seedStateAfter500FetchedInit1234,
    seedStateAfter20FetchesInit654321
} from './fixture';

//import { forcePrecision } from '../../../src/lib/r-func';

//const _10 = forcePrecision(10)

describe('rng knuth-taocp-2002', function n() {
    it('for seed=0, n=100', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init(0);
        const result = knuth2002.randoms(100);
        expect(result).toEqual(new Float32Array(fixtureSeed0));
    })
    xit('get internal state after 500 samples, seed=1234', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init(1234);
        knuth2002.randoms(500);
        const result = knuth2002.seed;
        expect(result).toEqual(seedStateAfter500FetchedInit1234);

    })
    xit('for seed=654321 -> set seed from external state -> sample 10 numbers', () => {
        const knuth2002 = new KnuthTAOCP2002(654321);
        knuth2002.randoms(20);
        const result = knuth2002.seed;
        expect(result).toEqual(seedStateAfter20FetchesInit654321);
    })
    xit('init() resets the state to random values', () => {
        const knuth2002 = new KnuthTAOCP2002(1234);
        const seed1 = knuth2002.seed
        knuth2002.init()
        const seed2 = knuth2002.seed
        expect(seed1.length).toEqual(seed2.length)
        expect(seed2).toEqual(seed1)
    })
    xit('set the state, generates predictable seq of values afterwards', () => {
        const knuth2002 = new KnuthTAOCP2002(1234);
        const seed = knuth2002.seed
        const var1 = knuth2002.random()
        knuth2002.randoms(100)
        knuth2002.seed = seed
        const var2 = knuth2002.random()
        expect(var1).toEqual(var2)
    })
})