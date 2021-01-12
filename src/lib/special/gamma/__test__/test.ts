import * as fs from 'fs';
import { resolve } from 'path';
import { gamma } from '../';
import '$jest-extension';

describe('gamma', function () {
    it('gamma, range [0] ', () => {
        /* load data from fixture */
        const lines = fs
            .readFileSync(resolve(__dirname, 'fixture-generation', 'fixture.R'), 'utf8')
            .split(/\n/)
            .filter((s) => s && s[0] !== '#');
        const x = new Float64Array(lines.length);
        const y = new Float64Array(lines.length);
        const actual = new Float64Array(lines.length);
        // create xy array of Float64Array
        lines.forEach((v, i) => {
            const [_x, _y] = v.split(',').map(parseFloat);
            x[i] = _x;
            y[i] = _y;
            actual[i] = gamma(_x);
        });
        expect(actual).toEqualFloatingPointBinary(y);
    });
});
