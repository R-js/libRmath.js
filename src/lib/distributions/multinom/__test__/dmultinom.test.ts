import { dmultinom, dmultinomLikeR } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('dmultinom', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input check and edge cases', () => {
        it('non equal arrays x, prob, x=[1,2], prob=[0.4]', () => {
            const x = new Float32Array([1, 2]);
            const prob = new Float32Array([0.4]);
            const ans = dmultinom(x, prob);
            expect(ans).toBeNaN();
            expect(() => dmultinomLikeR(x, prob)).toThrowError();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dmultinom',
                    formatter: 'x[] and prob[] must be equal length vectors.',
                    args: []
                },
                {
                    prefix: '',
                    namespace: 'dmultinom',
                    formatter: 'x[] and prob[] must be equal length vectors.',
                    args: []
                }
            ]);
        });
        it('probabilities must be finite, positive, and not all 0', () => {
            const x = new Float32Array([1, 2]);
            const prob = new Float32Array([0.4, NaN]);
            const ans1 = dmultinom(x, prob);
            expect(ans1).toBeNaN();

            prob[0] = 0;
            prob[1] = 0;
            const ans2 = dmultinom(x, prob);
            expect(ans2).toBeNaN();

            prob[0] = -1;
            const ans3 = dmultinom(x, prob);
            expect(ans3).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dmultinom',
                    formatter: 'probabilities must be finite, non-negative and not all 0',
                    args: []
                },
                {
                    prefix: '',
                    namespace: 'dmultinom',
                    formatter: 'probabilities must be finite, non-negative and not all 0',
                    args: []
                },
                {
                    prefix: '',
                    namespace: 'dmultinom',
                    formatter: 'probabilities must be finite, non-negative and not all 0',
                    args: []
                }
            ]);
        });
        it('some x[i] are negative', () => {
            const x = new Float32Array([1, 2, -3]);
            const prob = new Float32Array([0.4, 0.2, 0.4]);
            const ans1 = dmultinom(x, prob);
            expect(ans1).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'dmultinom',
                    formatter: "'x' must be non-negative (and finite)",
                    args: []
                }
            ]);
        });
        it('prob[i] = 0 cannot have a x[i] bin that is nonzero, result p = 0', () => {
            const x = new Float32Array([1, 2, 3]);
            const prob = new Float32Array([0.4, 0.2, 0.4]);
            //
            prob[1] = 0;
            const ans1 = dmultinom(x, prob);
            expect(ans1).toBe(0);
            const ans2 = dmultinom(x, prob, true);
            expect(ans2).toBe(-Infinity);
            //
        });
    });
    describe('fidelity', () => {
        it('for some i, prob[i] = 0 aswell as x[i]', () => {
            const x = new Float32Array([1, 0, 3]);
            const prob = new Float32Array([0.4, 0, 0.8]);
            //
            const ans1 = dmultinom(x, prob);
            // 32 bit floating point, so
            expect(ans1).toEqualFloatingPointBinary(0.3950617283950616, 19);
            //
            const ans2 = dmultinom(x, prob, true);
            expect(ans2).toEqualFloatingPointBinary(-0.92871325187271259, 21);

            const ans3 = dmultinomLikeR(x, prob, true);
            expect(ans3).toEqualFloatingPointBinary(-0.92871325187271259, 21);
        });
    });
});
