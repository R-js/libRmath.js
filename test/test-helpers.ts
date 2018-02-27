
import { assert, expect } from 'chai';

export function approximitly(act: number, exp: number) {
    switch (true) {
        case isNaN(act):
            assert.isNaN(exp);
            break;
        case isFinite(act):
            assert.approximately(act, exp, 1e-9, 'numbers are NOT close');
            break;
        case !isFinite(act):
            assert.equal(act, exp);
            break;
        default:
            throw 'Unknown number';
    }
}
