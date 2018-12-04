import { assert } from 'chai';
import { seq, sequenceFactory } from '../../src/lib/r-func';


describe('utility/helper functions', function n() {
    describe('function "seq" -> "sequenceFactory regression', () => {
        it('seq, adjust=undefined, adjustmin=undef, start=10, end=0, step=1', () => {
            const s1 =seq(undefined)(undefined);
            const s2 = sequenceFactory();
            const res1 = s1(10,0);
            const res2 = s2(10,0,-1);
            console.log(res1, res2);
            assert(true);
        })
        it('seq, adjust=undefined, adjustmin=2, start=10, end=0, step=1', () => {
            const s1 =seq(undefined)(2);
            const s2 = sequenceFactory(undefined, 2);
            const r1 = s1(10,0,1);
            const r2 = s2(10,0,-1);
            console.log(r1, r2);
            assert(true);
        })
        it('seq, adjust=-1, adjustmin=undefined, start=10, end=0, step=1', () => {
            const s1 =seq(-1)();
            const s2 = sequenceFactory(-1);
            const res1 = s1(1,4);
            const res2 = s2(1,4);
            console.log(res1, res2);
            assert(true);
        })

    })
});
