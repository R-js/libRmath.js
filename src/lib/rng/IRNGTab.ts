import { IN01Type } from './in01-type';
import { IRNGType } from './irng-type';

export interface IRNGTab {
    kind: IRNGType;
    Nkind: IN01Type;
    name: string; /* print name */
    n_seed: number; /* length of seed vector */
    i_seed: Uint32Array; /* this is a pointer to an [Int32], see how we do this */
}


