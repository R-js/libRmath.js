import { resolve } from 'path';
import { pchisq } from '..';

import { loadData } from '@common/load';
import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('pchisq', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    it('ranges x ∊ [0, 40, step 0.5] df=13', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pchisq.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pchisq(_x, 13));
        expect(actual).toEqualFloatingPointBinary(y, 46);
    });
    it('ranges x ∊ [0, 40, step 0.5] df=13, log=true', async () => {
        const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'pchisq2.R'), /\s+/, 1, 2);
        const actual = x.map((_x) => pchisq(_x, 13, undefined, true, true));
        expect(actual).toEqualFloatingPointBinary(y, 45);
    });
});
