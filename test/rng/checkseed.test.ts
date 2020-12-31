import { expect } from 'chai';
import { seedCheck } from '../../src/lib/rng/seedcheck';
import { forcePrecision } from '../../src/lib/r-func';
import { IRNGType } from '../../src/lib/rng/irng-type';


describe('test "seedCheck" assert function using label "KNUTH_TAOCP"', function () {
    it('set non array value for seed, throws error', () => {
        const fnThrow = () => seedCheck(IRNGType.KNUTH_TAOCP, <any>"nonsense data", 4)
        expect(fnThrow).to.throw('the seed is not of type Array for rng:KNUTH_TAOCP') 
    })
    it('set a seed of non integer items, throws error', () => {
        const seed = Array.from({length:101}).fill("a")
        const fnThrow = () => seedCheck(IRNGType.KNUTH_TAOCP, <any>seed, 101)
        expect(fnThrow).to.throw(`KNUTH_TAOCP: some seed items were not of type "integer": ${JSON.stringify(seed)}`) 
    })
    it('set a seed of improper size, throws error', () => {
        const seed = [1,2,3]
        const fnThrow = () => seedCheck(IRNGType.KNUTH_TAOCP, seed, 101)
        expect(fnThrow).to.throw(`the seed is not an array of proper size for rng KNUTH_TAOCP`) 
    })
})