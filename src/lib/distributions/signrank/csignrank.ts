'use strict';

import { imin2 } from '@lib/r-func';

import { memory } from './csignrank_wasm';

// create dataView of the memory

const get64View = () => new Float64Array(memory.buffer);

export function cpu_csignrank(k: number, n: number, u: number, c: number): number {
    const w = get64View();
    if (k < 0 || k > u) return 0;
    if (k > c) k = u - k;

    if (n === 1) return 1;
    if (w[0] === 1) return w[k];
    w[0] = w[1] = 1;
    for (let j = 2; j < n + 1; ++j) {
        let i;
        const end = imin2(j * (j + 1)/ 2, c);
        for (i = end; i >= j; --i){
            w[i] += w[i - j];
        }
    }
    return w[k];
}
