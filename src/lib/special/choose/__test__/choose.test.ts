import {
    cl,
    select
} from '@common/debug-select';

const chooseDomainWarns = select('choose')("argument out of domain in '%s'");
chooseDomainWarns;

//app
import { choose } from '..';

describe('combinatorics (choose)', function () {
    describe('invalid input and edge cases', () => {
        beforeEach(() => {
            cl.clear('choose');
        });
        it('a = NaN|b = NaN', async () => {
            const nan1 = choose(NaN, 5);
            const nan2 = choose(4, NaN);
            expect([nan1,nan2]).toEqualFloatingPointBinary(NaN);
        });
    });
    describe('fidelity', () => {
        //
    });
});