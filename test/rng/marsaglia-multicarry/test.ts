import { expect } from 'chai';
import { MarsagliaMultiCarry } from '../../../src/lib/rng/marsaglia-multicarry';
import { forcePrecision } from '../../../src/lib/r-func';
import { fixture } from './fixture'

const _fp = forcePrecision(15)

describe('rng marsaglia-multicarry', function () {
   
    it('for seed=0, check sample=50, check state', () => {
        const mmc = new MarsagliaMultiCarry();
        mmc.init(0);
        const sample = mmc.unif_rand(50)
        const state = mmc.seed  //the getter returns a copy!
        expect(_fp(sample)).to.deep.equal(_fp(fixture.case0.sample))
        expect(state).to.deep.equal(fixture.case0.state)
    })
    it('should throw an error for invalid state assignment',()=>{
        const mmc = new MarsagliaMultiCarry()
        mmc.init()
        const fnThrow = () => mmc.seed = <any>[55, 'e']
        expect(fnThrow).to.throw('MARSAGLIA_MULTICARRY: some seed items were not of type "integer": ["e"]')
    })
    it('set the state to [0,0] and sample=5',()=>{
        const mmc = new MarsagliaMultiCarry(0)
        mmc.init()
        mmc.seed = [0,0]
        const sample = mmc.unif_rand(5)
    })
})