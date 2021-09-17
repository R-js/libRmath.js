import type { NumArray } from 'lib/common/constants';
import { isArray, matchFloatType, emptyFloat64Array } from 'lib/common/constants';

export type rt = {
    rc: Float64Array| Float64Array;
    onlyA?: undefined;
} | {
    rc: Float32Array | Float64Array;
    onlyA: boolean;
};

