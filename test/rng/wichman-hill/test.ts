import { expect } from 'chai';
import { WichmannHill } from '../../../src/lib/rng/wichmann-hill';
import { forcePrecision } from '../../../src/lib/r-func';
import { fixture } from './fixture'

const _fp = forcePrecision(15)

describe('rng wichman-hill', function () {
    
    it('for seed=0, compare 50 samples, compare state', () => {
        const wh = new WichmannHill(0);
        const sample = wh.unif_rand(50);
        const state = wh.seed
        expect(_fp(sample)).to.deep.equal(_fp(fixture.case0.sample))
        expect(state).to.deep.equal(fixture.case0.state)
    })
    it('for seed=default, set state and compare 10 samples', () => {
        const wh = new WichmannHill()
        wh.init()
        wh.seed = fixture.case1.state
        const sample = wh.unif_rand(10);
        expect(_fp(sample)).to.deep.equal(_fp(fixture.case1.sample))
    })
    it('for seed=default, set state to [0,0,0] fetch 10 samples', () => {
        const sd = new WichmannHill()
        sd.init()
        sd.seed = fixture.case2.state
        const sample = sd.unif_rand(10)
        expect(_fp(sample)).to.deep.equal(_fp(fixture.case2.sample))
    })

})