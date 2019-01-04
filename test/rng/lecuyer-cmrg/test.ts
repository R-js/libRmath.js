import { expect } from 'chai';
import { LecuyerCMRG } from '../../../src/lib/rng/lecuyer-cmrg';
import { forcePrecision } from '../../../src/lib/r-func';

const _fp = forcePrecision(15)

describe('rng lecuyer-cmrg', function () {
    const lcmrg = new LecuyerCMRG();
    it('for seed=0, skip=1E+5, check state', () => {
        lcmrg.init(0);
        for (let i = 0; i < 1E+5; i++) {
            lcmrg.internal_unif_rand()
        }
        const state = lcmrg.seed.slice() //copy
        const next = lcmrg.internal_unif_rand()
        //console.log(state)
        expect(state).to.deep.equal([1260302101, -289449848, -1749289494,
            739660930, -661908428, 1799777928])
        lcmrg.init(1234)
        lcmrg.seed = state
        const next2 = lcmrg.internal_unif_rand()
        
        // next and next2 should be the same
        expect(next).to.equal(next2)
        expect(_fp(next)).to.equal(_fp(0.033360347370373147))
    })
    it('setting an invalid state size create new seed state',()=>{
        const lcmrg = new LecuyerCMRG();
        lcmrg.init()
        const size = lcmrg.seed.length
        lcmrg.seed = [] // nonsense state
        expect(size).to.equal(lcmrg.seed.length)
    })
    // intercept timeseed in this


})