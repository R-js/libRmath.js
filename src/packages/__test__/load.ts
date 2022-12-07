import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const matchNaN = /^(-|\+)?NaN$/i;
const matchInf = /^(-|\+)?Inf$/i;

export function loadData(fullPath: string, sep = /,/, ...columns: number[]): Promise<Float64Array[]> {
    let resolve: (value: Float64Array[] | PromiseLike<Float64Array[]>) => void

    const reader = createInterface({
        input: createReadStream(fullPath, { encoding: 'utf8' }),
    });
    const lines: string[] = [];
    reader.on('line', (input: string) => {
        if (input[0] === '#') {
            return;
        }
        if ('\r\n\t'.includes(input)) {
            return false;
        }
        if (!input) {
            return false;
        }
        lines.push(input);
    });
    reader.on('close', () => {
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
                if (matchNaN.test(_vs)) {
                    tps[i] = NaN;
                    continue;
                }
                const rc = matchInf.exec(_vs);
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
        resolve(result);
    });
    return new Promise<Float64Array[]>((_resolve) => {
        resolve = _resolve;
    });
}
