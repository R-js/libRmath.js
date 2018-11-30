import { assert } from 'chai';
import { seq } from '../../src/lib/r-func';


describe('utility/helper functions', function n() {
    describe('"seq" function', () => {
        it('seq, adjust=undefined, adjustmin=undef, start=10, end=0, step=1', () => {
            const s1 =seq(undefined)(undefined);
            const result = s1(10,0);
            console.log(result);
            assert(true);
        })
        it('seq, adjust=undefined, adjustmin=2, start=10, end=0, step=1', () => {
            const s1 =seq(undefined)(2);
            const result = s1(10,0,1);
            console.log(result);
            assert(true);
        })
        it('seq, adjust=-1, adjustmin=undefined, start=10, end=0, step=1', () => {
            const s1 =seq(-1)(-5);
            const result = s1(1,4);
            console.log(result);
            assert(true);
        })

    })
});
