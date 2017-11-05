import { IRNGType } from './IRNGType';
import { IN01Type } from './IN01Type';

export interface IRNGTab {
    kind: IRNGType;
    Nkind: IN01Type;
    name: string; /* print name */
    n_seed: number; /* length of seed vector */
    i_seed: number[]; /* this is a pointer to an [Int32], see how we do this */
}
