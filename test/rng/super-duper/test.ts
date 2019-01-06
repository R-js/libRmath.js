import { expect } from 'chai';
import { SuperDuper } from '../../../src/lib/rng/super-duper';
import { forcePrecision } from '../../../src/lib/r-func';
import { fixture } from './fixture'

const _fp = forcePrecision(15)

describe('rng super-duper', function () {
    //
    it.skip('for seed=0, compare 50 samples', () => {
        const sd = new SuperDuper(0);
        const sample = sd.unif_rand(50);
        expect(_fp(sample)).to.deep.equal(_fp(fixture.case0.sample))
    })
    //
    it.skip('for seed=default, set state and compare 10 samples', () => {
        const sd = new SuperDuper()
        sd.init()
        sd.seed = fixture.case1.state
        const sample = sd.unif_rand(10);
        expect(_fp(sample)).to.deep.equal(_fp(fixture.case1.sample))
    })
    //
    it('for seed=default, set state and compare 10 samples', () => {
        const sd = new SuperDuper()
        sd.init()
        sd.seed = [0, 0]
        /**how this was generated in R, version 3.3.3 
         * 
          RNGKind("Sup","Inv")
          .Random.seed = as.integer(c(402,0,0))
          rnorm(1) // have to do this because of an error in Rnmath!!
          runif(8) -> actual data for the fixture
          * 
        */
        const Rfixture = [
            0.6518204064694745,
            0.4149448127520607,
            0.7311703145343740,
            0.9555899009470802,
            0.3643265143885105,
            0.5889343695223643,
            0.2891133083703725,
            0.2723839465231597
        ]
        sd.unif_rand(2) // bleed the 2 samples needed for R rnorm(1)
        const sample = sd.unif_rand(8)
        const _fp2 = forcePrecision(14)
        //console.log(_fp2(sample))
        expect(_fp2(sample)).to.deep.equal(_fp2(Rfixture))
    })

})