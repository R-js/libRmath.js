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
    const knuth2002 = new KnuthTAOCP2002();
    it('knuth taocp-2002 for seed=0, n=100', () => {
        knuth2002.init(0);
        const result = knuth2002.unif_rand(100);
        expect(_10(result)).to.deep.equal(_10(fixtureSeed0));
    })
    it('knuth taocp-2002 get internal state after 500 samples, seed=1234', () => {
        knuth2002.init(1234);
        knuth2002.unif_rand(500);
        const result = knuth2002.seed;
        expect(result).to.deep.equal(seedStateAfter500FetchedInit1234);

    })
    it('knuth taocp-2002 for seed=654321 -> set seed from external state -> sample 10 numbers', () => {
        knuth2002.init(654321);
        knuth2002.unif_rand(20);
        const result = knuth2002.seed;
        expect(result).to.deep.equal(seedStateAfter20FetchesInit654321);
    })

})