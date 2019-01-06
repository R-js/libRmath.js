import { expect } from 'chai';
import { MersenneTwister } from '../../../src/lib/rng/mersenne-twister';
import { forcePrecision } from '../../../src/lib/r-func';
import { fixture } from './fixture'

const _fp = forcePrecision(15)

describe('rng mersenne-twister', function () {
    
    it('for seed=0, compare 1300 samples', () => {
        const mt = new MersenneTwister(0);
        const sample = mt.unif_rand(1300);
        expect(_fp(sample)).to.deep.equal(_fp(fixture.case0.sample))
    })

    it('for default seed, set state to and compare 4 samples', () => {
        const mt = new MersenneTwister()
        mt.init()
        mt.seed = fixture.case1.alterededState;
        const sample = mt.unif_rand(4)
        expect(_fp(sample)).to.deep.equal(_fp(fixture.case1.sample))
    })
    
})