import { expect } from 'chai';
import { WichmannHill } from '../../../src/lib/rng/wichmann-hill';
import { forcePrecision } from '../../../src/lib/r-func';
import { fixture } from './fixture'

const _fp = forcePrecision(15)

describe('rng wichman-hill', function () {
    
    it('for seed=0, compare 50 samples', () => {
        const sd = new WichmannHill(0);
        const sample = sd.unif_rand(50);
        //console.log(sample)
        //expect(_fp(sample)).to.deep.equal(_fp(fixture.case0.sample))
    })
    it('for seed=default, set state and compare 10 samples', () => {
        const sd = new WichmannHill()
        sd.init()
        //sd.seed = fixture.case1.state
        //const sample = sd.unif_rand(10);
        //expect(_fp(sample)).to.deep.equal(_fp(fixture.case1.sample))
    })
    it.skip('for seed=default, set state to [0,0] fetch 9 samples', () => {
        const sd = new WichmannHill()
        sd.init()
        sd.seed = [0,0]
        const sample = sd.unif_rand(10);
        console.log(sample)
        //expect(_fp(sample)).to.deep.equal(_fp(fixture.case1.sample))
    })

})