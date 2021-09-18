// node
import { resolve } from 'path';

//helper
import { loadData } from '@common/load';
import { cl, select } from '@common/debug-select';

const pnbeta2DomainWarns = select('pnbeta2')("argument out of domain in '%s'");
const pnbetaRawDomainWarns = select('pnbeta_raw')("argument out of domain in '%s'");
pnbeta2DomainWarns;
pnbetaRawDomainWarns;

//app
import { pbeta } from '..';

describe('pbeta, ncp != undefined', function () {
    beforeEach(()=>{
        cl.clear('pnbeta2');
        cl.clear('pnbeta_raw');
    });
    it('ranges x ∊ [0, 1], shape1=3, shape2=3, ncp=2', async () => {
        /* load data from fixture */
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pnbeta.R'), /\s+/, 1, 2);
        const actual = x.map(_x => pbeta(_x, 3, 3, 0.5, true));
        expect(actual).toEqualFloatingPointBinary(y, 40);
    });
    it('x = NaN, shape1=3, shape2=3, ncp=2',  () => {
        const actual = pbeta(NaN, 3, 3, 0.5, true);
        expect(actual).toBe(NaN);
    });
    it('x = 0.5, shape1=3, shape2=3, ncp=0.5, lowerTail=true, log=true',  () => {
        const actual = pbeta(0.5, 3, 3, 0.5, true, true);
        expect(actual).toEqualFloatingPointBinary(-0.77187133575811151, 49);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=0.5, lowerTail=false, log=false',  () => {
        const actual = pbeta(0.5, 3, 3, 0.5, false, false);
        expect(actual).toEqualFloatingPointBinary(0.53785257439328626);
    });
    it('ranges x = 0.5, shape1=3, shape2=3, ncp=0.5, lowerTail=false, log=true',  () => {
        const actual = pbeta(0.5, 3, 3, 0.5, false, true);
        expect(actual).toEqualFloatingPointBinary(-0.62017078166343242, 40);
    });
    it('ranges x = 1.5, shape1=3, shape2=3, ncp=0.5, lowerTail=true, log=false',  () => {
        const actual = pbeta(1.5, 3, 3, 0.5, true, false);
        expect(actual).toEqualFloatingPointBinary(1);
    });
    it.todo('ranges x = 0.5, shape1=3, shape2=3, ncp=-2, lowerTail=true, log=false',  () => {
        const actual = pbeta(0.5, 3, 3, -2, true, false);
        expect(actual).toBeNaN()
        //expect(ml_err_return_nan.length).toBe(1);
        //ml_err_return_nan.splice(0);
    });
    it('ranges x = 0, shape1=3, shape2=3, ncp=2, lowerTail=true, log=false',  () => {
        const actual = pbeta(0, 3, 3, 2, true, false);
        expect(actual).toBe(0);
    });
    it('ranges x = 1-1e-16, shape1=4.2, shape2=4.5, ncp=0.1, lowerTail=false, log=false',  () => {
        const actual = pbeta(1 - 1e-16, 4.2, 4.5, 0.1, false, false);
        expect(actual).toEqualFloatingPointBinary(2.0791366512565995e-11, 13);
    });
});