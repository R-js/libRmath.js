import { expect } from 'chai'
import { Inversion } from '../../../../src/lib/rng/normal/inversion'
import { WichmannHill } from '../../../../src/lib/rng/wichmann-hill'
import { forcePrecision } from '../../../../src/lib/r-func'
import { fixtureFromR } from './fixture'

const _fp = forcePrecision(15)

describe('normal rng "inversion"', function () {
    it('rng underlying whichman-hill, seed=1234, skip=100, sample=50', () => {
        const inv = new Inversion(new WichmannHill(0))
        inv.rng.init(1234)
        const sample = inv.norm_rand(50)
        const state = inv.rng.seed
        //console.log(state)
        expect(_fp(sample)).to.deep.equal(_fp(fixtureFromR.case0.sample))
        expect(state).to.deep.equal(fixtureFromR.case0.state)
    })
    it('rng underlying default, seed=0, skip=0, sample=50', () => {
        const inv = new Inversion()
        const sample = inv.norm_rand(5)
        expect(_fp(sample)).to.deep.equal(_fp(fixtureFromR.case1.sample))
    })
})
