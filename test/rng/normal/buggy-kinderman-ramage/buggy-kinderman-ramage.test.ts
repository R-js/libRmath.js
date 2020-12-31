import { expect } from 'chai';
import { BuggyKindermanRamage } from '../../../../src/lib/rng/normal/buggy-kinderman-ramage';
import { MersenneTwister } from '../../../../src/lib/rng/mersenne-twister';
import { forcePrecision } from '../../../../src/lib/r-func';
import { fixtureFromR } from './fixture';

// Possible to arbitraty uniform PRNG source (example: SuperDuper)

const _fp = forcePrecision(15);

describe('rng buggy kinerman ramage', function () {
    it('rng underlying mersenne-twister, seed=1234, skip=100, sample=50', () => {
        const bkr = new BuggyKindermanRamage(new MersenneTwister(0));
        bkr.rng.init(1234);
        bkr.norm_rand(1e5);
        const sample = bkr.norm_rand(50);
        const state = bkr.rng.seed;
        //console.log(sample)
        //console.log({ state })
        expect(_fp(sample)).to.deep.equal(_fp(fixtureFromR.case0.sample));
        expect(state).to.deep.equal(fixtureFromR.case0.state);
    });
    it('rng underlying default, seed=0, skip=0, sample=50', () => {
        const bkr = new BuggyKindermanRamage();
        const sample = bkr.norm_rand(5);
        expect(_fp(sample)).to.deep.equal(_fp(fixtureFromR.case1.sample));
    });
});
