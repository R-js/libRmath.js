import * as fs from 'fs';

const matchNaN = /^(\-|\+)?NaN$/i;
const matchInf = /^(\-|\+)?Inf$/i;

export function loadData(fullPath: string, sep = /,/, ...columns: number[]) {
    const lines = fs
        .readFileSync(fullPath, 'utf8')
        .split(/\n/)
        .filter((s) => {
            if (s[0] === '#') {
                return false;
            }
            if ('\r\n\t'.includes(s)) {
                return false;
            }
            if (!s) {
                return false;
            }
            return true;
        });
    const result = Array.from({ length: columns.length }).map(() => new Float64Array(lines.length));
    // create xy array of Float64Array
    lines.forEach((v, i) => {
        const cols = v.split(sep).filter((f) => f);
        for (let j = 0; j < columns.length; j++) {
            if (columns[j] >= cols.length) {
                continue;
            }
            const tps = result[j];
            const _vs = cols[columns[j]];
            if (_vs.match(matchNaN)) {
                tps[i] = NaN;
                continue;
            }
            const rc = _vs.match(matchInf);
            if (rc) {
                if (rc[1] === '-') {
                    tps[i] = -Infinity;
                } else {
                    tps[i] = Infinity;
                }
                continue;
            }
            tps[i] = parseFloat(_vs);
        }
    });
    return result;
}
