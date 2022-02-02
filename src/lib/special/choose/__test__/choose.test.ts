import {
    cl,
    select
} from '@common/debug-select';

const chooseDomainWarns = select('choose')("argument out of domain in '%s'");
chooseDomainWarns;
const chooseIntegerWarns = select('choose')('k (%d) must be integer, rounded to %d');

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
            expect([nan1, nan2]).toEqualFloatingPointBinary(NaN);
        });
        it('warning if int(k)-k > 1e-7', () => {
            expect(choose(5, 4 - 1e-7 * 2)).toBe(5);
            expect(chooseIntegerWarns()).toHaveLength(1);
        });
        it('k < 0', () => {
            expect(choose(5, -1)).toBe(0);
        });
    });
    describe('fidelity', () => {
        //
    });
});