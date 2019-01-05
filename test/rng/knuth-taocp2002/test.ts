import { expect } from 'chai';
import { KnuthTAOCP2002 } from '../../../src/lib/rng/knuth-taocp-2002';
import {
    fixtureSeed0,
    seedStateAfter500FetchedInit1234,
    seedStateAfter20FetchesInit654321
} from './fixture';

import { forcePrecision } from '../../../src/lib/r-func';

const _10 = forcePrecision(10)

describe('rng knuth-taocp-2002', function n() {
    it('for seed=0, n=100', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init(0);
        const result = knuth2002.unif_rand(100);
        expect(_10(result)).to.deep.equal(_10(fixtureSeed0));
    })
    it('get internal state after 500 samples, seed=1234', () => {
        const knuth2002 = new KnuthTAOCP2002();
        knuth2002.init(1234);
        knuth2002.unif_rand(500);
        const result = knuth2002.seed;
        expect(result).to.deep.equal(seedStateAfter500FetchedInit1234);

    })
    it('for seed=654321 -> set seed from external state -> sample 10 numbers', () => {
        const knuth2002 = new KnuthTAOCP2002(654321);
        knuth2002.unif_rand(20);
        const result = knuth2002.seed;
        expect(result).to.deep.equal(seedStateAfter20FetchesInit654321);
    })
    it('init() resets the state to random values', () => {
        const knuth2002 = new KnuthTAOCP2002(1234);
        const seed1 = knuth2002.seed
        knuth2002.init()
        const seed2 = knuth2002.seed
        expect(seed1.length).to.equal(seed2.length)
        expect(seed2).to.not.deep.equal(seed1)
    })
    it('set the state, generates predictable seq of values afterwards', () => {
        const knuth2002 = new KnuthTAOCP2002(1234);
        const seed = knuth2002.seed
        const var1 = knuth2002.internal_unif_rand()
        knuth2002.unif_rand(100)
        knuth2002.seed = seed
        const var2 = knuth2002.internal_unif_rand()
        expect(var1).to.equal(var2)
    })
})