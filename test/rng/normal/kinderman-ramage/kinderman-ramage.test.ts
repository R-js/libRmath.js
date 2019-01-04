import { expect } from 'chai'
import { KindermanRamage } from '../../../../src/lib/rng/normal/kinderman-ramage'
import { LecuyerCMRG } from '../../../../src/lib/rng/lecuyer-cmrg'
import { forcePrecision } from '../../../../src/lib/r-func'
import { fixtureFromR } from './fixture'

const _fp = forcePrecision(15)


describe('rng buggy kinerman ramage', function () {
    it('rng underlying mersenne-twister, seed=1234, skip=100, sample=50', () => {
        const kr = new KindermanRamage(new LecuyerCMRG(0))
        kr.rng.init(1234)
        kr.norm_rand(1E5)
        const sample = kr.norm_rand(50)
        const state = kr.rng.seed
        expect(_fp(sample)).to.deep.equal(_fp(fixtureFromR.case0.sample))
        expect(state).to.deep.equal(fixtureFromR.case0.state)
    })
    it('rng underlying default, seed=0, skip=0, sample=5', () => {
        const kr = new KindermanRamage()
        const sample = kr.norm_rand(5)
        expect(_fp(sample)).to.deep.equal(_fp(fixtureFromR.case1.sample))
    })
})