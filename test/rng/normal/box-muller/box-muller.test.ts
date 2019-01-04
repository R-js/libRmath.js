import { expect } from 'chai';
import { BoxMuller } from '../../../../src/lib/rng/normal/box-muller'
import { MersenneTwister } from '../../../../src/lib/rng/mersenne-twister'
import { forcePrecision } from '../../../../src/lib/r-func'
import { fixtureFromR } from './fixture'




const _fp = forcePrecision(15)

describe('rng box-muller', function () {
    it('rng underlying mersenne-twister, seed=1234, skip=100, sample=50', () => {
        const mt = new MersenneTwister(0);
        const bm = new BoxMuller(mt);
        mt.init(1234)
        bm.norm_rand(100)
        const sample = bm.norm_rand(50)
        const state = bm.rng.seed
        expect(_fp(sample)).to.deep.equal(_fp(fixtureFromR.case0.sample))
        expect(_fp(state)).to.deep.equal(_fp(fixtureFromR.case0.state))
    })
    it('rng underlying default, seed=0, skip=0, sample=5', () => {
        const bm = new BoxMuller();
        const sample = bm.norm_rand(5)
        //console.log(sample)
        expect(_fp(sample)).to.deep.equal(_fp(fixtureFromR.case1.sample))
        //expect(_fp(state)).to.deep.equal(_fp(fixtureFromR.case0.state))
    })


})
